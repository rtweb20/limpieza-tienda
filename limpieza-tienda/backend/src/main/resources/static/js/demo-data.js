/* ============================================================================
   DEMO DATA — Datos de ejemplo locales.
   Se usan SOLO si el backend no está disponible (p. ej. al previsualizar el
   HTML sin servidor Java). En producción la tienda consume la API REST.
   Las imágenes son SVGs embebidos (data URI) para que se vean sin conexión.
   ========================================================================== */
(function () {
  const WHATSAPP_NUMBER = '5492612578860';
  const STORE = 'Aroma a Limpio';

  function svgImg(emoji, bg, fg) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
      <rect width='100%' height='100%' fill='${bg}'/>
      <circle cx='300' cy='255' r='120' fill='rgba(0,0,0,.05)'/>
      <text x='300' y='285' font-family='Arial' font-size='150' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
      <text x='300' y='470' font-family='Arial' font-size='40' font-weight='bold' fill='${fg}' text-anchor='middle'>Aroma a Limpio</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const IMG = (emoji) => svgImg(emoji, '#EFE6D4', '#6B5130');
  const IMG_O = (emoji) => svgImg(emoji, '#F7E7DC', '#B4541F');

  const categorias = [
    { id: 1, nombre: 'Combos y Ofertas', slug: 'combos', icono: '🔥', destacada: true },
    { id: 3, nombre: 'Ropa', slug: 'ropa', icono: '🧺', destacada: false },
    { id: 4, nombre: 'Baño', slug: 'bano', icono: '🚿', destacada: false },
    { id: 5, nombre: 'Accesorios', slug: 'accesorios', icono: '🧹', destacada: false },
  ];

  function P(id, cat, nombre, slug, emoji, variantes, destacado = false, desc = '') {
    const categoria = categorias.find((c) => c.slug === cat);
    return {
      id,
      nombre,
      slug,
      descripcion: desc,
      imagenUrl: destacado ? IMG_O(emoji) : IMG(emoji),
      destacado,
      activo: true,
      categoriaId: categoria.id,
      categoriaNombre: categoria.nombre,
      categoriaIcono: categoria.icono,
      variantes: variantes.map((v, i) => ({
        id: id * 100 + i + 1,
        presentacion: v[0],
        precio: v[1],
        precioOferta: v[2] || null,
        precioVenta: v[2] || v[1],
        stock: v[3] != null ? v[3] : 20,
      })),
      precioDesde: Math.min(...variantes.map((v) => v[2] || v[1])),
      enOferta: variantes.some((v) => v[2]),
    };
  }

  const productos = [
    // ROPA
    P(7, 'ropa', 'Jabón en Polvo Ala', 'jabon-polvo-ala', '🧺',
      [['800 g', 4450], ['2,5 kg', 9800], ['5 kg', 17500]], false,
      'Poder de limpieza para ropa blanca y de color.'),
    P(8, 'ropa', 'Jabón en Polvo Skip', 'jabon-polvo-skip', '👕',
      [['800 g', 5400], ['2,5 kg', 12400]], false,
      'Limpieza profunda con fragancia duradera.'),
    P(9, 'ropa', 'Jabón Líquido Skip', 'jabon-liquido-skip', '🫧',
      [['1,5 L', 6900], ['3 L', 12400]], false, 'Fácil disolución, ideal para lavarropas.'),
    P(10, 'ropa', 'Suavizante Vivere', 'suavizante-vivere', '🌸',
      [['900 ml', 4200], ['2,8 L', 9800]], false, 'Suavidad y aroma prolongado.'),
    P(11, 'ropa', 'Jabón de Lavar en Pan (x3)', 'jabon-lavar-pan', '🧼',
      [['Pack x3', 1800]], false, 'Jabón blanco tradicional, pack de 3 panes.'),
    P(12, 'ropa', 'Quitamanchas', 'quitamanchas', '💧',
      [['450 ml', 3600]], false, 'Elimina manchas difíciles antes del lavado.'),
    P(13, 'ropa', 'Blanqueador para Ropa', 'blanqueador-ropa', '⚪',
      [['1 L', 1750]], false, 'Blanqueador líquido con protección de colores.'),

    // BAÑO
    P(14, 'bano', 'Desinfectante Lysoform', 'desinfectante-lysoform', '🦠',
      [['360 ml Spray', 3200]], false, 'Elimina bacterias en superficies.'),
    P(15, 'bano', 'Limpiador Poett Baño', 'limpiador-poett-bano', '🚽',
      [['500 ml', 2450]], false, 'Limpieza y desinfección con aroma a limpio.'),
    P(16, 'bano', 'Pastillas para Inodoro (x2)', 'pastillas-inodoro', '🔵',
      [['Pack x2', 2800]], false, 'Acción desodorizante y limpiadora continua.'),
    P(17, 'bano', 'Desodorante de Ambiente', 'desodorante-ambiente', '🌿',
      [['360 ml', 2600]], false, 'Perfuma y neutraliza olores.'),
    P(18, 'bano', 'Lavandina en Gel Ayudín', 'lavandina-gel', '🧴',
      [['900 ml', 3200]], false, 'Más espesa, no resbala y limpia mejor.'),
    P(19, 'bano', 'Jabón Líquido para Manos', 'jabon-manos', '🫲',
      [['500 ml', 2900]], false, 'Jabón suave con aroma fresco.'),

    // ACCESORIOS
    P(20, 'accesorios', 'Escoba', 'escoba', '🧹',
      [['Unidad', 5200]], false, 'Cerdas firmes para interiores y veredas.'),
    P(21, 'accesorios', 'Secador de Piso + Palo', 'secador-piso', '🪣',
      [['Unidad', 4800]], false, 'Goma de arrastre con palo de madera.'),
    P(22, 'accesorios', 'Balde 10 L', 'balde-10l', '🪣',
      [['Unidad', 3900]], false, 'Balde resistente de 10 litros.'),
    P(23, 'accesorios', 'Trapos de Piso (x3)', 'trapos-piso', '🧻',
      [['Pack x3', 2100]], false, 'Trapos de algodón súper absorbentes.'),
    P(24, 'accesorios', 'Guantes de Limpieza (par)', 'guantes-limpieza', '🧤',
      [['Talle M', 2600], ['Talle L', 2600]], false, 'Látex reforzado.'),
    P(25, 'accesorios', 'Paños de Microfibra (x4)', 'panos-microfibra', '🟩',
      [['Pack x4', 3200]], false, 'No dejan pelusa, para vidrios y muebles.'),
    P(26, 'accesorios', 'Cepillo de Baño', 'cepillo-bano', '🚿',
      [['Unidad', 2300]], false, 'Mango ergonómico para inodoros y azulejos.'),
    P(27, 'accesorios', 'Plumero', 'plumero', '🪶',
      [['Unidad', 2900]], false, 'Atrapa el polvo sin levantarlo.'),
    P(28, 'accesorios', 'Mopa de Piso', 'mopa-piso', '🧽',
      [['Unidad', 5600]], false, 'Cabezal giratorio con repuesto lavable.'),

    // COMBOS Y OFERTAS (destacados → banner)
    P(29, 'combos', 'Combo Baño', 'combo-bano', '🚿',
      [['Kit completo', 7900, 7200]], true, 'Lysoform + Poett + pastillas.'),
    P(30, 'combos', 'Combo Ropa', 'combo-ropa', '🧺',
      [['Kit completo', 13500, 11800]], true, 'Jabón + suavizante + quitamanchas.'),
    P(31, 'combos', 'Combo Hogar Completo', 'combo-hogar', '🏠',
      [['Kit completo', 29000, 24500]], true, 'Kit integral para toda la casa.'),
  ];

  function money(v) {
    return '$ ' + new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(Number(v));
  }

  function labelEntrega(m) { return m === 'ENVIO_DOMICILIO' ? 'Envío a domicilio' : 'Retiro en local'; }
  function labelPago(m) {
    return ({ EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', MERCADO_PAGO: 'Mercado Pago' })[m] || m;
  }

  function buildMensaje(p) {
    const lines = [];
    lines.push(`🧾 *NUEVO PEDIDO — ${STORE}*`);
    lines.push('──────────────────');
    lines.push(`👤 *Cliente:* ${p.nombre}`);
    if (p.telefono) lines.push(`📞 Teléfono: ${p.telefono}`);
    if (p.direccion) lines.push(`🏠 *Dirección:* ${p.direccion}`);
    if (p.barrio) lines.push(`📍 Barrio: ${p.barrio}`);
    lines.push(`🛵 *Entrega:* ${labelEntrega(p.modalidadEntrega)}`);
    lines.push(`💳 *Pago:* ${labelPago(p.medioPago)}`);
    lines.push('──────────────────');
    lines.push('🛒 *DETALLE DEL PEDIDO:*');
    p.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.productoNombre}${it.varianteNombre ? ' (' + it.varianteNombre + ')' : ''}`);
      lines.push(`   ${it.cantidad} x ${money(it.precioUnitario)} = *${money(it.subtotal)}*`);
    });
    lines.push('──────────────────');
    lines.push(`💰 *TOTAL: ${money(p.total)}*`);
    if (p.notas) lines.push(`📝 Notas: ${p.notas}`);
    return lines.join('\n');
  }

  window.DEMO = {
    categorias,
    productos,
    destacados: productos.filter((p) => p.destacado),
    whatsapp: {
      numero: WHATSAPP_NUMBER,
      url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola 👋, quería hacer una consulta sobre ' + STORE + '.')}`,
    },
    login(username, password) {
      if (username === 'admin' && password === 'admin123') return { token: 'demo-token' };
      const err = new Error('Credenciales incorrectas');
      err.status = 401;
      throw err;
    },
    crearPedido(payload) {
      const items = payload.items.map((it) => {
        const producto = productos.find((p) => p.id === it.productoId);
        const variante = producto.variantes.find((v) => v.id === it.varianteId);
        const precio = variante.precioVenta;
        return {
          id: Math.floor(Math.random() * 1e6),
          productoNombre: producto.nombre,
          varianteNombre: variante.presentacion,
          cantidad: it.cantidad,
          precioUnitario: precio,
          subtotal: precio * it.cantidad,
        };
      });
      const total = items.reduce((acc, it) => acc + it.subtotal, 0);
      const pedido = {
        id: Math.floor(Math.random() * 1e6),
        nombreCliente: payload.nombre,
        telefono: payload.telefono,
        direccion: payload.direccion,
        barrio: payload.barrio,
        modalidadEntrega: payload.modalidadEntrega,
        medioPago: payload.medioPago,
        notas: payload.notas,
        total,
        estado: 'NUEVO',
        items,
      };
      const mensaje = buildMensaje(pedido);
      return {
        ...pedido,
        whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      };
    },
  };
})();
