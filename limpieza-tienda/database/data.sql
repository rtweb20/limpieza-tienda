-- ============================================================================
--  AROMA A LIMPIO — Datos iniciales (PostgreSQL)
--  Ejecutar DESPUÉS de schema.sql
--
--  * Sin categoría "Cocina" (a pedido del local).
--  * Imágenes: los productos principales usan fotos propias servidas por la
--    app (/img/...). El resto usa placeholders externos con los colores de la
--    marca (crema #EFE6D4 / marrón #6B5130). Reemplazar por URLs reales.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- CATEGORÍAS
-- ----------------------------------------------------------------------------
INSERT INTO categorias (nombre, slug, icono, orden, activa, destacada) VALUES
  ('Combos y Ofertas', 'combos',     '🔥', 0, TRUE, TRUE),
  ('Ropa',             'ropa',       '🧺', 1, TRUE, FALSE),
  ('Baño',             'bano',       '🚿', 2, TRUE, FALSE),
  ('Accesorios',       'accesorios', '🧹', 3, TRUE, FALSE);

-- ----------------------------------------------------------------------------
-- PRODUCTOS
-- ----------------------------------------------------------------------------
INSERT INTO productos (categoria_id, nombre, slug, descripcion, imagen_url, destacado) VALUES

  -- ================= ROPA =================
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón en Polvo Ala', 'jabon-polvo-ala',
   'Poder de limpieza para ropa blanca y de color. Rinde hasta 40 lavados por kilo.',
   '/img/jabon-polvo-ala.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón en Polvo Skip', 'jabon-polvo-skip',
   'Limpieza profunda con fragancia duradera para toda la familia.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Jabon+Skip', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón Líquido Skip', 'jabon-liquido-skip',
   'Fórmula líquida de fácil disolución, ideal para lavarropas de carga frontal y superior.',
   '/img/jabon-liquido-skip.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Suavizante Vivere', 'suavizante-vivere',
   'Suavidad y aroma prolongado en tus prendas.',
   '/img/suavizante-vivere.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón de Lavar en Pan (x3)', 'jabon-lavar-pan',
   'Jabón blanco tradicional para manchas y lavado a mano. Pack de 3 panes.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Jabon+en+Pan', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Quitamanchas', 'quitamanchas',
   'Elimina manchas difíciles antes del lavado.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Quitamanchas', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Blanqueador para Ropa', 'blanqueador-ropa',
   'Blanqueador líquido con protección de colores.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Blanqueador', FALSE),

  -- ================= BAÑO =================
  ((SELECT id FROM categorias WHERE slug='bano'), 'Desinfectante Lysoform', 'desinfectante-lysoform',
   'Spray desinfectante multiuso. Elimina bacterias en superficies de baño y cocina.',
   '/img/desinfectante-lysoform.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Limpiador Poett Baño', 'limpiador-poett-bano',
   'Limpieza y desinfección con aroma a limpio para inodoros y azulejos.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Poett', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Pastillas para Inodoro (x2)', 'pastillas-inodoro',
   'Pack de 2 pastillas con acción desodorizante y limpiadora continua.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Pastillas+x2', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Desodorante de Ambiente', 'desodorante-ambiente',
   'Perfuma y neutraliza olores en cualquier ambiente del hogar.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Ambientador', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Lavandina en Gel Ayudín', 'lavandina-gel',
   'Lavandina en gel con aroma, más espesa para que no resbale y limpie mejor.',
   '/img/lavandina-gel.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Jabón Líquido para Manos', 'jabon-manos',
   'Jabón líquido suave con aroma fresco para el lavado diario.',
   '/img/jabon-manos.jpg', FALSE),

  -- ================= ACCESORIOS =================
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Escoba', 'escoba',
   'Escoba resistente con cerdas firmes para interiores y veredas.',
   '/img/escoba.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Secador de Piso + Palo', 'secador-piso',
   'Secador de piso con goma de arrastre y palo de madera.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Secador', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Balde 10 L', 'balde-10l',
   'Balde resistente de 10 litros con asa reforzada.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Balde+10L', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Trapos de Piso (x3)', 'trapos-piso',
   'Pack de 3 trapos de piso de algodón, súper absorbentes.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Trapos+x3', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Guantes de Limpieza (par)', 'guantes-limpieza',
   'Guantes de látex reforzados, ideales para lavar sin lastimar las manos.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Guantes', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Paños de Microfibra (x4)', 'panos-microfibra',
   'Pack de 4 paños multiuso que no dejan pelusa. Para vidrios, muebles y autos.',
   '/img/panos-microfibra.jpg', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Cepillo de Baño', 'cepillo-bano',
   'Cepillo con mango ergonómico para inodoros y azulejos.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Cepillo', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Plumero', 'plumero',
   'Atrapa el polvo de muebles y rincones sin levantarlo.',
   'https://placehold.co/600x600/EFE6D4/6B5130?text=Plumero', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Mopa de Piso', 'mopa-piso',
   'Mopa con cabezal giratorio y repuesto lavable. Llega a todos los rincones.',
   '/img/mopa-piso.jpg', FALSE),

  -- ================= COMBOS Y OFERTAS (destacados -> banner) =================
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Baño', 'combo-bano',
   'Lysoform + Poett Baño + Pastillas x2. Baño limpio y desinfectado.',
   '/img/combo-bano.jpg', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Ropa', 'combo-ropa',
   'Jabón Ala 800 g + Suavizante 900 ml + Quitamanchas. Ropa impecable.',
   'https://placehold.co/600x600/F7E7DC/B4541F?text=Combo+Ropa', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Hogar Completo', 'combo-hogar',
   'Kit integral de limpieza para toda la casa: ropa, baño y pisos.',
   'https://placehold.co/600x600/F7E7DC/B4541F?text=Combo+Hogar', TRUE);

