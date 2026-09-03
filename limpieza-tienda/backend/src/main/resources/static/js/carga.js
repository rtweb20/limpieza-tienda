/* ============================================================================
   AROMA A LIMPIO — Carga de productos con lector de código de barras
   ----------------------------------------------------------------------------
   Flujo:
   1. El lector USB/Bluetooth "escribe" el código y pulsa Enter.
   2. El Enter NO recarga la página: se consulta si el código ya existe y el
      foco pasa automáticamente al campo "Nombre".
   3. Al guardar: si el código es nuevo se crea el producto; si existe, se
      actualizan los datos y se SUMA el stock.
   4. Soporte completo Drag & Drop, selección manual y pegado (Ctrl+V) de fotos.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const TOKEN_KEY = 'admin-token-limpieza';
  const token = localStorage.getItem(TOKEN_KEY);

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
  const resultado = $('#resultado');
  const btnGuardar = $('#btnGuardar');

  // Elementos de la Dropzone (Drag and Drop)
  const dropzone = $('#dropzone');
  const dropEmpty = $('#dropEmpty');
  const dropPreview = $('#dropPreview');
  const imgPreview = $('#imgPreview');
  const previewFilename = $('#previewFilename');
  const previewFilesize = $('#previewFilesize');
  const previewTag = $('#previewTag');
  const btnExplorar = $('#btnExplorar');
  const btnCambiarImagen = $('#btnCambiarImagen');
  const btnQuitarImagen = $('#btnQuitarImagen');

  let archivoFotoSeleccionado = null;
  let fotoUrlActual = null;

  // ----------------------------- Utilidades --------------------------------

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function beep(ok) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      beep._ctx = beep._ctx || new Ctx();
      const ctx = beep._ctx;
      if (ctx.state === 'suspended') ctx.resume();
      const tonos = ok ? [880] : [330, 262];
      tonos.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.start(t);
        o.stop(t + 0.14);
      });
    } catch (_) {}
  }

  function normalizarCodigo(codigo) {
    codigo = (codigo || '').trim();
    if (/^\d{12}$/.test(codigo)) return '0' + codigo;
    return codigo;
  }

  function formatearBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function validarEsImagen(file) {
    if (!file) return false;
    if (file.type && file.type.startsWith('image/')) return true;
    const ext = (file.name || '').split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext);
  }

  async function comprimirImagen(file) {
    try {
      if (!file || !file.type || !file.type.startsWith('image/')) return file;
      if (file.type === 'image/gif') return file;
      if (typeof createImageBitmap !== 'function') return file;

      const bitmap = await createImageBitmap(file);
      const MAX = 1000;
      const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * escala));
      const h = Math.max(1, Math.round(bitmap.height * escala));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);
      if (bitmap.close) bitmap.close();

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
      if (!blob) return file;
      return new File([blob], (file.name ? file.name.replace(/\.[^.]+$/, '') : 'foto') + '.jpg', { type: 'image/jpeg' });
    } catch (_) {
      return file;
    }
  }

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

  // ----------------- Gestión de la Dropzone (Drag & Drop) -------------------

  function mostrarFotoSeleccionada(file) {
    if (!validarEsImagen(file)) {
      toast('⚠️ El archivo debe ser una imagen (JPG, PNG, WEBP, GIF)');
      beep(false);
      return;
    }
    archivoFotoSeleccionado = file;
    fotoUrlActual = null;

    const objUrl = URL.createObjectURL(file);
    imgPreview.src = objUrl;
    previewFilename.textContent = file.name || 'foto.jpg';
    previewFilename.title = file.name || 'foto.jpg';
    previewFilesize.textContent = formatearBytes(file.size);
    previewTag.textContent = '✅ Nueva foto lista';
    previewTag.className = 'preview-tag';

    dropEmpty.style.display = 'none';
    dropPreview.style.display = 'flex';
  }

  function mostrarFotoExistente(url, nombreProd) {
    archivoFotoSeleccionado = null;
    fotoUrlActual = url;

    imgPreview.src = url;
    previewFilename.textContent = nombreProd ? `Foto de «${nombreProd}»` : 'Foto en catálogo';
    previewFilename.title = url;
    previewFilesize.textContent = 'Guardada en catálogo';
    previewTag.textContent = '📦 Foto actual';
    previewTag.className = 'preview-tag actual';

    dropEmpty.style.display = 'none';
    dropPreview.style.display = 'flex';
  }

  function resetearFoto() {
    archivoFotoSeleccionado = null;
    fotoUrlActual = null;
    imagenInput.value = '';
    imgPreview.src = '';
    dropPreview.style.display = 'none';
    dropEmpty.style.display = 'flex';
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btnQuitarImagen')) return;
    if (dropEmpty.style.display !== 'none' || e.target.closest('#btnCambiarImagen') || e.target.closest('#btnExplorar')) {
      imagenInput.click();
    }
  });

  dropzone.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === dropzone) {
      e.preventDefault();
      imagenInput.click();
    }
  });

  btnQuitarImagen.addEventListener('click', (e) => {
    e.stopPropagation();
    resetearFoto();
    toast('🗑️ Foto quitada');
  });

  btnCambiarImagen.addEventListener('click', (e) => {
    e.stopPropagation();
    imagenInput.click();
  });

  imagenInput.addEventListener('change', () => {
    const file = imagenInput.files && imagenInput.files[0];
    if (file) mostrarFotoSeleccionada(file);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');

    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      mostrarFotoSeleccionada(dt.files[0]);
      toast('🖼️ Foto cargada');
      beep(true);
      return;
    }

    if (dt) {
      const html = dt.getData('text/html');
      if (html) {
        const match = html.match(/src=["'](.*?)["']/i);
        if (match && match[1]) {
          fetchImagenWeb(match[1]);
          return;
        }
      }
      const uri = dt.getData('text/uri-list') || dt.getData('text/plain');
      if (uri && /\.(jpe?g|png|webp|gif|bmp)(\?.*)?$/i.test(uri)) {
        fetchImagenWeb(uri);
        return;
      }
    }
  });

  async function fetchImagenWeb(url) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      if (blob.type && blob.type.startsWith('image/')) {
        const ext = blob.type.split('/')[1] || 'jpg';
        const file = new File([blob], 'foto-web.' + ext, { type: blob.type });
        mostrarFotoSeleccionada(file);
        toast('🖼️ Foto cargada desde la web');
        beep(true);
      }
    } catch (_) {
      toast('⚠️ No se pudo obtener la imagen externa por restricciones de seguridad');
    }
  }

  // Pegar con Ctrl+V desde el portapapeles
  document.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          mostrarFotoSeleccionada(file);
          toast('📋 Foto pegada desde el portapapeles');
          beep(true);
          break;
        }
      }
    }
  });

  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  // ----------------------- Carga de categorías -----------------------------

  async function cargarCategorias() {
    try {
      const cats = await apiAutenticada('GET', '/api/admin/categorias');
      categoriaSelect.innerHTML = cats.map((c) =>
        `<option value="${c.id}">${c.icono ? c.icono + ' ' : ''}${c.nombre}</option>`).join('');
    } catch (e) {
      if (window.DEMO && window.DEMO.categorias) {
        categoriaSelect.innerHTML = window.DEMO.categorias.map((c) =>
          `<option value="${c.id}">${c.icono ? c.icono + ' ' : ''}${c.nombre}</option>`).join('');
      } else {
        toast('⚠️ ' + e.message);
      }
    }
  }

  // ---------- Comportamiento del lector (Enter no recarga) -----------

  let codigoExiste = false;

  async function procesarCodigo(codigo) {
    codigo = normalizarCodigo(codigo);
    if (!codigo) { nombreInput.focus(); return; }
    codigoInput.value = codigo;

    try {
      const producto = await apiAutenticada('GET',
        '/api/admin/productos/barcode/' + encodeURIComponent(codigo));

      // YA ESTÁ CARGADO
      codigoExiste = true;
      beep(false);
      const stockActual = (producto.variantes && producto.variantes[0])
        ? producto.variantes[0].stock : 0;

      nombreInput.value = producto.nombre || '';
      precioInput.value = (producto.variantes && producto.variantes[0])
        ? producto.variantes[0].precioVenta : '';
      descripcionInput.value = producto.descripcion || '';
      if (producto.categoriaId) categoriaSelect.value = String(producto.categoriaId);
      stockInput.value = '';
      stockInput.placeholder = 'Se suma al stock actual';
      btnGuardar.textContent = '➕ Sumar stock';

      if (producto.imagenUrl && !producto.imagenUrl.includes('placehold.co')) {
        mostrarFotoExistente(producto.imagenUrl, producto.nombre);
      } else {
        resetearFoto();
      }

      mostrarResultado('duplicado',
        `⛔ YA CARGADO: <strong>${producto.nombre}</strong><br>` +
        `<span style="font-weight:400;font-size:14px">Stock actual: ${stockActual} · ` +
        `si es reposición, poné la cantidad y tocá «➕ Sumar stock».</span>`);
      toast('⛔ Este producto ya está cargado');
    } catch (err) {
      if (err.status === 404) {
        // CÓDIGO NUEVO
        codigoExiste = false;
        beep(true);
        nombreInput.value = '';
        precioInput.value = '';
        descripcionInput.value = '';
        stockInput.value = '';
        stockInput.placeholder = 'Ej.: 12';
        btnGuardar.textContent = '💾 Guardar producto';
        resetearFoto();
        mostrarResultado('nuevo', '✅ CÓDIGO NUEVO — completá los datos del producto.');
      } else {
        toast('⚠️ ' + err.message);
      }
    }
    nombreInput.focus();
  }

  codigoInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    await procesarCodigo(codigoInput.value);
  });

  // --------------------- Escáner con la cámara -----------------

  const btnEscanear = $('#btnEscanear');
  const btnCancelarScan = $('#btnCancelarScan');
  const scanArea = $('#scanArea');
  const scanStatus = $('#scanStatus');

  let scanner = null;
  let stream = null;
  let detector = null;
  let rafId = null;
  let videoEl = null;
  let escaneando = false;

  function setScanStatus(msg) { if (scanStatus) scanStatus.textContent = msg; }

  const FORMATOS_1D = ['ean_13', 'ean_8', 'upc_a', 'upc_e',
                       'code_128', 'code_39', 'code_93', 'codabar', 'itf', 'qr_code'];

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

  async function iniciarEscaneo() {
    if (escaneando) return;
    escaneando = true;
    scanArea.style.display = 'block';
    setScanStatus('📷 Preparando cámara…');

    const nativo = await barcodeDetectorNativo();
    if (nativo) {
      const ok = await iniciarEscaneoNativo(nativo);
      if (ok) return;
    }

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
        if (ts - ultimo > 120) {
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
          } catch (_) {}
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
        return true;
      }
      return false;
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
          qrbox: { width: 280, height: 130 },
          aspectRatio: 1.7777,
          showTorchButtonIfSupported: true,
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
        () => {}
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

  // ------------------------------- Guardar --------------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = normalizarCodigo(codigoInput.value);
    codigoInput.value = codigo;
    const nombre = nombreInput.value.trim();
    const precio = parseFloat(precioInput.value);
    const stock = parseInt(stockInput.value, 10);
    const categoriaId = parseInt(categoriaSelect.value, 10);

    if (!codigo) { toast('⚠️ Escaneá o escribí el código de barras'); codigoInput.focus(); return; }
    if (!nombre) { toast('⚠️ Ingresá el nombre del producto'); nombreInput.focus(); return; }
    if (isNaN(precio) || precio < 0) { toast('⚠️ Ingresá un precio válido'); precioInput.focus(); return; }
    if (isNaN(stock) || stock < 0) { toast('⚠️ Ingresá un stock válido'); stockInput.focus(); return; }
    if (!categoriaId) { toast('⚠️ Elegí una categoría'); return; }

    const data = new FormData();
    data.append('codigoBarras', codigo);
    data.append('nombre', nombre);
    data.append('precio', String(precio));
    data.append('stock', String(stock));
    data.append('categoriaId', String(categoriaId));
    data.append('descripcion', descripcionInput.value.trim());

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando…';

    try {
      if (archivoFotoSeleccionado) {
        btnGuardar.textContent = 'Procesando foto…';
        const fotoComprimida = await comprimirImagen(archivoFotoSeleccionado);
        data.append('imagen', fotoComprimida);
      }

      const res = await fetch('/api/admin/carga', {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: data,
      });

      if (!res.ok) {
        let msg = 'Error ' + res.status;
        try { msg = (await res.json()).message || msg; } catch (_) {}
        throw new Error(msg);
      }

      const r = await res.json();

      const tipo = r.accion === 'CREADO' ? 'creado' : 'actualizado';
      const icono = r.accion === 'CREADO' ? '✅' : '🔄';
      beep(true);
      mostrarResultado(tipo,
        `${icono} <strong>${r.nombre}</strong> — ${r.accion === 'CREADO' ? 'creado' : 'actualizado'}.<br>` +
        `Código: ${r.codigoBarras} · Precio: $${r.precio} · Stock total: ${r.stock}`);
      toast(r.mensaje);

      form.reset();
      resetearFoto();
      stockInput.placeholder = 'Ej.: 12';
      codigoExiste = false;
      btnGuardar.textContent = '💾 Guardar producto';
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
