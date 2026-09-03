/* ============================================================================
   AROMA A LIMPIO — Lógica de la tienda (catálogo, buscador, carrito, checkout)
   ========================================================================== */
(function () {
  'use strict';

  // ----------------------------- Utilidades --------------------------------

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

  /**
   * Si la foto falla, intenta primero la foto "por código de barras" y después
   * la "por nombre" (carpeta /img/fotos/), y recién al final muestra un
   * placeholder. Así, colocando la foto con el nombre correcto, aparece sola.
   */
  function fallbackImg(img, label) {
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

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
      <rect width='100%' height='100%' fill='#e3f4fc'/>
      <text x='300' y='320' font-family='Arial' font-size='120' text-anchor='middle'>🫧</text>
      <text x='300' y='470' font-family='Arial' font-size='40' fill='#0c5c82' text-anchor='middle'>${label || ''}</text>
    </svg>`;
    img.onerror = null;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ----------------------------- Estado ------------------------------------

  const state = {
    origin: 'api', // 'api' | 'demo'
    categorias: [],
    productos: [],
    filtro: 'todos', // 'todos' | slug de categoría | 'busqueda'
    query: '',
    whatsappUrl: '#',
    carrito: JSON.parse(localStorage.getItem('carrito-limpieza') || '[]'),
  };

  // ----------------------------- Carga de datos ----------------------------

  async function cargarDatos() {
    try {
      const [cats, prods, wa] = await Promise.all([
        API.get('/api/categorias'),
        API.get('/api/productos'),
        API.get('/api/whatsapp'),
      ]);
      state.origin = 'api';
      state.categorias = cats;
      state.productos = prods;
      state.whatsappUrl = wa.url;
    } catch (e) {
      state.origin = 'demo';
      state.categorias = DEMO.categorias;
      state.productos = DEMO.productos;
      state.whatsappUrl = DEMO.whatsapp.url;
    }
    renderTodo();
  }

  // ----------------------------- Render ------------------------------------

  function renderTodo() {
    renderCategorias();
    renderBanner();
    renderGrid();
    renderCarrito();
    $('#whatsappFab').setAttribute('href', state.whatsappUrl);
    $('#footerWhatsapp').setAttribute('href', state.whatsappUrl);
  }

  function renderCategorias() {
    const nav = $('#cats');
    const chips = [{ slug: 'todos', nombre: 'Todos', icono: '🛒' }]
      .concat(state.categorias.map((c) => ({ slug: c.slug, nombre: c.nombre, icono: c.icono })));

    nav.innerHTML = chips.map((c) =>
      `<button class="cat-chip ${state.filtro === c.slug ? 'active' : ''}" data-slug="${c.slug}">
        ${c.icono ? c.icono + ' ' : ''}${c.nombre}
      </button>`).join('');
  }

  function renderBanner() {
    const destacados = state.productos.filter((p) => p.destacado);
    const wrap = $('#banner');
    if (!destacados.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    $('#bannerList').innerHTML = destacados.map((p) => `
      <article class="banner-card" data-id="${p.id}" role="button" tabindex="0"
               aria-label="Ver ${p.nombre}">
        ${p.enOferta ? '<span class="tag-oferta">OFERTA</span>' : ''}
        <img src="${p.imagenUrl}" alt="${p.nombre}" loading="lazy"
             data-cod="${p.codigoBarras || ''}" data-slug="${p.slug || ''}"
             onerror="window.__fallbackImg?.(this,'${p.nombre.slice(0, 16)}')">
        <div class="b-body">
          <div class="b-title">${p.nombre}</div>
          <div class="b-price">${money(p.precioDesde)}</div>
        </div>
      </article>`).join('');
  }

  function productoCard(p) {
    const variantes = p.variantes || [];
    const primerVariante = variantes[0];
    const precio = primerVariante ? primerVariante.precioVenta : p.precioDesde;
    const enOferta = p.enOferta || (primerVariante && primerVariante.precioOferta
      && primerVariante.precioOferta < primerVariante.precio);

    let selector = '';
    if (variantes.length > 1) {
      selector = `
        <div class="select-wrap">
          <select class="var-select" data-id="${p.id}" aria-label="Presentación de ${p.nombre}">
            ${variantes.map((v) =>
              `<option value="${v.id}" data-precio="${v.precioVenta}" data-oferta="${v.precioOferta || ''}">
                ${v.presentacion} — ${money(v.precioVenta)}
              </option>`).join('')}
          </select>
        </div>`;
    } else if (variantes.length === 1) {
      selector = `<div class="select-wrap"><select class="var-select" data-id="${p.id}" disabled
                    aria-label="Presentación de ${p.nombre}">
                    <option>${variantes[0].presentacion}</option></select></div>`;
    }

    return `
      <article class="card" data-id="${p.id}">
        <div class="img-wrap">
          ${enOferta ? '<span class="tag-oferta">OFERTA</span>' : ''}
          <img class="prod" src="${p.imagenUrl}" alt="${p.nombre}" loading="lazy"
               data-cod="${p.codigoBarras || ''}" data-slug="${p.slug || ''}"
               onerror="window.__fallbackImg?.(this,'${p.nombre.slice(0, 16)}')">
        </div>
        <div class="body">
          <span class="cat">${p.categoriaIcono || ''} ${p.categoriaNombre || ''}</span>
          <h3>${p.nombre}</h3>
          ${p.descripcion ? `<p class="desc">${p.descripcion}</p>` : ''}
          <div class="price-row">
            ${enOferta ? `<span class="price old">${money(primerVariante ? primerVariante.precio : precio)}</span>` : ''}
            <span class="price ${enOferta ? 'oferta' : ''}" data-role="precio">${money(precio)}</span>
          </div>
          ${selector}
          <button class="add-btn" data-id="${p.id}" ${variantes.length ? '' : 'disabled'}>
            ${variantes.length ? '➕ Agregar al carrito' : 'Sin stock'}
          </button>
        </div>
      </article>`;
  }

  function renderGrid() {
    const grid = $('#productGrid');
    const titulo = $('#sectionTitle');
    let lista = state.productos;

    if (state.filtro === 'busqueda') {
      const q = state.query.toLowerCase();
      lista = state.productos.filter((p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q));
      titulo.textContent = `Resultados para «${state.query}»`;
    } else if (state.filtro !== 'todos') {
      const cat = state.categorias.find((c) => c.slug === state.filtro);
      lista = state.productos.filter((p) => p.categoriaId === cat?.id);
      titulo.textContent = (cat ? (cat.icono || '') + ' ' : '') + (cat?.nombre || '');
    } else {
      titulo.textContent = 'Todos los productos';
    }

    if (!lista.length) {
      grid.innerHTML = `<div class="empty-state">
        <div class="big">🔍</div>No encontramos productos. Probá con otra búsqueda.
      </div>`;
      return;
    }
    grid.innerHTML = lista.map(productoCard).join('');
  }

  // ----------------------------- Carrito -----------------------------------

  function guardarCarrito() {
    localStorage.setItem('carrito-limpieza', JSON.stringify(state.carrito));
  }

  function totalCarrito() {
    return state.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  }

  function totalItems() {
    return state.carrito.reduce((acc, it) => acc + it.cantidad, 0);
  }

  function agregarAlCarrito(productoId, varianteId) {
    const p = state.productos.find((x) => x.id === productoId);
    const v = p.variantes.find((x) => x.id === varianteId);
    if (!v) return;

    const key = `${productoId}:${varianteId}`;
    const existente = state.carrito.find((it) => it.key === key);
    if (existente) {
      if (v.stock != null && existente.cantidad + 1 > v.stock) {
        toast('⚠️ No hay más stock de esta presentación');
        return;
      }
      existente.cantidad += 1;
    } else {
      state.carrito.push({
        key,
        productoId,
        varianteId,
        nombre: p.nombre,
        variante: v.presentacion,
        precio: v.precioVenta,
        precioNormal: v.precio,
        imagen: p.imagenUrl,
        codigo: p.codigoBarras || '',
        slug: p.slug || '',
        stock: v.stock,
        cantidad: 1,
      });
    }
    guardarCarrito();
    renderCarrito();
    toast(`🛒 ${p.nombre} agregado`);
    abrirCarrito();
  }

  function cambiarCantidad(key, delta) {
    const item = state.carrito.find((it) => it.key === key);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      state.carrito = state.carrito.filter((it) => it.key !== key);
    }
    guardarCarrito();
    renderCarrito();
  }

  function renderCarrito() {
    const body = $('#cartItems');
    const n = totalItems();
    $('#cartBadge').textContent = n;
    $('#cartBadge').style.display = n ? 'grid' : 'none';
    $('#fabBadge').textContent = n;
    $('#fabBadge').style.display = n ? 'grid' : 'none';
    $('#cartTotal').textContent = money(totalCarrito());

    if (!state.carrito.length) {
      body.innerHTML = `<div class="empty-state"><div class="big">🛒</div>Tu carrito está vacío.<br>
        Agregá productos para armar tu pedido.</div>`;
      return;
    }

    body.innerHTML = state.carrito.map((it) => `
      <div class="cart-item">
        <img src="${it.imagen}" alt="${it.nombre}"
             data-cod="${it.codigo || ''}" data-slug="${it.slug || ''}"
             onerror="window.__fallbackImg?.(this,'${it.nombre.slice(0, 12)}')">
        <div class="ci-info">
          <div class="ci-name">${it.nombre}</div>
          <div class="ci-var">${it.variante}</div>
          <div class="ci-price">${money(it.precio * it.cantidad)}</div>
          <div class="qty">
            <button data-action="menos" data-key="${it.key}" aria-label="Quitar una unidad">−</button>
            <span>${it.cantidad}</span>
            <button data-action="mas" data-key="${it.key}" aria-label="Agregar una unidad">+</button>
          </div>
        </div>
        <button class="ci-remove" data-action="quitar" data-key="${it.key}" aria-label="Eliminar ${it.nombre}">🗑️</button>
      </div>`).join('');
  }

  // ----------------------------- Carrito drawer ----------------------------

  function abrirCarrito() {
    $('#cartDrawer').classList.add('open');
    $('#overlay').classList.add('open');
  }

  function cerrarCarrito() {
    $('#cartDrawer').classList.remove('open');
    $('#overlay').classList.remove('open');
  }

  // ----------------------------- Checkout ----------------------------------

  function abrirCheckout() {
    if (!state.carrito.length) { toast('Agregá productos primero'); return; }
    renderResumenCheckout();
    $('#checkoutModal').classList.add('open');
    $('#checkoutOverlay').classList.add('open');
    cerrarCarrito();
  }

  function cerrarCheckout() {
    $('#checkoutModal').classList.remove('open');
    $('#checkoutOverlay').classList.remove('open');
  }

  function renderResumenCheckout() {
    const lines = state.carrito.map((it) =>
      `<div class="line"><span>${it.cantidad} × ${it.nombre} (${it.variante})</span>
       <span>${money(it.precio * it.cantidad)}</span></div>`).join('');
    $('#resumenItems').innerHTML = lines;
    $('#resumenTotal').textContent = money(totalCarrito());
  }

  function toggleDireccion() {
    const esEnvio = ($$('input[name="modalidad"]:checked')[0] || {}).value === 'ENVIO_DOMICILIO';
    $('#fieldDireccion').style.display = esEnvio ? 'block' : 'none';
  }

  async function enviarPedido(e) {
    e.preventDefault();
    const btn = $('#btnEnviar');
    btn.disabled = true;

    const nombre = $('#nombre').value.trim();
    const telefono = $('#telefono').value.trim();
    const direccion = $('#direccion').value.trim();
    const barrio = $('#barrio').value.trim();
    const modalidad = ($$('input[name="modalidad"]:checked')[0] || {}).value;
    const medioPago = ($$('input[name="medioPago"]:checked')[0] || {}).value;
    const notas = $('#notas').value.trim();

    if (!nombre) { toast('Ingresá tu nombre completo'); btn.disabled = false; return; }
    if (!modalidad) { toast('Elegí la modalidad de entrega'); btn.disabled = false; return; }
    if (!medioPago) { toast('Elegí el medio de pago'); btn.disabled = false; return; }
    if (modalidad === 'ENVIO_DOMICILIO' && !direccion) {
      toast('Ingresá la dirección para el envío'); btn.disabled = false; return;
    }

    const payload = {
      nombre, telefono: telefono || null, direccion: direccion || null,
      barrio: barrio || null, modalidadEntrega: modalidad, medioPago, notas: notas || null,
      items: state.carrito.map((it) => ({
        productoId: it.productoId, varianteId: it.varianteId, cantidad: it.cantidad,
      })),
    };

    try {
      let respuesta;
      if (state.origin === 'api') {
        respuesta = await API.post('/api/pedidos', payload);
      } else {
        respuesta = DEMO.crearPedido(payload);
      }
      // Abre WhatsApp con el mensaje del pedido ya armado.
      window.open(respuesta.whatsappUrl, '_blank', 'noopener');
      state.carrito = [];
      guardarCarrito();
      renderCarrito();
      cerrarCheckout();
      toast('✅ ¡Pedido enviado a WhatsApp!');
    } catch (err) {
      toast('⚠️ ' + err.message);
    } finally {
      btn.disabled = false;
    }
  }

  // ----------------------------- Buscador ----------------------------------

  let debounceTimer = null;

  function buscar(q) {
    if (!q) {
      $('#suggestions').classList.remove('open');
      return;
    }
    const ql = q.toLowerCase();
    let resultados;
    if (state.origin === 'api') {
      API.get('/api/buscar?q=' + encodeURIComponent(q))
        .then((r) => pintarSugerencias(r, q))
        .catch(() => pintarSugerencias([]));
    } else {
      resultados = state.productos.filter((p) =>
        p.nombre.toLowerCase().includes(ql) ||
        (p.descripcion || '').toLowerCase().includes(ql));
      pintarSugerencias(resultados, q);
    }
  }

  function pintarSugerencias(resultados, q) {
    const box = $('#suggestions');
    if (!resultados.length) {
      box.innerHTML = `<button type="button">Sin resultados para «${q}»</button>`;
      box.classList.add('open');
      return;
    }
    box.innerHTML = resultados.slice(0, 8).map((p) => `
      <button type="button" data-id="${p.id}">
        <img src="${p.imagenUrl}" alt="" data-cod="${p.codigoBarras || ''}" data-slug="${p.slug || ''}"
             onerror="window.__fallbackImg?.(this,'')">
        <span class="s-name">${p.nombre}</span>
        <span class="s-price">${money(p.precioDesde)}</span>
      </button>`).join('');
    box.classList.add('open');
  }

  function aplicarBusqueda(q) {
    state.filtro = 'busqueda';
    state.query = q;
    $('#searchInput').value = q;
    $('#suggestions').classList.remove('open');
    renderCategorias();
    renderGrid();
    $('#productGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ----------------------------- Eventos -----------------------------------

  function init() {
    $('#cats').addEventListener('click', (e) => {
      const chip = e.target.closest('.cat-chip');
      if (!chip) return;
      state.filtro = chip.dataset.slug;
      renderCategorias();
      renderGrid();
    });

    $('#bannerList').addEventListener('click', (e) => {
      const card = e.target.closest('.banner-card');
      if (!card) return;
      const p = state.productos.find((x) => x.id === Number(card.dataset.id));
      if (p) {
        state.filtro = 'busqueda';
        state.query = p.nombre;
        $('#searchInput').value = p.nombre;
        renderCategorias();
        renderGrid();
        $('#productGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    $('#productGrid').addEventListener('change', (e) => {
      const select = e.target.closest('.var-select');
      if (!select) return;
      const card = select.closest('.card');
      const precioEl = card.querySelector('[data-role="precio"]');
      const opt = select.selectedOptions[0];
      precioEl.textContent = money(Number(opt.dataset.precio));
    });

    $('#productGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('.add-btn');
      if (!btn) return;
      const card = btn.closest('.card');
      const select = card.querySelector('.var-select');
      const productoId = Number(btn.dataset.id);
      let varianteId;
      if (select && !select.disabled) {
        varianteId = Number(select.value);
      } else {
        const p = state.productos.find((x) => x.id === productoId);
        varianteId = p.variantes[0].id;
      }
      agregarAlCarrito(productoId, varianteId);
    });

    $('#cartItems').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const key = btn.dataset.key;
      if (btn.dataset.action === 'mas') cambiarCantidad(key, +1);
      if (btn.dataset.action === 'menos') cambiarCantidad(key, -1);
      if (btn.dataset.action === 'quitar') {
        state.carrito = state.carrito.filter((it) => it.key !== key);
        guardarCarrito();
        renderCarrito();
      }
    });

    $('#searchInput').addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => buscar(q), 220);
    });

    $('#searchInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarBusqueda(e.target.value.trim());
      }
      if (e.key === 'Escape') $('#suggestions').classList.remove('open');
    });

    $('#suggestions').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-id]');
      if (btn) {
        const p = state.productos.find((x) => x.id === Number(btn.dataset.id));
        if (p) aplicarBusqueda(p.nombre);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) $('#suggestions').classList.remove('open');
    });

    $('#cartBtn').addEventListener('click', abrirCarrito);
    $('#cartFab').addEventListener('click', abrirCarrito);
    $('#overlay').addEventListener('click', cerrarCarrito);
    $('#closeDrawer').addEventListener('click', cerrarCarrito);
    $('#goCheckout').addEventListener('click', abrirCheckout);

    $('#closeCheckout').addEventListener('click', cerrarCheckout);
    $('#checkoutOverlay').addEventListener('click', cerrarCheckout);
    $('#checkoutForm').addEventListener('submit', enviarPedido);
    $$('input[name="modalidad"]').forEach((r) => r.addEventListener('change', toggleDireccion));

    window.__fallbackImg = fallbackImg;
    toggleDireccion();
    cargarDatos();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