-- ----------------------------------------------------------------------------
-- VARIANTES (presentación / aroma / tamaño + precio)
-- ----------------------------------------------------------------------------
INSERT INTO variantes (producto_id, presentacion, precio, precio_oferta, stock, orden) VALUES
  -- Jabón en polvo Ala
  ((SELECT id FROM productos WHERE slug='jabon-polvo-ala'), '800 g',  4450,  NULL, 50, 1),
  ((SELECT id FROM productos WHERE slug='jabon-polvo-ala'), '2,5 kg', 9800,  NULL, 25, 2),
  ((SELECT id FROM productos WHERE slug='jabon-polvo-ala'), '5 kg',   17500, NULL, 15, 3),
  -- Jabón en polvo Skip
  ((SELECT id FROM productos WHERE slug='jabon-polvo-skip'), '800 g',  5400,  NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='jabon-polvo-skip'), '2,5 kg', 12400, NULL, 20, 2),
  -- Jabón líquido Skip
  ((SELECT id FROM productos WHERE slug='jabon-liquido-skip'), '1,5 L', 6900,  NULL, 35, 1),
  ((SELECT id FROM productos WHERE slug='jabon-liquido-skip'), '3 L',   12400, NULL, 18, 2),
  -- Suavizante Vivere
  ((SELECT id FROM productos WHERE slug='suavizante-vivere'), '900 ml', 4200, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='suavizante-vivere'), '2,8 L',  9800, NULL, 20, 2),
  -- Jabón en pan / quitamanchas / blanqueador
  ((SELECT id FROM productos WHERE slug='jabon-lavar-pan'), 'Pack x3', 1800, NULL, 50, 1),
  ((SELECT id FROM productos WHERE slug='quitamanchas'),    '450 ml',  3600, NULL, 30, 1),
  ((SELECT id FROM productos WHERE slug='blanqueador-ropa'), '1 L',    1750, NULL, 30, 1),

  -- Baño
  ((SELECT id FROM productos WHERE slug='desinfectante-lysoform'), '360 ml Spray', 3200, NULL, 35, 1),
  ((SELECT id FROM productos WHERE slug='limpiador-poett-bano'),   '500 ml',       2450, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='pastillas-inodoro'),      'Pack x2',      2800, NULL, 35, 1),
  ((SELECT id FROM productos WHERE slug='desodorante-ambiente'),   '360 ml',       2600, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='lavandina-gel'),          '900 ml',       3200, NULL, 30, 1),
  ((SELECT id FROM productos WHERE slug='jabon-manos'),            '500 ml',       2900, NULL, 45, 1),

  -- Accesorios
  ((SELECT id FROM productos WHERE slug='escoba'),            'Unidad', 5200, NULL, 25, 1),
  ((SELECT id FROM productos WHERE slug='secador-piso'),      'Unidad', 4800, NULL, 20, 1),
  ((SELECT id FROM productos WHERE slug='balde-10l'),         'Unidad', 3900, NULL, 30, 1),
  ((SELECT id FROM productos WHERE slug='trapos-piso'),       'Pack x3', 2100, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='guantes-limpieza'),  'Talle M', 2600, NULL, 30, 1),
  ((SELECT id FROM productos WHERE slug='guantes-limpieza'),  'Talle L', 2600, NULL, 30, 2),
  ((SELECT id FROM productos WHERE slug='panos-microfibra'),  'Pack x4', 3200, NULL, 35, 1),
  ((SELECT id FROM productos WHERE slug='cepillo-bano'),      'Unidad', 2300, NULL, 25, 1),
  ((SELECT id FROM productos WHERE slug='plumero'),           'Unidad', 2900, NULL, 20, 1),
  ((SELECT id FROM productos WHERE slug='mopa-piso'),         'Unidad', 5600, NULL, 18, 1),

  -- Combos y ofertas
  ((SELECT id FROM productos WHERE slug='combo-bano'),  'Kit completo', 7900,  7200,  12, 1),
  ((SELECT id FROM productos WHERE slug='combo-ropa'),  'Kit completo', 13500, 11800, 10, 1),
  ((SELECT id FROM productos WHERE slug='combo-hogar'), 'Kit completo', 29000, 24500, 8,  1);

COMMIT;
