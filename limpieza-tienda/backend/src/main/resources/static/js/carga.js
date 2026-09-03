/* ============================================================================
   AROMA A LIMPIO — Carga de productos con lector de código de barras
   ----------------------------------------------------------------------------
   Flujo:
   1. El lector USB/Bluetooth "escribe" el código y pulsa Enter.
   2. El Enter NO recarga la página: se consulta si el código ya existe y el
      foco pasa automáticamente al campo "Nombre".
   3. Al guardar: si el código es nuevo se crea el producto; si existe, se
      actualizan los datos y se SUMA el stock.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const TOKEN_KEY = 'admin-token-limpieza';
  const token = localStorage.getItem(TOKEN_KEY);

  // Sin sesión no se puede cargar: redirigimos al login del panel.
  if (!token) {
    window.location.href = 'admin.html';
    return;
  }

  const form = $('#cargaForm');
  const codigoInput = $('#codigoBarras');
  const nombreInput = $('#nombre');
  const precioInput = $('#precio');
  const descripcionInput = $('#descripcion');
  const stockInput = $('#stock');
  const categoriaSelect = $('#categoriaId');
  const imagenInput = $('#imagen');
  const imgPreview = $('#imgPreview');
  const resultado = $('#resultado');
  const btnGuardar = $('#btnGuardar');

  // ----------------------------- Utilidades --------------------------------

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2800);
  }

  /** Petición autenticada con el token del panel. */
  async function apiAutenticada(method, path, body) {
    const options = { method, headers: { 'X-Admin-Token': token } };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(path, options);
    if (!res.ok) {
      let msg = 'Error ' + res.status;
      try { msg = (await res.json()).message || msg; } catch (_) {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  // ----------------------- Carga de categorías -----------------------------

  async function cargarCategorias() {
    try {
      const cats = await apiAutenticada('GET', '/api/admin/categorias');
      categoriaSelect.innerHTML = cats.map((c) =>
        `<option value="${c.id}">${c.icono ? c.icono + ' ' : ''}${c.nombre}</option>`).join('');
    } catch (e) {
      // Respaldo en modo demo (sin backend): usamos las categorías de ejemplo.
      if (window.DEMO && window.DEMO.categorias) {
        categoriaSelect.innerHTML = window.DEMO.categorias.map((c) =>
          `<option value="${c.id}">${c.icono ? c.icono + ' ' : ''}${c.nombre}</option>`).join('');
      } else {
        toast('⚠️ ' + e.message);
      }
    }
  }

  // ---------- Comportamiento clave del lector (Enter no recarga) -----------

  /**
   * Procesa un código de barras (venga del lector USB, del teclado o de la
   * cámara): consulta si ya existe y precarga el formulario, o lo deja limpio.
   */
  async function procesarCodigo(codigo) {
    codigo = (codigo || '').trim();
    if (!codigo) { nombreInput.focus(); return; }

    try {
      // ¿Ya existe este código?
      const producto = await apiAutenticada('GET',
        '/api/admin/productos/barcode/' + encodeURIComponent(codigo));
      // Precargamos los datos existentes para que solo haga falta confirmar.
      nombreInput.value = producto.nombre || '';
      precioInput.value = (producto.variantes && producto.variantes[0])
        ? producto.variantes[0].precioVenta : '';
      descripcionInput.value = producto.descripcion || '';
      if (producto.categoriaId) categoriaSelect.value = String(producto.categoriaId);
      stockInput.value = '';
      stockInput.placeholder = 'Se suma al stock actual';
      mostrarResultado('info',
        `🏷️ Código ya cargado: <strong>${producto.nombre}</strong>.<br>` +
        `Se actualizarán los datos y se sumará stock.`);
    } catch (err) {
      if (err.status === 404) {
        // Código nuevo: dejamos el formulario limpio y solo pasamos al nombre.
        nombreInput.value = '';
        precioInput.value = '';
        descripcionInput.value = '';
        stockInput.value = '';
        stockInput.placeholder = 'Ej.: 12';
        mostrarResultado('info', '🆕 Código nuevo: completá los datos del producto.');
      } else {
        toast('⚠️ ' + err.message);
      }
    }
    nombreInput.focus();        // ← el foco pasa automáticamente al Nombre
  }

  codigoInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();          // ← evita que el formulario se envíe/recargue
    await procesarCodigo(codigoInput.value);
  });

  // --------------------- Escáner con la cámara del celular -----------------

  const btnEscanear = $('#btnEscanear');
  const btnCancelarScan = $('#btnCancelarScan');
  const scanArea = $('#scanArea');
  const scanStatus = $('#scanStatus');

  let scanner = null;      // instancia Html5Qrcode (fallback iOS)
  let stream = null;       // MediaStream del escáner nativo
  let detector = null;     // BarcodeDetector nativo
  let rafId = null;        // requestAnimationFrame nativo
  let videoEl = null;      // <video> nativo
  let escaneando = false;

  function setScanStatus(msg) { if (scanStatus) scanStatus.textContent = msg; }

  const FORMATOS_1D = ['ean_13', 'ean_8', 'upc_a', 'upc_e',
                       'code_128', 'code_39', 'code_93', 'codabar', 'itf', 'qr_code'];

  /** Devuelve un BarcodeDetector nativo si el navegador lo soporta (Android/Chrome). */
  async function barcodeDetectorNativo() {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const soportados = await window.BarcodeDetector.getSupportedFormats();
      const usar = FORMATOS_1D.filter((f) => soportados.includes(f));
      return usar.length ? new window.BarcodeDetector({ formats: usar }) : null;
    } catch (_) {
      return null;
    }
  }

  /** Punto de entrada del botón: usa el mejor método disponible. */
  async function iniciarEscaneo() {
    if (escaneando) return;
    escaneando = true;
    scanArea.style.display = 'block';
    setScanStatus('📷 Preparando cámara…');

    // 1) Navegador moderno (Android/Chrome): escáner nativo, el mejor para 1D.
    const nativo = await barcodeDetectorNativo();
    if (nativo) {
      const ok = await iniciarEscaneoNativo(nativo);
      if (ok) return;
    }

    // 2) Fallback: html5-qrcode (iPhone/Safari y navegadores sin BarcodeDetector).
    iniciarEscaneoHtml5();
  }

  async function iniciarEscaneoNativo(detectorNativo) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const contenedor = $('#qr-reader');
      contenedor.innerHTML = '';
      videoEl = document.createElement('video');
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('muted', '');
      videoEl.style.width = '100%';
      videoEl.style.maxWidth = '340px';
      videoEl.style.borderRadius = '12px';
      contenedor.appendChild(videoEl);

      videoEl.srcObject = stream;
      await videoEl.play();

      detector = detectorNativo;
      setScanStatus('🔍 Apuntá al código de barras (buena luz, ~15 cm).');

      let ultimo = 0;
      const bucle = async (ts) => {
        if (!detector || !videoEl || !stream) return;
        if (ts - ultimo > 120) {                     // ~8 lecturas/segundo
          ultimo = ts;
          try {
            const codigos = await detector.detect(videoEl);
            if (codigos && codigos.length) {
              const texto = (codigos[0].rawValue || '').trim();
              await detenerEscaneo();
              codigoInput.value = texto;
              procesarCodigo(texto);
              return;
            }
          } catch (_) { /* fotograma sin código */ }
        }
        rafId = requestAnimationFrame(bucle);
      };
      rafId = requestAnimationFrame(bucle);
      return true;
    } catch (err) {
      detenerEscaneo();
      const detalle = (err && err.message) ? err.message : String(err);
      if (/permission|NotAllowedError|denied/i.test(detalle)) {
        setScanStatus('⚠️ Permití el acceso a la cámara y volvé a intentar.');
        toast('⚠️ Permití el acceso a la cámara');
        return true;   // ya avisamos; no pasar al fallback para no duplicar el error
      }
      return false;    // otro error: dejamos caer al fallback
    }
  }

  function iniciarEscaneoHtml5() {
    if (typeof Html5Qrcode === 'undefined') {
      setScanStatus('⚠️ Este navegador no soporta el escáner.');
      toast('⚠️ El escáner de cámara no está disponible');
      detenerEscaneo();
      return;
    }
    try {
      const contenedor = $('#qr-reader');
      contenedor.innerHTML = '';
      scanner = new Html5Qrcode('qr-reader');
      setScanStatus('🔍 Apuntá al código. Si hay poca luz, usá la linterna 💡.');

      scanner.start(
        { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        {
          fps: 10,
          qrbox: { width: 280, height: 130 },   // alargado: ideal para códigos de barras
          aspectRatio: 1.7777,
          showTorchButtonIfSupported: true,     // linterna 💡
          rememberLastUsedCamera: true,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        },
        (textoDecodificado) => {
          const texto = (textoDecodificado || '').trim();
          detenerEscaneo();
          codigoInput.value = texto;
          procesarCodigo(texto);
        },
        () => { /* fotograma sin lectura */ }
      ).catch((err) => {
        const detalle = (err && err.message) ? err.message : String(err);
        detenerEscaneo();
        if (/permission|NotAllowedError|denied/i.test(detalle)) {
          toast('⚠️ Permití el acceso a la cámara para escanear');
        } else {
          toast('⚠️ No se pudo abrir la cámara: ' + detalle);
        }
      });
    } catch (err) {
      const detalle = (err && err.message) ? err.message : String(err);
      detenerEscaneo();
      toast('⚠️ No se pudo abrir la cámara: ' + detalle);
    }
  }

  /** Apaga la cámara y limpia TODO (escáner nativo o fallback). */
  async function detenerEscaneo() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) { videoEl.srcObject = null; videoEl.remove(); videoEl = null; }
    detector = null;
    if (scanner) {
      try { await scanner.stop(); scanner.clear(); } catch (_) {}
      scanner = null;
    }
    scanArea.style.display = 'none';
    escaneando = false;
  }

  btnEscanear.addEventListener('click', iniciarEscaneo);
  btnCancelarScan.addEventListener('click', detenerEscaneo);

  // ------------------------- Vista previa de foto --------------------------

  imagenInput.addEventListener('change', () => {
    const file = imagenInput.files[0];
    if (!file) { imgPreview.style.display = 'none'; return; }
    imgPreview.src = URL.createObjectURL(file);
    imgPreview.style.display = 'block';
  });

  // ------------------------------- Guardar --------------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();          // nunca recargamos la página

    const codigo = codigoInput.value.trim();
    const nombre = nombreInput.value.trim();
    const precio = parseFloat(precioInput.value);
    const stock = parseInt(stockInput.value, 10);
    const categoriaId = parseInt(categoriaSelect.value, 10);

    // Validación simple antes de enviar
    if (!codigo) { toast('⚠️ Escaneá o escribí el código de barras'); codigoInput.focus(); return; }
    if (!nombre) { toast('⚠️ Ingresá el nombre del producto'); nombreInput.focus(); return; }
    if (isNaN(precio) || precio < 0) { toast('⚠️ Ingresá un precio válido'); precioInput.focus(); return; }
    if (isNaN(stock) || stock < 0) { toast('⚠️ Ingresá un stock válido'); stockInput.focus(); return; }
    if (!categoriaId) { toast('⚠️ Elegí una categoría'); return; }

    // FormData para enviar archivos (multipart/form-data).
    // NO seteamos Content-Type manualmente: el navegador agrega el boundary.
    const data = new FormData();
    data.append('codigoBarras', codigo);
    data.append('nombre', nombre);
    data.append('precio', String(precio));
    data.append('stock', String(stock));
    data.append('categoriaId', String(categoriaId));
    data.append('descripcion', descripcionInput.value.trim());
    if (imagenInput.files[0]) data.append('imagen', imagenInput.files[0]);

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando…';

    try {
      const res = await fetch('/api/admin/carga', {
        method: 'POST',
        headers: { 'X-Admin-Token': token },   // sin Content-Type (lo pone el navegador)
        body: data,
      });
      if (!res.ok) {
        let msg = 'Error ' + res.status;
        try { msg = (await res.json()).message || msg; } catch (_) {}
        throw new Error(msg);
      }
      const r = await res.json();

      // Feedback visual según el resultado
      const tipo = r.accion === 'CREADO' ? 'creado' : 'actualizado';
      const icono = r.accion === 'CREADO' ? '✅' : '🔄';
      mostrarResultado(tipo,
        `${icono} <strong>${r.nombre}</strong> — ${r.accion === 'CREADO' ? 'creado' : 'actualizado'}.<br>` +
        `Código: ${r.codigoBarras} · Precio: $${r.precio} · Stock total: ${r.stock}`);
      toast(r.mensaje);

      // Limpiamos y volvemos a enfocar el lector para el siguiente escaneo.
      form.reset();
      imgPreview.style.display = 'none';
      stockInput.placeholder = 'Ej.: 12';
      codigoInput.focus();
    } catch (err) {
      toast('⚠️ ' + err.message);
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = '💾 Guardar producto';
    }
  });

  function mostrarResultado(tipo, html) {
    resultado.className = tipo;
    resultado.innerHTML = html;
  }

  // ------------------------------- Arranque -------------------------------

  cargarCategorias();
})();
