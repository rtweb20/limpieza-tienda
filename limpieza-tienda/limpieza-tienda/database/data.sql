-- ============================================================================
--  LIMPIEZA EL BARRIO — Datos iniciales de prueba (PostgreSQL)
--  Ejecutar DESPUÉS de schema.sql
--  Las imágenes son URLs externas de ejemplo (placehold.co); en producción
--  reemplazar por URLs reales (S3 / Cloudinary / Google Drive / etc.).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- CATEGORÍAS
-- ----------------------------------------------------------------------------
INSERT INTO categorias (nombre, slug, icono, orden, activa, destacada) VALUES
  ('Combos y Ofertas', 'combos',     '🔥', 0, TRUE, TRUE),
  ('Cocina',           'cocina',     '🍳', 1, TRUE, FALSE),
  ('Ropa',             'ropa',       '🧺', 2, TRUE, FALSE),
  ('Baño',             'bano',       '🚿', 3, TRUE, FALSE),
  ('Accesorios',       'accesorios', '🧹', 4, TRUE, FALSE);

-- ----------------------------------------------------------------------------
-- PRODUCTOS (categoría por slug; imagen_url = URL externa)
-- ----------------------------------------------------------------------------
INSERT INTO productos (categoria_id, nombre, slug, descripcion, imagen_url, destacado) VALUES

  -- ================= COCINA =================
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Lavandina Ayudín', 'lavandina-ayudin',
   'Desinfectante concentrado con aroma. Ideal para pisos, baños y superficies.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Lavandina', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Detergente Magistral', 'detergente-magistral',
   'Lava y desengrasa con espuma rendidora. Deja los platos brillantes.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Detergente', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Detergente Ala', 'detergente-ala',
   'Fórmula concentrada que corta la grasa con poca cantidad.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Detergente+Ala', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Limpiador Cremoso Cif', 'limpiador-cremoso-cif',
   'Crema limpiadora con micropartículas para cocina y baño.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Cif+Cremoso', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Desengrasante de Cocina', 'desengrasante-cocina',
   'Remueve grasa adherida de hornallas, campanas y mesadas.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Desengrasante', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Esponjas de Cocina (x4)', 'esponjas-cocina',
   'Pack de 4 esponjas con virulana. Doble uso para ollas y vajilla.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Esponjas', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Virulana de Acero (x8)', 'virulana-acero',
   'Pack de 8 virulanas para remover residuos difíciles sin rayar.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Virulana', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Rollo de Cocina (x3)', 'rollo-cocina',
   'Papel absorbente de doble hoja. Pack de 3 rollos.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Rollo+Cocina', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Bolsas de Residuos 60x90 (x10)', 'bolsas-residuos',
   'Bolsas reforzadas para residuos domiciliarios. Pack de 10 unidades.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Bolsas', FALSE),
  ((SELECT id FROM categorias WHERE slug='cocina'), 'Limpiavidrios', 'limpiavidrios',
   'Deja vidrios y espejos sin marcas ni película.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Limpiavidrios', FALSE),

  -- ================= ROPA =================
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón en Polvo Ala', 'jabon-polvo-ala',
   'Poder de limpieza para ropa blanca y de color. Rinde hasta 40 lavados por kilo.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Jabon+Ala', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón en Polvo Skip', 'jabon-polvo-skip',
   'Limpieza profunda con fragancia duradera para toda la familia.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Jabon+Skip', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón Líquido Skip', 'jabon-liquido-skip',
   'Fórmula líquida de fácil disolución, ideal para lavarropas de carga frontal y superior.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Skip+Liquido', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Suavizante Vivere', 'suavizante-vivere',
   'Suavidad y aroma prolongado en tus prendas.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Suavizante', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Jabón de Lavar en Pan (x3)', 'jabon-lavar-pan',
   'Jabón blanco tradicional para manchas y lavado a mano. Pack de 3 panes.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Jabon+Pan', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Quitamanchas', 'quitamanchas',
   'Elimina manchas difíciles antes del lavado.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Quitamanchas', FALSE),
  ((SELECT id FROM categorias WHERE slug='ropa'), 'Blanqueador para Ropa', 'blanqueador-ropa',
   'Blanqueador líquido con protección de colores.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Blanqueador', FALSE),

  -- ================= BAÑO =================
  ((SELECT id FROM categorias WHERE slug='bano'), 'Desinfectante Lysoform', 'desinfectante-lysoform',
   'Spray desinfectante multiuso. Elimina bacterias en superficies de baño y cocina.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Lysoform', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Limpiador Poett Baño', 'limpiador-poett-bano',
   'Limpieza y desinfección con aroma a limpio para inodoros y azulejos.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Poett+Bano', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Pastillas para Inodoro (x2)', 'pastillas-inodoro',
   'Pack de 2 pastillas con acción desodorizante y limpiadora continua.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Pastillas', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Desodorante de Ambiente', 'desodorante-ambiente',
   'Perfuma y neutraliza olores en cualquier ambiente del hogar.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Ambientador', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Lavandina en Gel Ayudín', 'lavandina-gel',
   'Lavandina en gel con aroma, más espesa para que no resbale y limpie mejor.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Lavandina+Gel', FALSE),
  ((SELECT id FROM categorias WHERE slug='bano'), 'Jabón Líquido para Manos', 'jabon-manos',
   'Jabón líquido suave con aroma fresco para el lavado diario.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Jabon+Manos', FALSE),

  -- ================= ACCESORIOS =================
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Escoba', 'escoba',
   'Escoba resistente con cerdas firmes para interiores y veredas.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Escoba', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Secador de Piso + Palo', 'secador-piso',
   'Secador de piso con goma de arrastre y palo de madera.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Secador', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Balde 10 L', 'balde-10l',
   'Balde resistente de 10 litros con asa reforzada.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Balde', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Trapos de Piso (x3)', 'trapos-piso',
   'Pack de 3 trapos de piso de algodón, súper absorbentes.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Trapos', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Guantes de Limpieza (par)', 'guantes-limpieza',
   'Guantes de látex reforzados, ideales para lavar sin lastimar las manos.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Guantes', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Paños de Microfibra (x4)', 'panos-microfibra',
   'Pack de 4 paños multiuso que no dejan pelusa. Para vidrios, muebles y autos.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Microfibra', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Cepillo de Baño', 'cepillo-bano',
   'Cepillo con mango ergonómico para inodoros y azulejos.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Cepillo', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Plumero', 'plumero',
   'Atrapa el polvo de muebles y rincones sin levantarlo.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Plumero', FALSE),
  ((SELECT id FROM categorias WHERE slug='accesorios'), 'Mopa de Piso', 'mopa-piso',
   'Mopa con cabezal giratorio y repuesto lavable. Llega a todos los rincones.',
   'https://placehold.co/600x600/F3EDE2/7A5C43?text=Mopa', FALSE),

  -- ================= COMBOS Y OFERTAS (destacados -> banner) =================
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Cocina', 'combo-cocina',
   'Detergente 750 ml + Esponjas x4 + Virulana x8. Todo para tu cocina.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=Combo+Cocina', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Baño', 'combo-bano',
   'Lysoform + Poett Baño + Pastillas x2. Baño limpio y desinfectado.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=Combo+Bano', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Ropa', 'combo-ropa',
   'Jabón Ala 800 g + Suavizante 900 ml + Quitamanchas. Ropa impecable.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=Combo+Ropa', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Combo Hogar Completo', 'combo-hogar',
   'Kit integral de limpieza para toda la casa: cocina, baño y ropa.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=Combo+Hogar', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), '2x1 Detergente Magistral 750 ml', 'oferta-detergente',
   'Llevá 2 unidades y pagá menos. Oferta por tiempo limitado.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=2x1+Magistral', TRUE),
  ((SELECT id FROM categorias WHERE slug='combos'), 'Oferta Jabón Ala 5 kg + Lavandina 5 L', 'oferta-ala-lavandina',
   'Pack rendidor para el lavado de todo el mes.',
   'https://placehold.co/600x600/FDF3E3/C0392B?text=Oferta+Ala', TRUE);

