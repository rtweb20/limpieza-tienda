/* ============================================================================
   DEMO DATA — Datos de ejemplo locales.
   Se usan SOLO si el backend no está disponible (p. ej. al previsualizar el
   HTML sin servidor Java). En producción la tienda consume la API REST.
   Las imágenes son SVGs embebidos (data URI) para que se vean sin conexión.
   ========================================================================== */
(function () {
  const WHATSAPP_NUMBER = '5492612578860';
  const STORE = 'Limpieza El Barrio';

  function svgImg(emoji, bg, fg) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
      <rect width='100%' height='100%' fill='${bg}'/>
      <circle cx='300' cy='255' r='120' fill='rgba(255,255,255,.35)'/>
      <text x='300' y='285' font-family='Arial' font-size='150' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
      <text x='300' y='470' font-family='Arial' font-size='42' font-weight='bold' fill='${fg}' text-anchor='middle'>Limpieza El Barrio</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const IMG = (emoji, bg) => svgImg(emoji, bg, '#ffffff');
  const IMG_O = (emoji) => svgImg(emoji, '#f6e3c5', '#8a3b2c');

  const categorias = [
    { id: 1, nombre: 'Combos y Ofertas', slug: 'combos', icono: '🔥', destacada: true },
    { id: 2, nombre: 'Cocina', slug: 'cocina', icono: '🍳', destacada: false },
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
      imagenUrl: destacado ? IMG_O(emoji) : IMG(emoji, '#dff0ea'),
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
    // COCINA
    P(1, 'cocina', 'Lavandina Ayudín', 'lavandina-ayudin', '🧪',
      [['1 L', 1850], ['2 L', 3100], ['5 L', 6500]], false,
      'Desinfectante concentrado para pisos, baños y superficies.'),
    P(2, 'cocina', 'Detergente Magistral', 'detergente-magistral', '🍽️',
      [['500 ml', 1650], ['750 ml', 2150], ['1,25 L', 3200]], false,
      'Lava y desengrasa con espuma rendidora.'),
    P(3, 'cocina', 'Detergente Ala', 'detergente-ala', '🧼',
      [['750 ml', 2050], ['1,5 L', 3600]], false, 'Corta la grasa con poca cantidad.'),
    P(4, 'cocina', 'Limpiador Cremoso Cif', 'limpiador-cremoso-cif', '✨',
      [['500 ml - Aroma Limón', 2400], ['500 ml - Aroma Lavanda', 2400]], false,
      'Crema limpiadora con micropartículas.'),
    P(5, 'cocina', 'Esponjas de Cocina (x4)', 'esponjas-cocina', '🧽',
      [['Pack x4', 1450]], false, 'Pack de 4 esponjas con virulana.'),
    P(6, 'cocina', 'Rollo de Cocina (x3)', 'rollo-cocina', '🧻',
      [['Pack x3', 2600]], false, 'Papel absorbente de doble hoja.'),

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

    // BAÑO
    P(11, 'bano', 'Desinfectante Lysoform', 'desinfectante-lysoform', '🦠',
      [['360 ml Spray', 3200]], false, 'Elimina bacterias en superficies.'),
    P(12, 'bano', 'Limpiador Poett Baño', 'limpiador-poett-bano', '🚽',
      [['500 ml', 2450]], false, 'Limpieza y desinfección con aroma a limpio.'),
    P(13, 'bano', 'Lavandina en Gel Ayudín', 'lavandina-gel', '🧴',
      [['900 ml', 3200]], false, 'Más espesa, no resbala y limpia mejor.'),
    P(14, 'bano', 'Jabón Líquido para Manos', 'jabon-manos', '🫲',
      [['500 ml', 2900]], false, 'Jabón suave con aroma fresco.'),

    // ACCESORIOS
    P(15, 'accesorios', 'Escoba', 'escoba', '🧹',
      [['Unidad', 5200]], false, 'Cerdas firmes para interiores y veredas.'),
    P(16, 'accesorios', 'Secador de Piso + Palo', 'secador-piso', '🪣',
      [['Unidad', 4800]], false, 'Goma de arrastre con palo de madera.'),
    P(17, 'accesorios', 'Guantes de Limpieza (par)', 'guantes-limpieza', '🧤',
      [['Talle M', 2600], ['Talle L', 2600]], false, 'Látex reforzado.'),
    P(18, 'accesorios', 'Paños de Microfibra (x4)', 'panos-microfibra', '🧻',
      [['Pack x4', 3200]], false, 'No dejan pelusa, para vidrios y muebles.'),

    // COMBOS Y OFERTAS (destacados → banner)
    P(19, 'combos', 'Combo Cocina', 'combo-cocina', '🍳',
      [['Kit completo', 5500, 4800]], true, 'Detergente + esponjas + virulana.'),
    P(20, 'combos', 'Combo Baño', 'combo-bano', '🚿',
      [['Kit completo', 7900, 7200]], true, 'Lysoform + Poett + pastillas.'),
    P(21, 'combos', 'Combo Ropa', 'combo-ropa', '🧺',
      [['Kit completo', 13500, 11800]], true, 'Jabón + suavizante + quitamanchas.'),
    P(22, 'combos', 'Combo Hogar Completo', 'combo-hogar', '🏠',
      [['Kit completo', 29000, 24500]], true, 'Kit integral para toda la casa.'),
    P(23, 'combos', '2x1 Detergente Magistral 750 ml', 'oferta-detergente', '🎁',
      [['2 x 750 ml', 4300, 3800]], true, 'Llevá 2 y pagá menos.'),
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
