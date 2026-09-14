/* ============================================================================
   AROMA A LIMPIO — Lógica del Panel de Administración
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const money = (v) => '$ ' + new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(Number(v || 0));

  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3000);
  }

  function fallbackImg(img) {
    if (!img) return;
    const src = img.getAttribute('src') || '';
    const cod = (img.dataset && img.dataset.cod) || '';
    const slug = (img.dataset && img.dataset.slug) || '';

    const intentos = [];
    const urlCod = '/img/fotos/' + cod + '.jpg';
    const urlSlug = '/img/fotos/' + slug + '.jpg';
    if (cod && src !== urlCod) intentos.push(urlCod);
    if (slug && src !== urlSlug && intentos.indexOf(urlSlug) === -1) intentos.push(urlSlug);

    const paso = Number(img.dataset.paso || 0);
    if (paso < intentos.length) {
      img.dataset.paso = String(paso + 1);
      img.src = intentos[paso];
      return;
    }

    img.onerror = null;
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='#e0f2fe'/><text x='50' y='60' font-size='40' text-anchor='middle'>🫧</text></svg>");
  }

  let token = localStorage.getItem('admin-token-limpieza') || null;
  let modoDemo = false;

  let cacheProductos = [];
  let cacheCategorias = [];
  let cachePedidos = [];

  const demoDB = {
    categorias: (window.DEMO && window.DEMO.categorias) ? window.DEMO.categorias.map((c) => ({ ...c, activa: true, orden: 0 })) : [],
    productos: (window.DEMO && window.DEMO.productos) ? window.DEMO.productos.map((p) => ({ ...p })) : [],
    pedidos: [],
    _nextId: 1000,
  };

  async function api(method, path, body) {
    if (!modoDemo) {
      try {
        return await API.request(method, path, body, { 'X-Admin-Token': token });
      } catch (e) {
        if (e.status === 401) { logout(); throw e; }
        if (e.status) throw e;
        modoDemo = true;
        toast('⚠️ Servidor local en modo demostración');
      }
    }
    return demoApi(method, path, body);
  }

  function demoApi(method, path, body) {
    const r = (d) => Promise.resolve(d);
    if (method === 'GET' && path.endsWith('/categorias')) return r(demoDB.categorias);
    if (method === 'GET' && path.endsWith('/productos')) return r(demoDB.productos);
    if (method === 'GET' && path.endsWith('/pedidos')) return r(demoDB.pedidos);

    if (method === 'POST' && path.endsWith('/categorias')) {
      const c = { ...body, id: demoDB._nextId++, slug: body.slug || slugify(body.nombre) };
      demoDB.categorias.push(c);
      return r(c);
    }
    if (method === 'PUT' && /\/categorias\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      const i = demoDB.categorias.findIndex((c) => c.id === id);
      if (i >= 0) demoDB.categorias[i] = { ...demoDB.categorias[i], ...body, id };
      return r(demoDB.categorias[i]);
    }
    if (method === 'DELETE' && /\/categorias\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      demoDB.categorias = demoDB.categorias.filter((c) => c.id !== id);
      return r(null);
    }
    if (method === 'POST' && path.endsWith('/productos')) {
      const p = { ...body, id: demoDB._nextId++, slug: slugify(body.nombre), precioDesde: Math.min(...body.variantes.map(v => v.precio)), enOferta: body.destacado };
      demoDB.productos.push(p);
      return r(p);
    }
    if (method === 'PUT' && /\/productos\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      const i = demoDB.productos.findIndex((p) => p.id === id);
      if (i >= 0) demoDB.productos[i] = { ...demoDB.productos[i], ...body, id, precioDesde: Math.min(...body.variantes.map(v => v.precio)) };
      return r(demoDB.productos[i]);
    }
    if (method === 'DELETE' && /\/productos\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      demoDB.productos = demoDB.productos.filter((p) => p.id !== id);
      return r(null);
    }
    if (method === 'DELETE' && path.endsWith('/productos')) {
      const n = demoDB.productos.length;
      demoDB.productos = [];
      return r({ eliminados: n, mensaje: 'Se eliminaron ' + n + ' productos.' });
    }
    if (method === 'PATCH' && /\/pedidos\/\d+\/estado$/.test(path)) {
      const id = Number(path.split('/').pop().split('/')[0]);
      const p = demoDB.pedidos.find((x) => x.id === id);
      if (p) p.estado = body.estado;
      return r(p);
    }
    return r(null);
  }

  function slugify(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  async function login(e) {
    e.preventDefault();
    const username = $('#username').value.trim();
    const password = $('#password').value;
    const errEl = $('#loginError');
    errEl.textContent = '';

    try {
      let resp;
      try {
        resp = await API.post('/api/admin/login', { username, password });
        modoDemo = false;
      } catch (err) {
        if (err.status) throw err;
        resp = window.DEMO ? DEMO.login(username, password) : { token: 'demo' };
        modoDemo = true;
      }
      token = resp.token;
      localStorage.setItem('admin-token-limpieza', token);
      mostrarPanel();
    } catch (err) {
      errEl.textContent = err.message || 'Credenciales incorrectas';
    }
  }

  function logout() {
    token = null;
    localStorage.removeItem('admin-token-limpieza');
    mostrarLogin();
  }

  function mostrarLogin() {
    $('#loginView').style.display = 'flex';
    $('#adminView').style.display = 'none';
  }

  function mostrarPanel() {
    $('#loginView').style.display = 'none';
    $('#adminView').style.display = 'block';
    actualizarMetricas();
    activarTab('productos');
  }

  async function actualizarMetricas() {
    try {
      const [prods, cats, pedidos] = await Promise.all([
        api('GET', '/api/admin/productos'),
        api('GET', '/api/admin/categorias'),
        api('GET', '/api/admin/pedidos'),
      ]);

      cacheProductos = prods || [];
      cacheCategorias = cats || [];
      cachePedidos = pedidos || [];

      $('#statProds').textContent = cacheProductos.length;
      $('#statCats').textContent = cacheCategorias.length;
      $('#statPedidos').textContent = cachePedidos.length;
      $('#statOfertas').textContent = cacheProductos.filter(p => p.destacado).length;

      $('#tabCountProds').textContent = cacheProductos.length;
      $('#tabCountCats').textContent = cacheCategorias.length;
      $('#tabCountPedidos').textContent = cachePedidos.length;

      poblarFiltroCategorias(cacheCategorias);
      actualizarIndicadoresStock();
    } catch (_) {}
  }

  function poblarFiltroCategorias(cats) {
    ['#prodFilterCat', '#stockFilterCat'].forEach((selector) => {
      const sel = $(selector);
      if (!sel) return;
      const currentVal = sel.value;
      sel.innerHTML = '<option value="">Todas las categorías</option>' +
        cats.map(c => `<option value="${c.id}">${c.icono || '🏷️'} ${c.nombre}</option>`).join('');
      if (currentVal) sel.value = currentVal;
    });
  }

  function activarTab(tab) {
    $$('.tab-btn').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    $$('.panel-section').forEach((p) => p.style.display = 'none');
    
    const panel = $('#panel-' + tab);
    if (panel) panel.style.display = 'block';

    if (tab === 'productos') cargarProductos();
    if (tab === 'stock') cargarStock();
    if (tab === 'categorias') cargarCategorias();
    if (tab === 'multimedia') cargarMedios();
    if (tab === 'pedidos') cargarPedidos();
  }

  /* ------------------------------------------------------------------------
     STOCK — vista de solo lectura para que el dueño vea cuánto le queda de
     cada producto (por presentación) y si conviene comprar o no.
     ------------------------------------------------------------------------ */

  function getUmbral() {
    const v = Number(localStorage.getItem('admin-stock-umbral'));
    return Number.isFinite(v) && v >= 0 ? v : 5;
  }

  function setUmbral(v) {
    localStorage.setItem('admin-stock-umbral', String(Math.max(0, Number(v) || 0)));
  }

  function estadoStock(stock, umbral) {
    const s = Number(stock || 0);
    if (s <= 0) return 'sin-stock';
    if (s <= umbral) return 'bajo';
    return 'ok';
  }

  function etiquetaEstado(estado) {
    if (estado === 'sin-stock') return { icon: '🔴', text: 'Sin stock — ¡Comprar ya!', cls: 'sin-stock' };
    if (estado === 'bajo') return { icon: '🟠', text: 'Stock bajo — Comprar', cls: 'bajo' };
    return { icon: '🟢', text: 'Stock OK', cls: 'ok' };
  }

  function buildStockRows() {
    const rows = [];
    cacheProductos.forEach((p) => {
      const vars = (p.variantes && p.variantes.length) ? p.variantes : [{ presentacion: 'Unidad', stock: 0 }];
      vars.forEach((v) => {
        rows.push({
          productoId: p.id,
          nombre: p.nombre,
          presentacion: v.presentacion || 'Unidad',
          categoriaId: p.categoriaId,
          categoriaNombre: p.categoriaNombre,
          categoriaIcono: p.categoriaIcono,
          codigoBarras: p.codigoBarras,
          activo: p.activo,
          stock: Number(v.stock || 0),
        });
      });
    });
    return rows;
  }

  function actualizarIndicadoresStock() {
    const umbral = getUmbral();
    const todas = buildStockRows().map((r) => estadoStock(r.stock, umbral));
    const paraComprar = todas.filter((e) => e !== 'ok').length;
    $('#tabCountStock').textContent = todas.length;
    $('#statBajoStock').textContent = paraComprar;
  }

  function renderStockFiltrado() {
    const searchVal = ($('#stockSearch').value || '').trim().toLowerCase();
    const estadoVal = $('#stockFilterEstado').value;
    const catVal = $('#stockFilterCat').value;
    const umbral = getUmbral();

    $('#clearStockSearch').style.display = searchVal ? 'block' : 'none';

    const todasLasFilas = buildStockRows().map((r) => ({ ...r, estado: estadoStock(r.stock, umbral) }));
    const total = todasLasFilas.length;

    let rows = todasLasFilas;
    if (searchVal) {
      rows = rows.filter((r) =>
        (r.nombre || '').toLowerCase().includes(searchVal) ||
        (r.presentacion || '').toLowerCase().includes(searchVal) ||
        (r.categoriaNombre || '').toLowerCase().includes(searchVal) ||
        (r.codigoBarras || '').toLowerCase().includes(searchVal));
    }
    if (catVal) rows = rows.filter((r) => String(r.categoriaId) === String(catVal));
    if (estadoVal) rows = rows.filter((r) => r.estado === estadoVal);

    rows.sort((a, b) => a.stock - b.stock || (a.nombre || '').localeCompare(b.nombre || ''));

    const nSin = todasLasFilas.filter((r) => r.estado === 'sin-stock').length;
    const nBajo = todasLasFilas.filter((r) => r.estado === 'bajo').length;
    const nOk = todasLasFilas.filter((r) => r.estado === 'ok').length;
    $('#stockSummaryRow').innerHTML = `
      <div class="stock-mini-card sin-stock"><strong>${nSin}</strong><span>🔴 Sin stock</span></div>
      <div class="stock-mini-card bajo"><strong>${nBajo}</strong><span>🟠 Stock bajo</span></div>
      <div class="stock-mini-card ok"><strong>${nOk}</strong><span>🟢 Stock OK</span></div>
      <div class="stock-mini-card total"><strong>${total}</strong><span>📦 Presentaciones totales</span></div>`;

    actualizarIndicadoresStock();

    const tbody = $('#stockList');
    const emptyState = $('#stockEmptyState');
    const countText = $('#stockCountText');

    if (!rows.length) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      countText.textContent = `0 de ${total} presentaciones`;
      return;
    }

    emptyState.style.display = 'none';
    countText.textContent = `Mostrando ${rows.length} de ${total} presentaciones`;

    tbody.innerHTML = rows.map((r) => {
      const et = etiquetaEstado(r.estado);
      const catHtml = r.categoriaNombre
        ? `<span class="cat-pill">${r.categoriaIcono || '🏷️'} ${r.categoriaNombre}</span>`
        : '<span style="color:var(--admin-text-muted);font-size:12px;">—</span>';
      const barcodeHtml = r.codigoBarras
        ? `<span class="barcode-pill">🏷️ ${r.codigoBarras}</span>`
        : '<span style="color:var(--admin-text-muted);font-size:12px;">—</span>';

      return `
        <tr>
          <td>
            <span class="prod-name">${r.nombre}</span>
            ${r.activo ? '' : ' <small style="color:var(--admin-text-muted);">(inactivo)</small>'}
          </td>
          <td>${r.presentacion}</td>
          <td>${catHtml}</td>
          <td>${barcodeHtml}</td>
          <td style="text-align:center;"><strong class="stock-num ${et.cls}">${r.stock}</strong></td>
          <td><span class="badge-stock ${et.cls}">${et.icon} ${et.text}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="btn-action edit" data-editar-stock="${r.productoId}" title="Editar producto y actualizar stock">✏️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  async function cargarStock() {
    if (!cacheProductos.length) {
      const prods = await api('GET', '/api/admin/productos');
      cacheProductos = prods || [];
    }
    $('#stockUmbral').value = getUmbral();
    renderStockFiltrado();
  }

  function exportarStockCSV() {
    const umbral = getUmbral();
    const rows = buildStockRows().map((r) => ({ ...r, estado: estadoStock(r.stock, umbral) }));
    rows.sort((a, b) => a.stock - b.stock || (a.nombre || '').localeCompare(b.nombre || ''));

    const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const encabezado = ['Producto', 'Presentación', 'Categoría', 'Código de Barras', 'Stock', 'Estado'];
    const lineas = [encabezado.map(esc).join(';')];

    rows.forEach((r) => {
      const et = etiquetaEstado(r.estado);
      lineas.push([r.nombre, r.presentacion, r.categoriaNombre || '', r.codigoBarras || '', r.stock, et.text]
        .map(esc).join(';'));
    });

    const csv = '\uFEFF' + lineas.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `stock-aroma-a-limpio-${fecha}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('⬇️ Lista de stock exportada');
  }

  async function cargarCategorias() {
    const cats = await api('GET', '/api/admin/categorias');
    cacheCategorias = cats || [];
    $('#tabCountCats').textContent = cacheCategorias.length;
    $('#statCats').textContent = cacheCategorias.length;
    poblarFiltroCategorias(cacheCategorias);

    $('#catList').innerHTML = cats.map((c) => `
      <tr>
        <td style="font-size: 20px; text-align: center;">${c.icono || '🏷️'}</td>
        <td><strong>${c.nombre}</strong></td>
        <td><code class="barcode-pill">/${c.slug}</code></td>
        <td><span style="font-weight:700; color:var(--admin-text-muted);">${c.orden || 0}</span></td>
        <td><span class="badge-status ${c.activa ? 'active' : 'inactive'}">${c.activa ? '🟢 Activa' : '⚪ Inactiva'}</span></td>
        <td><span class="badge-oferta-pill" style="${c.destacada ? '' : 'display:none'}">🔥 Destacada</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-action edit" data-editar-cat="${c.id}" title="Editar categoría">✏️</button>
            <button class="btn-action delete" data-borrar-cat="${c.id}" title="Eliminar categoría">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function abrirCatModal(cat) {
    $('#catModalTitle').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
    $('#catId').value = cat ? cat.id : '';
    $('#catNombre').value = cat ? cat.nombre : '';
    $('#catSlug').value = cat ? cat.slug : '';
    $('#catIcono').value = cat ? (cat.icono || '') : '';
    $('#catOrden').value = cat ? (cat.orden || 0) : 0;
    $('#catActiva').checked = cat ? !!cat.activa : true;
    $('#catDestacada').checked = cat ? !!cat.destacada : false;
    $('#catModal').classList.add('open');
    $('#catOverlay').classList.add('open');
  }

  function cerrarCatModal() {
    $('#catModal').classList.remove('open');
    $('#catOverlay').classList.remove('open');
  }

  async function guardarCategoria(e) {
    e.preventDefault();
    const id = $('#catId').value;
    const body = {
      nombre: $('#catNombre').value.trim(),
      slug: $('#catSlug').value.trim() || null,
      icono: $('#catIcono').value.trim() || null,
      orden: Number($('#catOrden').value || 0),
      activa: $('#catActiva').checked,
      destacada: $('#catDestacada').checked,
    };
    try {
      if (id) await api('PUT', '/api/admin/categorias/' + id, body);
      else await api('POST', '/api/admin/categorias', body);
      cerrarCatModal();
      cargarCategorias();
      actualizarMetricas();
      toast('✅ Categoría guardada con éxito');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
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

  const adminDropzone = $('#adminDropzone');
  const adminDropEmpty = $('#adminDropEmpty');
  const adminDropPreview = $('#adminDropPreview');
  const adminImgPreview = $('#adminImgPreview');
  const adminPreviewFilename = $('#adminPreviewFilename');
  const adminPreviewFilesize = $('#adminPreviewFilesize');
  const adminPreviewTag = $('#adminPreviewTag');
  const adminImagenFile = $('#adminImagenFile');
  const prodImagen = $('#prodImagen');
  const adminBtnExplorar = $('#adminBtnExplorar');
  const adminBtnCambiar = $('#adminBtnCambiar');
  const adminBtnQuitar = $('#adminBtnQuitar');
  const prodSubmitBtn = $('#btnGuardarProd');

  function mostrarAdminFotoUrl(url, nombre) {
    if (!url) {
      resetearAdminFoto();
      return;
    }
    adminImgPreview.src = url;
    adminPreviewFilename.textContent = nombre ? `Foto: ${nombre}` : 'Foto del producto';
    adminPreviewFilename.title = url;
    
    if (url.startsWith('data:')) {
      adminPreviewFilesize.textContent = 'Imagen local';
      adminPreviewTag.textContent = '✅ Nueva foto';
    } else if (url.startsWith('/api/imagen/') || url.startsWith('/uploads/')) {
      adminPreviewFilesize.textContent = 'Guardada en catálogo';
      adminPreviewTag.textContent = '📦 Foto actual';
    } else {
      adminPreviewFilesize.textContent = 'URL web';
      adminPreviewTag.textContent = '🌐 Foto online';
    }

    adminDropEmpty.style.display = 'none';
    adminDropPreview.style.display = 'flex';
  }

  function resetearAdminFoto() {
    adminImagenFile.value = '';
    prodImagen.value = '';
    adminImgPreview.src = '';
    adminDropPreview.style.display = 'none';
    adminDropEmpty.style.display = 'flex';
  }

  async function procesarArchivoAdminFoto(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast('⚠️ El archivo debe ser una imagen (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (prodSubmitBtn) {
      prodSubmitBtn.disabled = true;
      prodSubmitBtn.textContent = '⏳ Subiendo foto al servidor…';
    }
    toast('⏳ Optimizando y subiendo foto…');

    try {
      const fotoComprimida = await comprimirImagen(file);

      if (!modoDemo && token) {
        const formData = new FormData();
        formData.append('imagen', fotoComprimida);
        const res = await fetch('/api/admin/imagen', {
          method: 'POST',
          headers: { 'X-Admin-Token': token },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            prodImagen.value = data.url;
            mostrarAdminFotoUrl(data.url, file.name);
            toast('✅ Foto subida exitosamente');
            return;
          }
        } else {
          let errorMsg = 'Error al subir foto';
          try { errorMsg = (await res.json()).message || errorMsg; } catch (_) {}
          throw new Error(errorMsg);
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        prodImagen.value = dataUrl;
        mostrarAdminFotoUrl(dataUrl, file.name);
        toast('✅ Foto cargada');
      };
      reader.readAsDataURL(fotoComprimida);

    } catch (err) {
      toast('⚠️ ' + (err.message || 'Error al procesar imagen'));
    } finally {
      if (prodSubmitBtn) {
        prodSubmitBtn.disabled = false;
        prodSubmitBtn.textContent = 'Guardar Producto';
      }
    }
  }

  if (adminDropzone) {
    adminDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#adminBtnQuitar')) return;
      if (adminDropEmpty.style.display !== 'none' || e.target.closest('#adminBtnCambiar') || e.target.closest('#adminBtnExplorar')) {
        adminImagenFile.click();
      }
    });

    adminBtnQuitar.addEventListener('click', (e) => {
      e.stopPropagation();
      resetearAdminFoto();
      toast('🗑️ Imagen quitada');
    });

    adminBtnCambiar.addEventListener('click', (e) => {
      e.stopPropagation();
      adminImagenFile.click();
    });

    adminImagenFile.addEventListener('change', () => {
      const file = adminImagenFile.files && adminImagenFile.files[0];
      if (file) procesarArchivoAdminFoto(file);
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      adminDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        adminDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'dragend'].forEach((eventName) => {
      adminDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        adminDropzone.classList.remove('dragover');
      });
    });

    adminDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      adminDropzone.classList.remove('dragover');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        procesarArchivoAdminFoto(dt.files[0]);
      }
    });

    prodImagen.addEventListener('input', () => {
      const val = prodImagen.value.trim();
      if (val) mostrarAdminFotoUrl(val, 'URL');
      else resetearAdminFoto();
    });
  }

  document.addEventListener('paste', (e) => {
    const modal = $('#prodModal');
    if (!modal || !modal.classList.contains('open')) return;
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          procesarArchivoAdminFoto(file);
          toast('📋 Foto pegada desde el portapapeles');
          break;
        }
      }
    }
  });

  function renderProductosFiltrados() {
    const searchVal = ($('#prodSearch').value || '').trim().toLowerCase();
    const catVal = $('#prodFilterCat').value;
    const statusVal = $('#prodFilterStatus').value;

    $('#clearSearch').style.display = searchVal ? 'block' : 'none';

    const filtrados = cacheProductos.filter((p) => {
      if (searchVal) {
        const matchNombre = (p.nombre || '').toLowerCase().includes(searchVal);
        const matchCodigo = (p.codigoBarras || '').toLowerCase().includes(searchVal);
        const matchVars = (p.variantes || []).some(v => (v.presentacion || '').toLowerCase().includes(searchVal));
        if (!matchNombre && !matchCodigo && !matchVars) return false;
      }
      if (catVal && String(p.categoriaId) !== String(catVal)) return false;
      if (statusVal === 'activo' && !p.activo) return false;
      if (statusVal === 'inactivo' && p.activo) return false;
      if (statusVal === 'oferta' && !p.destacado) return false;
      return true;
    });

    const tbody = $('#prodList');
    const emptyState = $('#prodEmptyState');
    const countText = $('#prodCountText');

    if (filtrados.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      countText.textContent = `0 de ${cacheProductos.length} productos`;
      return;
    }

    emptyState.style.display = 'none';
    countText.textContent = `Mostrando ${filtrados.length} de ${cacheProductos.length} productos`;

    tbody.innerHTML = filtrados.map((p) => {
      const varsHtml = (p.variantes && p.variantes.length)
        ? `<div class="variants-tag-list">
             ${p.variantes.map(v => `
               <span class="variant-tag">
                 ${v.presentacion || 'Unidad'} <span class="v-price">${money(v.precioVenta || v.precio)}</span>
               </span>`).join('')}
           </div>`
        : '<span style="color:var(--admin-text-muted);font-size:12px;">Sin variantes</span>';

      const barcodeHtml = p.codigoBarras
        ? `<span class="barcode-pill">🏷️ ${p.codigoBarras}</span>`
        : '<span style="color:var(--admin-text-muted);font-size:12px;">—</span>';

      const catHtml = p.categoriaNombre
        ? `<span class="cat-pill">${p.categoriaIcono || '🏷️'} ${p.categoriaNombre}</span>`
        : '<span style="color:var(--admin-text-muted);font-size:12px;">—</span>';

      return `
        <tr>
          <td>
            <img class="table-thumb" src="${p.imagenUrl || ''}" alt="" data-cod="${p.codigoBarras || ''}" data-slug="${p.slug || ''}" onerror="window.__fallbackImg?.(this)">
          </td>
          <td>
            <div class="prod-title-wrap">
              <span class="prod-name">${p.nombre}</span>
              ${p.descripcion ? `<span class="prod-desc-preview">${p.descripcion}</span>` : ''}
              ${varsHtml}
            </div>
          </td>
          <td>${barcodeHtml}</td>
          <td>${catHtml}</td>
          <td>
            <span class="price-main">${money(p.precioDesde)}</span>
          </td>
          <td>
            <div class="status-badge-wrap">
              <span class="badge-status ${p.activo ? 'active' : 'inactive'}">
                ${p.activo ? '🟢 Activo' : '⚪ Inactivo'}
              </span>
              ${p.destacado ? '<span class="badge-oferta-pill">🔥 Oferta</span>' : ''}
            </div>
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-action edit" data-editar-prod="${p.id}" title="Editar producto">✏️</button>
              <button class="btn-action delete" data-borrar-prod="${p.id}" title="Eliminar producto">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  async function cargarProductos() {
    const prods = await api('GET', '/api/admin/productos');
    cacheProductos = prods || [];
    $('#tabCountProds').textContent = cacheProductos.length;
    $('#statProds').textContent = cacheProductos.length;
    $('#statOfertas').textContent = cacheProductos.filter(p => p.destacado).length;
    actualizarIndicadoresStock();
    renderProductosFiltrados();
    renderStockFiltrado();
  }

  async function abrirProdModal(id) {
    const cats = cacheCategorias.length ? cacheCategorias : (await api('GET', '/api/admin/categorias'));
    const prod = id ? (cacheProductos.find((p) => p.id === id) || (await api('GET', '/api/admin/productos')).find((p) => p.id === id)) : null;

    $('#prodModalTitle').textContent = prod ? 'Editar producto' : 'Nuevo producto';
    $('#prodId').value = prod ? prod.id : '';
    $('#prodNombre').value = prod ? prod.nombre : '';
    $('#prodDesc').value = prod ? (prod.descripcion || '') : '';
    $('#prodImagen').value = prod ? prod.imagenUrl : '';
    
    if (prod && prod.imagenUrl) {
      mostrarAdminFotoUrl(prod.imagenUrl, prod.nombre);
    } else {
      resetearAdminFoto();
    }

    $('#prodCategoria').innerHTML = cats.map((c) =>
      `<option value="${c.id}" ${prod && prod.categoriaId === c.id ? 'selected' : ''}>${c.icono || '🏷️'} ${c.nombre}</option>`).join('');
    
    $('#prodDestacado').checked = prod ? !!prod.destacado : false;
    $('#prodActivo').checked = prod ? !!prod.activo : true;

    const variantes = (prod && prod.variantes && prod.variantes.length)
      ? prod.variantes
      : [{ presentacion: 'Unidad', precio: '', precioOferta: '', stock: 20 }];
    
    $('#variantesBox').innerHTML = variantes.map((v, i) => filaVariante(v, i)).join('');

    $('#prodModal').classList.add('open');
    $('#prodOverlay').classList.add('open');
  }

  function filaVariante(v, i) {
    return `
      <div class="variant-row" data-vi="${i}">
        <input type="text" class="v-pres" placeholder="Ej: 750 ml, 2 L, Pack x3" value="${v.presentacion || ''}" required>
        <input type="number" class="v-precio" placeholder="Precio ($)" step="0.01" min="0" value="${v.precio ?? ''}" required>
        <input type="number" class="v-oferta" placeholder="Oferta (opc.)" step="0.01" min="0" value="${v.precioOferta ?? ''}">
        <input type="number" class="v-stock" placeholder="Stock" min="0" value="${v.stock ?? 20}">
        <button type="button" class="rm" data-rm="${i}" title="Eliminar variante">✕</button>
      </div>`;
  }

  function cerrarProdModal() {
    $('#prodModal').classList.remove('open');
    $('#prodOverlay').classList.remove('open');
  }

  async function guardarProducto(e) {
    e.preventDefault();
    const id = $('#prodId').value;
    const variantes = $$('#variantesBox .variant-row').map((row) => ({
      presentacion: row.querySelector('.v-pres').value.trim(),
      precio: Number(row.querySelector('.v-precio').value),
      precioOferta: row.querySelector('.v-oferta').value ? Number(row.querySelector('.v-oferta').value) : null,
      stock: Number(row.querySelector('.v-stock').value || 0),
      activa: true,
      orden: Number(row.dataset.vi) + 1,
    })).filter((v) => v.presentacion && v.precio >= 0);

    if (!variantes.length) {
      toast('⚠️ Agregá al menos una variante con precio');
      return;
    }

    const imgUrl = $('#prodImagen').value.trim() || 'https://placehold.co/600x600/EFE6D4/6B5130?text=Aroma+a+Limpio';

    const body = {
      nombre: $('#prodNombre').value.trim(),
      descripcion: $('#prodDesc').value.trim() || null,
      imagenUrl: imgUrl,
      categoriaId: Number($('#prodCategoria').value),
      destacado: $('#prodDestacado').checked,
      activo: $('#prodActivo').checked,
      variantes,
    };

    try {
      if (id) await api('PUT', '/api/admin/productos/' + id, body);
      else await api('POST', '/api/admin/productos', body);
      cerrarProdModal();
      await cargarProductos();
      actualizarMetricas();
      toast('✅ Producto guardado correctamente');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  async function cargarPedidos() {
    const pedidos = await api('GET', '/api/admin/pedidos');
    cachePedidos = pedidos || [];
    $('#tabCountPedidos').textContent = cachePedidos.length;
    $('#statPedidos').textContent = cachePedidos.length;

    const tbody = $('#pedList');
    const emptyState = $('#pedEmptyState');

    if (!cachePedidos.length) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = cachePedidos.map((p) => {
      const fecha = p.createdAt ? new Date(p.createdAt).toLocaleString('es-AR') : 'Reciente';
      const esDomicilio = p.modalidadEntrega === 'ENVIO_DOMICILIO';
      
      return `
        <tr>
          <td>
            <strong style="font-size:14px;color:var(--admin-dark);">#${p.id}</strong><br>
            <small style="color:var(--admin-text-muted);">${fecha}</small>
          </td>
          <td>
            <div class="order-client-info">
              <span class="order-client-name">${p.nombreCliente || 'Cliente'}</span>
              ${p.telefono ? `<small style="color:var(--admin-text-muted);">📞 ${p.telefono}</small>` : ''}
              ${p.direccion ? `<small style="color:var(--admin-text-muted);">📍 ${p.direccion}${p.barrio ? ` (${p.barrio})` : ''}</small>` : ''}
              <span class="order-delivery-badge ${esDomicilio ? 'domicilio' : 'retiro'}">
                ${esDomicilio ? '🛵 Envío a domicilio' : '🏪 Retiro en local'}
              </span>
            </div>
          </td>
          <td>
            ${(p.items || []).map((it) => `
              <div class="order-item-line">
                <span class="order-item-qty">${it.cantidad}x</span>
                <span>${it.productoNombre} ${it.varianteNombre ? `(${it.varianteNombre})` : ''}</span>
              </div>`).join('')}
          </td>
          <td>
            <strong style="color:#0284c7;font-size:15px;">${money(p.total)}</strong>
          </td>
          <td>
            <select class="estado-select" data-pedido="${p.id}" data-val="${p.estado || 'NUEVO'}" aria-label="Estado del pedido ${p.id}">
              ${['NUEVO', 'CONFIRMADO', 'ENTREGADO', 'CANCELADO'].map((e) =>
                `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </td>
        </tr>`;
    }).join('');
  }

  async function cambiarEstado(id, estado, selectEl) {
    try {
      if (selectEl) selectEl.dataset.val = estado;
      await api('PATCH', `/api/admin/pedidos/${id}/estado`, { estado });
      toast('✅ Estado de pedido actualizado');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  /* ------------------------------------------------------------------------
     MULTIMEDIA — foto/video del local y publicidad de marcas que se muestran
     en la home pública. El dueño los sube y edita acá.
     ------------------------------------------------------------------------ */

  let cacheMedios = [];

  function medioPreviewHtml(m) {
    if (m.formato === 'VIDEO') {
      return `<video src="${m.url}" muted playsinline preload="metadata"></video>`;
    }
    return `<img src="${m.url}" alt="${m.titulo || m.marcaNombre || 'Medio'}" loading="lazy">`;
  }

  function medioCardHtml(m) {
    const esMarca = m.destino === 'MARCA';
    return `
      <div class="medio-card" data-id="${m.id}">
        <div class="medio-preview">${medioPreviewHtml(m)}</div>
        <div class="medio-body">
          <span class="medio-tipo-badge">${m.formato === 'VIDEO' ? '🎬 Video' : '📷 Foto'}</span>
          ${esMarca ? `<input class="medio-input" type="text" maxlength="80" data-medio-field="marcaNombre" data-id="${m.id}" value="${m.marcaNombre || ''}" placeholder="Nombre de la marca">` : ''}
          <input class="medio-input" type="text" maxlength="160" data-medio-field="titulo" data-id="${m.id}" value="${m.titulo || ''}" placeholder="Título (opcional)">
          <label class="medio-activo-toggle">
            <input type="checkbox" data-medio-field="activo" data-id="${m.id}" ${m.activo !== false ? 'checked' : ''}>
            Visible en la tienda
          </label>
        </div>
        <div class="action-btn-group medio-actions">
          <button class="btn-action delete" data-borrar-medio="${m.id}" title="Eliminar">🗑️</button>
        </div>
      </div>`;
  }

  async function cargarMedios() {
    const medios = await api('GET', '/api/admin/medios');
    cacheMedios = medios || [];
    $('#tabCountMedios').textContent = cacheMedios.length;

    const locales = cacheMedios.filter((m) => m.destino === 'LOCAL');
    const marcas = cacheMedios.filter((m) => m.destino === 'MARCA');

    $('#mediosLocalGrid').innerHTML = locales.length
      ? locales.map(medioCardHtml).join('')
      : '<p class="medios-vacio">Todavía no subiste ninguna foto ni video del local.</p>';

    $('#mediosMarcaGrid').innerHTML = marcas.map(medioCardHtml).join('');
    $('#mediosMarcaEmpty').style.display = marcas.length ? 'none' : 'flex';
  }

  function actualizarAceptArchivoMedio() {
    const esVideo = $('#medioFormatoVideo').checked;
    $('#medioArchivo').setAttribute('accept', esVideo
      ? 'video/mp4,video/webm,video/quicktime'
      : 'image/jpeg,image/png,image/webp,image/gif');
  }

  function abrirMedioModal() {
    $('#medioForm').reset();
    $('#medioDestinoLocal').checked = true;
    $('#medioFormatoFoto').checked = true;
    $('#medioMarcaNombreGroup').style.display = 'none';
    $('#medioError').style.display = 'none';
    $('#medioError').textContent = '';
    actualizarAceptArchivoMedio();
    $('#medioModal').classList.add('open');
    $('#medioOverlay').classList.add('open');
  }

  function cerrarMedioModal() {
    $('#medioModal').classList.remove('open');
    $('#medioOverlay').classList.remove('open');
  }

  async function guardarMedio(e) {
    e.preventDefault();
    const destino = $('input[name="medioDestino"]:checked').value;
    const formato = $('input[name="medioFormato"]:checked').value;
    const marcaNombre = $('#medioMarcaNombre').value.trim();
    const titulo = $('#medioTitulo').value.trim();
    const archivo = $('#medioArchivo').files[0];
    const errEl = $('#medioError');
    errEl.style.display = 'none';

    if (destino === 'MARCA' && !marcaNombre) {
      errEl.textContent = 'Falta el nombre de la marca.';
      errEl.style.display = 'block';
      return;
    }
    if (!archivo) {
      errEl.textContent = 'Elegí un archivo para subir.';
      errEl.style.display = 'block';
      return;
    }

    const btn = $('#medioSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Subiendo…';

    try {
      if (modoDemo || !token) {
        throw new Error('La carga de fotos/videos necesita el servidor conectado (no funciona en modo demostración).');
      }
      const formData = new FormData();
      formData.append('destino', destino);
      formData.append('formato', formato);
      if (marcaNombre) formData.append('marcaNombre', marcaNombre);
      if (titulo) formData.append('titulo', titulo);
      formData.append('archivo', archivo);

      const res = await fetch('/api/admin/medios', {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: formData,
      });

      if (!res.ok) {
        let msg = 'No se pudo subir el archivo.';
        try { msg = (await res.json()).message || msg; } catch (_) {}
        throw new Error(msg);
      }

      cerrarMedioModal();
      await cargarMedios();
      toast('✅ Archivo subido con éxito');
    } catch (err) {
      errEl.textContent = err.message || 'No se pudo subir el archivo.';
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Subir';
    }
  }

  async function actualizarMedioCampo(id, campo, valor) {
    try {
      const body = {};
      body[campo] = valor;
      await api('PUT', '/api/admin/medios/' + id, body);
      const m = cacheMedios.find((x) => x.id === id);
      if (m) m[campo] = valor;
      toast('✅ Guardado');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  async function borrarMedio(id) {
    if (!confirm('¿Eliminar esta foto/video?')) return;
    try {
      await api('DELETE', '/api/admin/medios/' + id);
      await cargarMedios();
      toast('✅ Eliminado');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  function init() {
    window.__fallbackImg = fallbackImg;

    if (token) {
      mostrarPanel();
    } else {
      mostrarLogin();
    }

    $('#loginForm').addEventListener('submit', login);
    $('#logoutBtn').addEventListener('click', logout);

    $$('.tab-btn').forEach((t) => t.addEventListener('click', () => activarTab(t.dataset.tab)));

    $('#prodSearch').addEventListener('input', renderProductosFiltrados);
    $('#clearSearch').addEventListener('click', () => {
      $('#prodSearch').value = '';
      renderProductosFiltrados();
      $('#prodSearch').focus();
    });
    $('#prodFilterCat').addEventListener('change', renderProductosFiltrados);
    $('#prodFilterStatus').addEventListener('change', renderProductosFiltrados);

    $('#stockSearch').addEventListener('input', renderStockFiltrado);
    $('#clearStockSearch').addEventListener('click', () => {
      $('#stockSearch').value = '';
      renderStockFiltrado();
      $('#stockSearch').focus();
    });
    $('#stockFilterEstado').addEventListener('change', renderStockFiltrado);
    $('#stockFilterCat').addEventListener('change', renderStockFiltrado);
    $('#stockUmbral').addEventListener('input', () => {
      setUmbral($('#stockUmbral').value);
      renderStockFiltrado();
    });
    $('#btnExportCsv').addEventListener('click', exportarStockCSV);
    $('#btnPrintStock').addEventListener('click', () => window.print());
    $('#stockList').addEventListener('click', (e) => {
      const ed = e.target.closest('[data-editar-stock]');
      if (ed) abrirProdModal(Number(ed.dataset.editarStock));
    });

    $('#nuevaCat').addEventListener('click', () => abrirCatModal(null));
    $('#catList').addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-editar-cat]');
      const bo = e.target.closest('[data-borrar-cat]');
      if (ed) {
        const catId = Number(ed.dataset.editarCat);
        const cat = cacheCategorias.find((c) => c.id === catId);
        abrirCatModal(cat);
      }
      if (bo) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
          await api('DELETE', '/api/admin/categorias/' + bo.dataset.borrarCat);
          cargarCategorias();
          actualizarMetricas();
          toast('✅ Categoría eliminada');
        } catch (err) { toast('⚠️ ' + err.message); }
      }
    });
    $('#catOverlay').addEventListener('click', cerrarCatModal);
    $('#catForm').addEventListener('submit', guardarCategoria);

    $('#vaciarProd').addEventListener('click', async () => {
      const ok = confirm('⚠️ ¿Eliminar TODOS los productos del catálogo?\n\nEsta acción borrará todos los productos cargados para que puedas cargar la lista limpia de nuevo.');
      if (!ok) return;
      try {
        const r = await api('DELETE', '/api/admin/productos');
        await cargarProductos();
        actualizarMetricas();
        toast('🗑️ ' + (r && r.mensaje ? r.mensaje : 'Catálogo vaciado'));
      } catch (err) { toast('⚠️ ' + err.message); }
    });

    $('#nuevoProd').addEventListener('click', () => abrirProdModal(null));
    $('#prodList').addEventListener('click', (e) => {
      const ed = e.target.closest('[data-editar-prod]');
      const bo = e.target.closest('[data-borrar-prod]');
      if (ed) abrirProdModal(Number(ed.dataset.editarProd));
      if (bo) {
        if (!confirm('¿Eliminar este producto del catálogo?')) return;
        api('DELETE', '/api/admin/productos/' + bo.dataset.borrarProd)
          .then(async () => {
            await cargarProductos();
            actualizarMetricas();
            toast('✅ Producto eliminado');
          })
          .catch((err) => toast('⚠️ ' + err.message));
      }
    });

    $('#prodOverlay').addEventListener('click', cerrarProdModal);
    
    $('#agregarVariante').addEventListener('click', () => {
      const box = $('#variantesBox');
      const n = box.querySelectorAll('.variant-row').length;
      box.insertAdjacentHTML('beforeend', filaVariante({ presentacion: '', precio: '', precioOferta: '', stock: 20 }, n));
    });

    $('#variantesBox').addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]');
      if (rm && $('#variantesBox').querySelectorAll('.variant-row').length > 1) {
        rm.closest('.variant-row').remove();
      }
    });

    $('#prodForm').addEventListener('submit', guardarProducto);

    $('#pedList').addEventListener('change', (e) => {
      const sel = e.target.closest('.estado-select');
      if (sel) cambiarEstado(Number(sel.dataset.pedido), sel.value, sel);
    });

    $('#nuevoMedio').addEventListener('click', abrirMedioModal);
    $('#medioOverlay').addEventListener('click', cerrarMedioModal);
    $('#medioForm').addEventListener('submit', guardarMedio);
    $$('input[name="medioDestino"]').forEach((r) => r.addEventListener('change', () => {
      $('#medioMarcaNombreGroup').style.display = $('#medioDestinoMarca').checked ? 'block' : 'none';
    }));
    $$('input[name="medioFormato"]').forEach((r) => r.addEventListener('change', actualizarAceptArchivoMedio));

    ['#mediosLocalGrid', '#mediosMarcaGrid'].forEach((sel) => {
      const grid = $(sel);
      grid.addEventListener('click', (e) => {
        const bo = e.target.closest('[data-borrar-medio]');
        if (bo) borrarMedio(Number(bo.dataset.borrarMedio));
      });
      grid.addEventListener('change', (e) => {
        const el = e.target.closest('[data-medio-field]');
        if (!el) return;
        const id = Number(el.dataset.id);
        const campo = el.dataset.medioField;
        const valor = campo === 'activo' ? el.checked : el.value.trim();
        actualizarMedioCampo(id, campo, valor);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