-- ----------------------------------------------------------------------------
-- VARIANTES (presentación / aroma / tamaño + precio)
-- ----------------------------------------------------------------------------
INSERT INTO variantes (producto_id, presentacion, precio, precio_oferta, stock, orden) VALUES
  -- Lavandina Ayudín
  ((SELECT id FROM productos WHERE slug='lavandina-ayudin'), '1 L',   1850, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='lavandina-ayudin'), '2 L',   3100, NULL, 30, 2),
  ((SELECT id FROM productos WHERE slug='lavandina-ayudin'), '5 L',   6500, NULL, 20, 3),
  -- Detergente Magistral
  ((SELECT id FROM productos WHERE slug='detergente-magistral'), '500 ml',  1650, NULL, 50, 1),
  ((SELECT id FROM productos WHERE slug='detergente-magistral'), '750 ml',  2150, NULL, 45, 2),
  ((SELECT id FROM productos WHERE slug='detergente-magistral'), '1,25 L',  3200, NULL, 35, 3),
  -- Detergente Ala
  ((SELECT id FROM productos WHERE slug='detergente-ala'), '750 ml', 2050, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='detergente-ala'), '1,5 L',  3600, NULL, 30, 2),
  -- Cif cremoso
  ((SELECT id FROM productos WHERE slug='limpiador-cremoso-cif'), '500 ml - Aroma Limón',   2400, NULL, 25, 1),
  ((SELECT id FROM productos WHERE slug='limpiador-cremoso-cif'), '500 ml - Aroma Lavanda', 2400, NULL, 25, 2),
  -- Desengrasante
  ((SELECT id FROM productos WHERE slug='desengrasante-cocina'), '500 ml', 2300, NULL, 30, 1),
  ((SELECT id FROM productos WHERE slug='desengrasante-cocina'), '1 L',    3900, NULL, 20, 2),
  -- Esponjas / virulana / rollo / bolsas / limpiavidrios
  ((SELECT id FROM productos WHERE slug='esponjas-cocina'), 'Pack x4', 1450, NULL, 60, 1),
  ((SELECT id FROM productos WHERE slug='virulana-acero'),  'Pack x8', 1200, NULL, 60, 1),
  ((SELECT id FROM productos WHERE slug='rollo-cocina'),    'Pack x3', 2600, NULL, 40, 1),
  ((SELECT id FROM productos WHERE slug='bolsas-residuos'), 'Pack x10', 3400, NULL, 35, 1),
  ((SELECT id FROM productos WHERE slug='limpiavidrios'),   '500 ml',  2150, NULL, 30, 1),

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

  -- Combos y ofertas (precio_oferta para mostrar el descuento)
  ((SELECT id FROM productos WHERE slug='combo-cocina'),       'Kit completo', 5500,  4800,  15, 1),
  ((SELECT id FROM productos WHERE slug='combo-bano'),         'Kit completo', 7900,  7200,  12, 1),
  ((SELECT id FROM productos WHERE slug='combo-ropa'),         'Kit completo', 13500, 11800, 10, 1),
  ((SELECT id FROM productos WHERE slug='combo-hogar'),        'Kit completo', 29000, 24500, 8,  1),
  ((SELECT id FROM productos WHERE slug='oferta-detergente'),  '2 x 750 ml',   4300,  3800,  25, 1),
  ((SELECT id FROM productos WHERE slug='oferta-ala-lavandina'), 'Pack',       24000, 19500, 10, 1);

COMMIT;
