/* ============================================================================
   AROMA A LIMPIO — Panel de administración
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const money = (v) => '$ ' + new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(Number(v));

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function fallbackImg(img) {
    img.onerror = null;
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='#e8eef2'/><text x='50' y='60' font-size='40' text-anchor='middle'>🫧</text></svg>");
  }

  // ----------------------------- Estado / auth -----------------------------

  let token = localStorage.getItem('admin-token-limpieza') || null;
  let modoDemo = false;

  const demoDB = {
    categorias: DEMO.categorias.map((c) => ({ ...c, activa: true, orden: 0 })),
    productos: DEMO.productos.map((p) => ({ ...p })),
    pedidos: [],
    _nextId: 1000,
  };

  async function api(method, path, body) {
    if (!modoDemo) {
      try {
        return await API.request(method, path, body, { 'X-Admin-Token': token });
      } catch (e) {
        if (e.status === 401) { logout(); throw e; }
        if (e.status) throw e; // error de negocio real
        modoDemo = true;
        toast('⚠️ Backend no disponible: modo demo local');
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
      demoDB.categorias[i] = { ...demoDB.categorias[i], ...body, id };
      return r(demoDB.categorias[i]);
    }
    if (method === 'DELETE' && /\/categorias\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      demoDB.categorias = demoDB.categorias.filter((c) => c.id !== id);
      return r(null);
    }
    if (method === 'POST' && path.endsWith('/productos')) {
      const p = { ...body, id: demoDB._nextId++, slug: slugify(body.nombre), precioDesde: 0, enOferta: false };
      demoDB.productos.push(p);
      return r(p);
    }
    if (method === 'PUT' && /\/productos\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      const i = demoDB.productos.findIndex((p) => p.id === id);
      demoDB.productos[i] = { ...demoDB.productos[i], ...body, id };
      return r(demoDB.productos[i]);
    }
    if (method === 'DELETE' && /\/productos\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      demoDB.productos = demoDB.productos.filter((p) => p.id !== id);
      return r(null);
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
        resp = DEMO.login(username, password);
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
    $('#loginView').style.display = 'grid';
    $('#adminView').style.display = 'none';
  }

  function mostrarPanel() {
    $('#loginView').style.display = 'none';
    $('#adminView').style.display = 'block';
    activarTab('productos');
  }

  // ----------------------------- Tabs --------------------------------------

  function activarTab(tab) {
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    $$('.panel').forEach((p) => p.style.display = 'none');
    $('#panel-' + tab).style.display = 'block';
    if (tab === 'productos') cargarProductos();
    if (tab === 'categorias') cargarCategorias();
    if (tab === 'pedidos') cargarPedidos();
  }

  // ----------------------------- Categorías --------------------------------

  async function cargarCategorias() {
    const cats = await api('GET', '/api/admin/categorias');
    $('#catList').innerHTML = cats.map((c) => `
      <tr>
        <td>${c.icono || '🏷️'} <strong>${c.nombre}</strong></td>
        <td>/${c.slug}</td>
        <td><span class="badge ${c.activa ? 'ok' : 'no'}">${c.activa ? 'Activa' : 'Inactiva'}</span></td>
        <td><span class="badge ${c.destacada ? 'oferta' : 'no'}">${c.destacada ? 'Destacada' : '—'}</span></td>
        <td>
          <div class="row-actions">
            <button class="mini-btn" data-editar-cat="${c.id}">✏️ Editar</button>
            <button class="mini-btn danger" data-borrar-cat="${c.id}">🗑️</button>
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
      toast('✅ Categoría guardada');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  // ----------------------------- Productos ---------------------------------

  async function cargarProductos() {
    const prods = await api('GET', '/api/admin/productos');
    $('#prodList').innerHTML = prods.map((p) => `
      <tr>
        <td><img class="thumb" src="${p.imagenUrl}" alt="" onerror="window.__fallbackImg?.(this)"></td>
        <td>
          <strong>${p.nombre}</strong>
          <ul class="var-list">${(p.variantes || []).map((v) =>
            `<li>${v.presentacion} — ${money(v.precioVenta)}</li>`).join('')}</ul>
        </td>
        <td>${p.codigoBarras || '—'}</td>
        <td>${p.categoriaNombre || '—'}</td>
        <td>${money(p.precioDesde)}</td>
        <td>
          <span class="badge ${p.activo ? 'ok' : 'no'}">${p.activo ? 'Activo' : 'Inactivo'}</span>
          ${p.destacado ? '<br><span class="badge oferta">🔥 Oferta</span>' : ''}
        </td>
        <td>
          <div class="row-actions">
            <button class="mini-btn" data-editar-prod="${p.id}">✏️</button>
            <button class="mini-btn danger" data-borrar-prod="${p.id}">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  async function abrirProdModal(id) {
    const cats = await api('GET', '/api/admin/categorias');
    const prod = id ? (await api('GET', '/api/admin/productos')).find((p) => p.id === id) : null;

    $('#prodModalTitle').textContent = prod ? 'Editar producto' : 'Nuevo producto';
    $('#prodId').value = prod ? prod.id : '';
    $('#prodNombre').value = prod ? prod.nombre : '';
    $('#prodDesc').value = prod ? (prod.descripcion || '') : '';
    $('#prodImagen').value = prod ? prod.imagenUrl : '';
    $('#prodCategoria').innerHTML = cats.map((c) =>
      `<option value="${c.id}" ${prod && prod.categoriaId === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('');
    $('#prodDestacado').checked = prod ? !!prod.destacado : false;
    $('#prodActivo').checked = prod ? !!prod.activo : true;

    const variantes = (prod && prod.variantes && prod.variantes.length)
      ? prod.variantes
      : [{ presentacion: '', precio: '', precioOferta: '', stock: 10 }];
    $('#variantesBox').innerHTML = variantes.map((v, i) => filaVariante(v, i)).join('');

    $('#prodModal').classList.add('open');
    $('#prodOverlay').classList.add('open');
  }

  function filaVariante(v, i) {
    return `
      <div class="variant-row" data-vi="${i}">
        <input type="text" class="v-pres" placeholder="Presentación (ej. 750 ml)" value="${v.presentacion || ''}">
        <input type="number" class="v-precio" placeholder="Precio" step="0.01" min="0" value="${v.precio ?? ''}">
        <input type="number" class="v-oferta" placeholder="Precio oferta (opc.)" step="0.01" min="0" value="${v.precioOferta ?? ''}">
        <input type="number" class="v-stock" placeholder="Stock" min="0" value="${v.stock ?? 10}">
        <button type="button" class="rm" data-rm="${i}" aria-label="Quitar variante">✕</button>
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
      precioOferta: row.querySelector('.v-oferta').value
        ? Number(row.querySelector('.v-oferta').value) : null,
      stock: Number(row.querySelector('.v-stock').value || 0),
      activa: true,
      orden: Number(row.dataset.vi) + 1,
    })).filter((v) => v.presentacion && v.precio >= 0);

    if (!variantes.length) { toast('⚠️ Agregá al menos una variante'); return; }

    const body = {
      nombre: $('#prodNombre').value.trim(),
      descripcion: $('#prodDesc').value.trim() || null,
      imagenUrl: $('#prodImagen').value.trim(),
      categoriaId: Number($('#prodCategoria').value),
      destacado: $('#prodDestacado').checked,
      activo: $('#prodActivo').checked,
      variantes,
    };

    try {
      if (id) await api('PUT', '/api/admin/productos/' + id, body);
      else await api('POST', '/api/admin/productos', body);
      cerrarProdModal();
      cargarProductos();
      toast('✅ Producto guardado');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  // ----------------------------- Pedidos -----------------------------------

  async function cargarPedidos() {
    const pedidos = await api('GET', '/api/admin/pedidos');
    if (!pedidos.length) {
      $('#pedList').innerHTML = `<tr><td colspan="5" class="empty">Todavía no hay pedidos.</td></tr>`;
      return;
    }
    $('#pedList').innerHTML = pedidos.map((p) => `
      <tr>
        <td>
          <strong>#${p.id}</strong><br>
          <small>${new Date(p.createdAt).toLocaleString('es-AR')}</small>
        </td>
        <td>
          <strong>${p.nombreCliente}</strong><br>
          <small>${p.barrio || '—'} · ${p.modalidadEntrega === 'ENVIO_DOMICILIO' ? '🛵 Envío' : '🏪 Retiro'}</small>
        </td>
        <td>
          ${(p.items || []).map((it) => `<div class="pedido-item">${it.cantidad} × ${it.productoNombre} (${it.varianteNombre || '—'})</div>`).join('')}
        </td>
        <td>${money(p.total)}</td>
        <td>
          <select class="estado-select" data-pedido="${p.id}" aria-label="Estado del pedido ${p.id}">
            ${['NUEVO', 'CONFIRMADO', 'ENTREGADO', 'CANCELADO'].map((e) =>
              `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');
  }

  async function cambiarEstado(id, estado) {
    try {
      await api('PATCH', `/api/admin/pedidos/${id}/estado`, { estado });
      toast('✅ Estado actualizado');
    } catch (err) {
      toast('⚠️ ' + err.message);
    }
  }

  // ----------------------------- Eventos -----------------------------------

  function init() {
    window.__fallbackImg = fallbackImg;

    if (token) {
      // Verificamos el token contra la API; si no responde, seguimos en demo.
      mostrarPanel();
    } else {
      mostrarLogin();
    }

    $('#loginForm').addEventListener('submit', login);
    $('#logoutBtn').addEventListener('click', logout);

    $$('.tab').forEach((t) => t.addEventListener('click', () => activarTab(t.dataset.tab)));

    // Categorías
    $('#nuevaCat').addEventListener('click', () => abrirCatModal(null));
    $('#catList').addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-editar-cat]');
      const bo = e.target.closest('[data-borrar-cat]');
      if (ed) {
        const cats = await api('GET', '/api/admin/categorias');
        abrirCatModal(cats.find((c) => c.id === Number(ed.dataset.editarCat)));
      }
      if (bo) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
          await api('DELETE', '/api/admin/categorias/' + bo.dataset.borrarCat);
          cargarCategorias();
          toast('✅ Categoría eliminada');
        } catch (err) { toast('⚠️ ' + err.message); }
      }
    });
    $('#catOverlay').addEventListener('click', cerrarCatModal);
    $('#catForm').addEventListener('submit', guardarCategoria);

    // Productos
    $('#nuevoProd').addEventListener('click', () => abrirProdModal(null));
    $('#prodList').addEventListener('click', (e) => {
      const ed = e.target.closest('[data-editar-prod]');
      const bo = e.target.closest('[data-borrar-prod]');
      if (ed) abrirProdModal(Number(ed.dataset.editarProd));
      if (bo) {
        if (!confirm('¿Eliminar este producto?')) return;
        api('DELETE', '/api/admin/productos/' + bo.dataset.borrarProd)
          .then(() => { cargarProductos(); toast('✅ Producto eliminado'); })
          .catch((err) => toast('⚠️ ' + err.message));
      }
    });
    $('#prodOverlay').addEventListener('click', cerrarProdModal);
    $('#agregarVariante').addEventListener('click', () => {
      const box = $('#variantesBox');
      const n = box.querySelectorAll('.variant-row').length;
      box.insertAdjacentHTML('beforeend', filaVariante({ presentacion: '', precio: '', precioOferta: '', stock: 10 }, n));
    });
    $('#variantesBox').addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]');
      if (rm && $('#variantesBox').querySelectorAll('.variant-row').length > 1) {
        rm.closest('.variant-row').remove();
      }
    });
    $('#prodForm').addEventListener('submit', guardarProducto);

    // Pedidos
    $('#pedList').addEventListener('change', (e) => {
      const sel = e.target.closest('.estado-select');
      if (sel) cambiarEstado(Number(sel.dataset.pedido), sel.value);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
