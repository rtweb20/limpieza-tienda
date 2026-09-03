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

  codigoInput.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();          // ← evita que el formulario se envíe/recargue

    const codigo = codigoInput.value.trim();
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
  });

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
