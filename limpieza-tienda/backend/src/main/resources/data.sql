-- ============================================================================
--  AROMA A LIMPIO — Datos iniciales (PostgreSQL)
--  Se ejecuta automáticamente al arrancar (spring.sql.init.mode=always).
--
--  * Sin categoría "Cocina" (a pedido del local).
--  * El catálogo de productos arranca VACÍO: los productos los carga el dueño
--    escaneando los códigos de barras desde la pantalla "Carga con lector".
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- CATEGORÍAS
-- ----------------------------------------------------------------------------
INSERT INTO categorias (nombre, slug, icono, orden, activa, destacada) VALUES
  ('Combos y Ofertas', 'combos',     '🔥', 0, TRUE, TRUE),
  ('Ropa',             'ropa',       '🧺', 1, TRUE, FALSE),
  ('Baño',             'bano',       '🚿', 2, TRUE, FALSE),
  ('Accesorios',       'accesorios', '🧹', 3, TRUE, FALSE) ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- CATÁLOGO DE AROMAS (pestaña "🌸 Aromas" del panel) — carga única e
-- idempotente: si ya corrió antes, ON CONFLICT evita duplicar filas.
-- Nota: Saphirus no distingue "Textil 120cc" de "Textil 500cc" en su lista
-- (una sola columna "TEXTILES"), así que se cargó como TEXTIL_120CC.
-- ----------------------------------------------------------------------------

-- SANDRA MARZÁN — AEROSOL
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'AEROSOL', 'ACQUA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'ANANA COCO'),
  ('SANDRA_MARZAN', 'AEROSOL', 'AZAHARES'),
  ('SANDRA_MARZAN', 'AEROSOL', 'BURBUJAS DE JABON'),
  ('SANDRA_MARZAN', 'AEROSOL', 'CHER'),
  ('SANDRA_MARZAN', 'AEROSOL', 'CITRONELLA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'DEDITOS'),
  ('SANDRA_MARZAN', 'AEROSOL', 'FLOR DE LOTO'),
  ('SANDRA_MARZAN', 'AEROSOL', 'FLORES CITRICAS'),
  ('SANDRA_MARZAN', 'AEROSOL', 'FRUTAS TROPICALES'),
  ('SANDRA_MARZAN', 'AEROSOL', 'HOJAS DE HIGUERA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'LEFRANCE'),
  ('SANDRA_MARZAN', 'AEROSOL', 'MADERAS DE ORIENTE'),
  ('SANDRA_MARZAN', 'AEROSOL', 'NARANJA PIMIENTA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'NEBESITAS'),
  ('SANDRA_MARZAN', 'AEROSOL', 'SUAVECHITO'),
  ('SANDRA_MARZAN', 'AEROSOL', 'SUAVIDAD FLORAR'),
  ('SANDRA_MARZAN', 'AEROSOL', 'SUEÑITOS'),
  ('SANDRA_MARZAN', 'AEROSOL', 'TE NEGRO Y DAMAZCO'),
  ('SANDRA_MARZAN', 'AEROSOL', 'UVA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'VAINILLA Y ALMENDRA'),
  ('SANDRA_MARZAN', 'AEROSOL', 'VERVENA')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SANDRA MARZÁN — DIFUSOR AUTO
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'ACQUA CAR'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'ANANA COCO'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'CITRONELLA'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'DIFUSOR'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'FLOR DE LOTO'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'FRORES CITRICAS'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'FRUTAS TROPICALES'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'GLASE NARANJA'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'LAVANDA'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'MAD DE ORIENTE'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'MANDARINA DULCE'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'MELON MANGO'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'NARANJA PIMIENTA'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'SUAVECHITO'),
  ('SANDRA_MARZAN', 'DIFUSOR_AUTO', 'VERVENA')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SANDRA MARZÁN — HOME SPRAY
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'HOME_SPRAY', 'AMAPOLA Y ROSAS'),
  ('SANDRA_MARZAN', 'HOME_SPRAY', 'GARDENIA FLORES BCAS'),
  ('SANDRA_MARZAN', 'HOME_SPRAY', 'ORQUIDEA FLOR DE LOTO')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SANDRA MARZÁN — ACEITES
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'ACEITES', 'CITRONELLA'),
  ('SANDRA_MARZAN', 'ACEITES', 'GLASE NARANJA'),
  ('SANDRA_MARZAN', 'ACEITES', 'MAD DE ORIENTE'),
  ('SANDRA_MARZAN', 'ACEITES', 'VERVENA')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SANDRA MARZÁN — TEXTIL 120CC
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'ACQUA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'ACQUA CAR'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'ANANA COCO'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'AZAHARES'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'BLUE'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'BURBUJAS JABON'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'CHER'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'COCO VAINILLA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'COSITAS'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'FLOR DE LOTO'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'FLORES CITRICAS'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'FRUTAS TROPIC'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'GLASE NARANJA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'HOJAS DE HIGUERA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'HUMOR'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'INVIC'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'LA VIE'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'LIMON MANZANILLA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'MAD DE ORIENTE'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'MARINA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'MILLON'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'NARANJA PIMIENTA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'NUVECITAS'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'ONE'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'PITANGA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'SUAV FLORAL'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'SUAVECHITO'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'SUEÑITOS'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'TE NEGRO DAMASCO'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'UVA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'VAINILLA ALMENDRA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'VERVENA'),
  ('SANDRA_MARZAN', 'TEXTIL_120CC', 'WAN')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SANDRA MARZÁN — TEXTIL 500CC
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'ACQUA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'ANANA COCO'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'ARRORO'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'AZAHARES'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'BABIES'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'BLUE'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'BURBUJAS JABON'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'CHER'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'COCO VAINILLA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'COSITAS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'DEDITOS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'FLOR DE LOTO'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'FLORES CITRICAS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'FRUTAS TROPIC'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'GLASE NARANJA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'HOJAS DE HIGUERA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'HUMOR'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'INVIC'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'LA VIE'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'LE FRANCE'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'LIMON MANZANILLA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'MAD DE ORIENTE'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'MARINA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'MILLION'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'MIMITOS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'MUJERCITAS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'NARANJA PIMIENTA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'NUVECITAS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'ONE'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'SUAV FLORAL'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'SUAVECHITO'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'SUEÑITOS'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'TARTINET'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'TE NEGRO DAMASCO'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'UVA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'VAINILLA ALMENDRA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'VERDAD CONSECUEN'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'VERVENA'),
  ('SANDRA_MARZAN', 'TEXTIL_500CC', 'WAN')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SAPHIRUS — AEROSOL
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SAPHIRUS', 'AEROSOL', 'AMOUR/SOFT LOVE'),
  ('SAPHIRUS', 'AEROSOL', 'ANGEL/HEAVEN AND HELL'),
  ('SAPHIRUS', 'AEROSOL', 'ANTITABACO'),
  ('SAPHIRUS', 'AEROSOL', 'APOLO/VELOCITY'),
  ('SAPHIRUS', 'AEROSOL', 'APPLE'),
  ('SAPHIRUS', 'AEROSOL', 'BAMBOO'),
  ('SAPHIRUS', 'AEROSOL', 'BB'),
  ('SAPHIRUS', 'AEROSOL', 'BELLA/LIFE IN PETALS'),
  ('SAPHIRUS', 'AEROSOL', 'BERGAMOTA NARANJA'),
  ('SAPHIRUS', 'AEROSOL', 'BLUE/CAPRI SUMMER'),
  ('SAPHIRUS', 'AEROSOL', 'BOUQUET FLORAL'),
  ('SAPHIRUS', 'AEROSOL', 'BREEZE'),
  ('SAPHIRUS', 'AEROSOL', 'BUBBLEGUM'),
  ('SAPHIRUS', 'AEROSOL', 'CAFÉ Y CHOCOLATE'),
  ('SAPHIRUS', 'AEROSOL', 'CAPUCCINO'),
  ('SAPHIRUS', 'AEROSOL', 'CIRUELA'),
  ('SAPHIRUS', 'AEROSOL', 'CITRONELLA'),
  ('SAPHIRUS', 'AEROSOL', 'CITRUS'),
  ('SAPHIRUS', 'AEROSOL', 'CLEAN COTTON'),
  ('SAPHIRUS', 'AEROSOL', 'COCO MARACUYÁ'),
  ('SAPHIRUS', 'AEROSOL', 'COCO VAINILLA'),
  ('SAPHIRUS', 'AEROSOL', 'CONY'),
  ('SAPHIRUS', 'AEROSOL', 'CRISTOBAL'),
  ('SAPHIRUS', 'AEROSOL', 'DAMASCO'),
  ('SAPHIRUS', 'AEROSOL', 'DANIEL'),
  ('SAPHIRUS', 'AEROSOL', 'DUVET'),
  ('SAPHIRUS', 'AEROSOL', 'ETIQUETA NEGRA'),
  ('SAPHIRUS', 'AEROSOL', 'FANTASÍA'),
  ('SAPHIRUS', 'AEROSOL', 'FAREN/SUNSET FIRE'),
  ('SAPHIRUS', 'AEROSOL', 'FLORES BLANCAS'),
  ('SAPHIRUS', 'AEROSOL', 'FLOWERS/BLOSSOM ROUGE'),
  ('SAPHIRUS', 'AEROSOL', 'FRESIAS BERGAMOTA'),
  ('SAPHIRUS', 'AEROSOL', 'FRUTILLA'),
  ('SAPHIRUS', 'AEROSOL', 'GREEN'),
  ('SAPHIRUS', 'AEROSOL', 'GUARANÁ'),
  ('SAPHIRUS', 'AEROSOL', 'HAWAI'),
  ('SAPHIRUS', 'AEROSOL', 'INDIANA'),
  ('SAPHIRUS', 'AEROSOL', 'INVICTO/ATLANTIS'),
  ('SAPHIRUS', 'AEROSOL', 'JAZMIN'),
  ('SAPHIRUS', 'AEROSOL', 'LADY/GOLDEN LADY'),
  ('SAPHIRUS', 'AEROSOL', 'LAVANDA'),
  ('SAPHIRUS', 'AEROSOL', 'LAVANDA TE VERDE'),
  ('SAPHIRUS', 'AEROSOL', 'LIM DUL VAI'),
  ('SAPHIRUS', 'AEROSOL', 'LIMON'),
  ('SAPHIRUS', 'AEROSOL', 'LINAH'),
  ('SAPHIRUS', 'AEROSOL', 'LOLA'),
  ('SAPHIRUS', 'AEROSOL', 'LONDON'),
  ('SAPHIRUS', 'AEROSOL', 'MAGNOLIAS Y FRESIAS'),
  ('SAPHIRUS', 'AEROSOL', 'MANDARINA'),
  ('SAPHIRUS', 'AEROSOL', 'MANGO'),
  ('SAPHIRUS', 'AEROSOL', 'MANZANA CANELA'),
  ('SAPHIRUS', 'AEROSOL', 'MARACUYA'),
  ('SAPHIRUS', 'AEROSOL', 'MARINO'),
  ('SAPHIRUS', 'AEROSOL', 'MELÓN'),
  ('SAPHIRUS', 'AEROSOL', 'MERY'),
  ('SAPHIRUS', 'AEROSOL', 'MIEL Y LIMÓN'),
  ('SAPHIRUS', 'AEROSOL', 'MITO'),
  ('SAPHIRUS', 'AEROSOL', 'MIX TROPICAL'),
  ('SAPHIRUS', 'AEROSOL', 'NARANJA CHOCOLATE'),
  ('SAPHIRUS', 'AEROSOL', 'NARANJA PIMIENTA'),
  ('SAPHIRUS', 'AEROSOL', 'NEW YORK'),
  ('SAPHIRUS', 'AEROSOL', 'NINA/CRISTAL EDÉN'),
  ('SAPHIRUS', 'AEROSOL', 'OLIMPIC/CELESTIAL WINGS'),
  ('SAPHIRUS', 'AEROSOL', 'ONE MILLION/GOLDEN LORD'),
  ('SAPHIRUS', 'AEROSOL', 'ORANGE'),
  ('SAPHIRUS', 'AEROSOL', 'ORIENTE'),
  ('SAPHIRUS', 'AEROSOL', 'PALACE'),
  ('SAPHIRUS', 'AEROSOL', 'PALO SANTO'),
  ('SAPHIRUS', 'AEROSOL', 'PAPAYA'),
  ('SAPHIRUS', 'AEROSOL', 'PATIO'),
  ('SAPHIRUS', 'AEROSOL', 'PAULA'),
  ('SAPHIRUS', 'AEROSOL', 'PEONÍAS Y CEDRO'),
  ('SAPHIRUS', 'AEROSOL', 'PERAS Y DURAZNOS'),
  ('SAPHIRUS', 'AEROSOL', 'PERAS Y FLORES'),
  ('SAPHIRUS', 'AEROSOL', 'PINK'),
  ('SAPHIRUS', 'AEROSOL', 'PITANGA'),
  ('SAPHIRUS', 'AEROSOL', 'POMELO ROSADO'),
  ('SAPHIRUS', 'AEROSOL', 'PRAGA'),
  ('SAPHIRUS', 'AEROSOL', 'ROCÍO'),
  ('SAPHIRUS', 'AEROSOL', 'ROSAS'),
  ('SAPHIRUS', 'AEROSOL', 'SANDÍA PEPINO'),
  ('SAPHIRUS', 'AEROSOL', 'SCANDAL MAN/GOSSIP KING'),
  ('SAPHIRUS', 'AEROSOL', 'SWEET'),
  ('SAPHIRUS', 'AEROSOL', 'TILO'),
  ('SAPHIRUS', 'AEROSOL', 'TOKIO'),
  ('SAPHIRUS', 'AEROSOL', 'TROPICAL'),
  ('SAPHIRUS', 'AEROSOL', 'UVA'),
  ('SAPHIRUS', 'AEROSOL', 'VAINILLA'),
  ('SAPHIRUS', 'AEROSOL', 'VAINILLA TONKA'),
  ('SAPHIRUS', 'AEROSOL', 'VERVENA'),
  ('SAPHIRUS', 'AEROSOL', 'VIOLETAS'),
  ('SAPHIRUS', 'AEROSOL', 'WANTED/LAST SHOT')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SAPHIRUS — DIFUSOR (planilla original: "DIFUSORES")
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SAPHIRUS', 'DIFUSOR', 'ADVENTURE/NIGHT EMPIRE'),
  ('SAPHIRUS', 'DIFUSOR', 'AMOUR/SOFT LOVE'),
  ('SAPHIRUS', 'DIFUSOR', 'APPLE'),
  ('SAPHIRUS', 'DIFUSOR', 'BAD MAN/SHADOW STORM'),
  ('SAPHIRUS', 'DIFUSOR', 'BAMBOO'),
  ('SAPHIRUS', 'DIFUSOR', 'BB'),
  ('SAPHIRUS', 'DIFUSOR', 'BELLA/LIFE IN PETALS'),
  ('SAPHIRUS', 'DIFUSOR', 'BERGAMOTAS Y CEDRO'),
  ('SAPHIRUS', 'DIFUSOR', 'BREEZE'),
  ('SAPHIRUS', 'DIFUSOR', 'BUBBLEGUM'),
  ('SAPHIRUS', 'DIFUSOR', 'CAFÉ Y CHOCOLATE'),
  ('SAPHIRUS', 'DIFUSOR', 'CAPUCCINO'),
  ('SAPHIRUS', 'DIFUSOR', 'CITRONELLA'),
  ('SAPHIRUS', 'DIFUSOR', 'CITRUS'),
  ('SAPHIRUS', 'DIFUSOR', 'COCO MARACUYÁ'),
  ('SAPHIRUS', 'DIFUSOR', 'COCO VAINILLA'),
  ('SAPHIRUS', 'DIFUSOR', 'CONY'),
  ('SAPHIRUS', 'DIFUSOR', 'COOKIES AND CREAM'),
  ('SAPHIRUS', 'DIFUSOR', 'CRISTOBAL'),
  ('SAPHIRUS', 'DIFUSOR', 'DAMASCO'),
  ('SAPHIRUS', 'DIFUSOR', 'DUVET'),
  ('SAPHIRUS', 'DIFUSOR', 'FLORES BLANCAS'),
  ('SAPHIRUS', 'DIFUSOR', 'FLORES SILVESTRES'),
  ('SAPHIRUS', 'DIFUSOR', 'FLOWERS/BLOSSOM ROUGE'),
  ('SAPHIRUS', 'DIFUSOR', 'FRESIAS BERGAMOTA'),
  ('SAPHIRUS', 'DIFUSOR', 'FRUTOS PATAGÓNICOS'),
  ('SAPHIRUS', 'DIFUSOR', 'GREEN/TÉ VERDE'),
  ('SAPHIRUS', 'DIFUSOR', 'GUARANA'),
  ('SAPHIRUS', 'DIFUSOR', 'HAWAI'),
  ('SAPHIRUS', 'DIFUSOR', 'INDIANA'),
  ('SAPHIRUS', 'DIFUSOR', 'INVICTO/ATLANTIS'),
  ('SAPHIRUS', 'DIFUSOR', 'JAZMIN'),
  ('SAPHIRUS', 'DIFUSOR', 'LAVANDA'),
  ('SAPHIRUS', 'DIFUSOR', 'LILAS'),
  ('SAPHIRUS', 'DIFUSOR', 'LIMA LIMON'),
  ('SAPHIRUS', 'DIFUSOR', 'LIMON'),
  ('SAPHIRUS', 'DIFUSOR', 'LIMÓN DULCE VAINILLA'),
  ('SAPHIRUS', 'DIFUSOR', 'LINAH'),
  ('SAPHIRUS', 'DIFUSOR', 'LOLA'),
  ('SAPHIRUS', 'DIFUSOR', 'LONDON'),
  ('SAPHIRUS', 'DIFUSOR', 'MAGNOLIAS Y FRESIAS'),
  ('SAPHIRUS', 'DIFUSOR', 'MANGO'),
  ('SAPHIRUS', 'DIFUSOR', 'MANZANA CANELA'),
  ('SAPHIRUS', 'DIFUSOR', 'MARACUYA'),
  ('SAPHIRUS', 'DIFUSOR', 'MARINO'),
  ('SAPHIRUS', 'DIFUSOR', 'MELOCOTON BLANCO'),
  ('SAPHIRUS', 'DIFUSOR', 'MELON'),
  ('SAPHIRUS', 'DIFUSOR', 'MERY'),
  ('SAPHIRUS', 'DIFUSOR', 'MIEL LIMON'),
  ('SAPHIRUS', 'DIFUSOR', 'NARANJA CHOCOLATE'),
  ('SAPHIRUS', 'DIFUSOR', 'NARANJA PIMIENTA'),
  ('SAPHIRUS', 'DIFUSOR', 'NINA/CRISTAL EDÉN'),
  ('SAPHIRUS', 'DIFUSOR', 'ORANGE'),
  ('SAPHIRUS', 'DIFUSOR', 'ORIENTE'),
  ('SAPHIRUS', 'DIFUSOR', 'PALO SANTO'),
  ('SAPHIRUS', 'DIFUSOR', 'PAPAYA'),
  ('SAPHIRUS', 'DIFUSOR', 'PATIO'),
  ('SAPHIRUS', 'DIFUSOR', 'PAULA'),
  ('SAPHIRUS', 'DIFUSOR', 'PEONÍAS CEDRO'),
  ('SAPHIRUS', 'DIFUSOR', 'PERAS Y DURAZNO'),
  ('SAPHIRUS', 'DIFUSOR', 'PERAS Y FLORES'),
  ('SAPHIRUS', 'DIFUSOR', 'POMELO ROSADO'),
  ('SAPHIRUS', 'DIFUSOR', 'PÉTALOS DE ORQUÍDEA'),
  ('SAPHIRUS', 'DIFUSOR', 'ROCIO'),
  ('SAPHIRUS', 'DIFUSOR', 'ROSAS'),
  ('SAPHIRUS', 'DIFUSOR', 'SANDÍA PEPINO'),
  ('SAPHIRUS', 'DIFUSOR', 'SÁNDALO Y VIOLETA'),
  ('SAPHIRUS', 'DIFUSOR', 'TAEWOOD'),
  ('SAPHIRUS', 'DIFUSOR', 'TOKIO'),
  ('SAPHIRUS', 'DIFUSOR', 'TROPICAL'),
  ('SAPHIRUS', 'DIFUSOR', 'UVA'),
  ('SAPHIRUS', 'DIFUSOR', 'VAINILLA'),
  ('SAPHIRUS', 'DIFUSOR', 'VERVENA'),
  ('SAPHIRUS', 'DIFUSOR', 'VIOLETAS'),
  ('SAPHIRUS', 'DIFUSOR', 'WANTED/LAST SHOT')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- SAPHIRUS — TEXTIL 120CC (planilla original: "TEXTILES", una sola columna sin distinguir cc)
INSERT INTO aromas_catalogo (marca, categoria, nombre) VALUES
  ('SAPHIRUS', 'TEXTIL_120CC', 'ADVENTURE/NIGHT EMPIRE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'AMOUR/SOFT LOVE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ANGEL/HAEVEN AND HELL'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ANTITABACO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'APOLO/VELOCITY'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'APPLE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BAD MAN/SHADOW STORK'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BAMBOO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BB'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BEAUTY/GREEN EDÉN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BELLA/LIFE IN PETALS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BLACK XS/NOCTURNAL SHADOW'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BLUE/CAPRI SUMMER'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BREEZE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'BUBBLEGUM'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'CELEBRITY SHOE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'CEREZA MALBEC'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'CITRUS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'COCO VAINILLA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'CONY'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'CRISTOBAL'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'DANIEL'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'DUE/DUE FUSIÓN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'DUVET'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ERBA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ETIQUETA NEGRA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FAMA/GLITTERBOT'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FAREN/SUNSET FIRE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FLORES BLANCAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FLORES SILVESTRES'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FLOWERS/BLOSSOM ROUGE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FRESIAS BERGAMOTA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'FRUTILLA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'GHOST/SILVER BOT'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'GOOD WOMEN/CELEBRITY SHOE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'GREEN TÉ VERDE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'GUARANA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'HAWAI'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'HIPNOTIC/RED VAINILLA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'INDIANA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'INVICTO LEGEND/ATLANTIS BLUE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'INVICTO/ATLANTIS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'JAZMIN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LADY/GOLDEN LADY'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LAVANDA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LILAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LIMA LIMON'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LIMON'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LIMÓN DULCE Y VAINILLAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LINAH'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LOLA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'LUCY'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MAGNOLIAS Y FRESIAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MALE/SAILOR MAN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MAN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MARACUYÁ'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MARINO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MERY'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'MIDNIGHT SHADOW'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'NARANJA PIMIENTA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'NEW YORK'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'NINA/CRISTAL EDÉN'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'OLIMPIC/CELESTIAL WINGS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ONE MILLION/GOLDEN LORD'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'OPIUM/DARK NIGHT'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ORIENTE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PALACE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PAPAYA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PATIO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PAULA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PEONÍAS Y CEDRO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PISTACHO CARAMEL'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PITANGA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'POLO/JADE HOURSE'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'POMELO ROSADO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'PÉTALOS ORQUIDEA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ROCÍO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'ROSAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'SALVAJE/DEEP DESERT'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'SCANDAL FEM/GOSSIP PRINCESS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'SCANDAL MAN/GOSSIP KING'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'SÁNDALO VIOLETA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'TAEWOOD'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'TOKIO'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'TROPICAL'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'UVA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'VAINILLA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'VERBENA'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'VIOLETAS'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'WANTED/LAST SHOT'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'XS/SNAKE Y ROSES'),
  ('SAPHIRUS', 'TEXTIL_120CC', 'YOURSELF/SWEET YOURSELF')
  ON CONFLICT (marca, categoria, nombre) DO NOTHING;

-- ============================================================================
-- CARGA: Perfumes Textiles Saphirus (variante 'Saphirus', categoría 'Textiles')
-- Generado a partir del Excel de stock del dueño + fotos de la carpeta de Drive.
-- Idempotente: se puede correr las veces que haga falta sin duplicar nada.
-- ============================================================================

INSERT INTO categorias (nombre, slug, icono, orden, activa, destacada) VALUES
  ('Textiles', 'textiles', '🌸', 4, TRUE, FALSE)
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Antitabaco', 'textil-saphirus-antitabaco', 'img/textiles/antitabaco.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-antitabaco'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Apple', 'textil-saphirus-apple', 'img/textiles/apple.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-apple'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Atlantis', 'textil-saphirus-atlantis', 'img/textiles/atlantis.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 4, TRUE FROM productos WHERE slug = 'textil-saphirus-atlantis'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Bamboo', 'textil-saphirus-bamboo', 'img/textiles/bamboo.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-bamboo'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Bebé', 'textil-saphirus-bebe', 'img/textiles/bebe.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-bebe'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Bergamota & Cedro', 'textil-saphirus-bergamota-cedro', 'img/textiles/bergamota-cedro.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-bergamota-cedro'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Blossom Rouge', 'textil-saphirus-blossom-rouge', 'img/textiles/blossom-rouge.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-blossom-rouge'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Breeze', 'textil-saphirus-breeze', 'img/textiles/breeze.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-breeze'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Bubblegum', 'textil-saphirus-bubblegum', 'img/textiles/bubblegum.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-bubblegum'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Capri Summer', 'textil-saphirus-capri-summer', 'img/textiles/capri-summer.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 0, TRUE FROM productos WHERE slug = 'textil-saphirus-capri-summer'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Celebrity Shoe', 'textil-saphirus-celebrity-shoe', 'img/textiles/celebrity-shoe.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-celebrity-shoe'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Celestial Wings (Olimpic)', 'textil-saphirus-celestial-wings-olimpic', 'img/textiles/celestial-wings-olimpic.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-celestial-wings-olimpic'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Cereza Malbec', 'textil-saphirus-cereza-malbec', 'img/textiles/cereza-malbec.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-cereza-malbec'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Citrus', 'textil-saphirus-citrus', 'img/textiles/citrus.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-citrus'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Coco Vai', 'textil-saphirus-coco-vai', 'img/textiles/coco-vai.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 4, TRUE FROM productos WHERE slug = 'textil-saphirus-coco-vai'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Cony', 'textil-saphirus-cony', 'img/textiles/cony.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-cony'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Cristóbal', 'textil-saphirus-cristobal', 'img/textiles/cristobal.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-cristobal'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Daniel', 'textil-saphirus-daniel', 'img/textiles/daniel.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-daniel'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Due Fusion', 'textil-saphirus-due-fusion', 'img/textiles/due-fusion.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-due-fusion'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Duvet', 'textil-saphirus-duvet', 'img/textiles/duvet.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-duvet'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Erba', 'textil-saphirus-erba', 'img/textiles/erba.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-erba'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Etiqueta', 'textil-saphirus-etiqueta', 'img/textiles/etiqueta.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-etiqueta'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Flores Blancas', 'textil-saphirus-flores-blancas', 'img/textiles/flores-blancas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-flores-blancas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Flores Silvestres', 'textil-saphirus-flores-silvestres', 'img/textiles/flores-silvestres.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-flores-silvestres'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Fresias y Bergamota', 'textil-saphirus-fresias-y-bergamota', 'img/textiles/fresias-y-bergamota.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-fresias-y-bergamota'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Frutilla', 'textil-saphirus-frutilla', 'img/textiles/frutilla.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-frutilla'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Frutos Patagónicos', 'textil-saphirus-frutos-patagonicos', 'img/textiles/sin-foto.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-frutos-patagonicos'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Glitter Bot', 'textil-saphirus-glitter-bot', 'img/textiles/glitter-bot.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-glitter-bot'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Golden Lady', 'textil-saphirus-golden-lady', 'img/textiles/golden-lady.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-golden-lady'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Golden Lord', 'textil-saphirus-golden-lord', 'img/textiles/golden-lord.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-golden-lord'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Gossip King', 'textil-saphirus-gossip-king', 'img/textiles/gossip-king.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 4, TRUE FROM productos WHERE slug = 'textil-saphirus-gossip-king'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Gossip Princess', 'textil-saphirus-gossip-princess', 'img/textiles/gossip-princess.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-gossip-princess'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Green', 'textil-saphirus-green', 'img/textiles/green.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-green'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Guaraná', 'textil-saphirus-guarana', 'img/textiles/guarana.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-guarana'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Hawai', 'textil-saphirus-hawai', 'img/textiles/hawai.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-hawai'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Indiana', 'textil-saphirus-indiana', 'img/textiles/indiana.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-indiana'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Jade Horse (Polo)', 'textil-saphirus-jade-horse-polo', 'img/textiles/jade-horse-polo.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-jade-horse-polo'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Jazmín', 'textil-saphirus-jazmin', 'img/textiles/jazmin.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-jazmin'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Last Shot', 'textil-saphirus-last-shot', 'img/textiles/last-shot.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-last-shot'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Lilas', 'textil-saphirus-lilas', 'img/textiles/lilas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-lilas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Limón', 'textil-saphirus-limon', 'img/textiles/limon.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-limon'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Limón Dulce y Vainilla', 'textil-saphirus-limon-dulce-y-vainilla', 'img/textiles/limon-dulce-y-vainilla.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-limon-dulce-y-vainilla'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Linah', 'textil-saphirus-linah', 'img/textiles/linah.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-linah'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Lavanda', 'textil-saphirus-lavanda', 'img/textiles/lavanda.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-lavanda'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Lola', 'textil-saphirus-lola', 'img/textiles/lola.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-lola'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Lucy', 'textil-saphirus-lucy', 'img/textiles/lucy.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-lucy'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Man', 'textil-saphirus-man', 'img/textiles/man.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-man'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Marino', 'textil-saphirus-marino', 'img/textiles/marino.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-marino'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'New York', 'textil-saphirus-new-york', 'img/textiles/new-york.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-new-york'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Nocturnal Shadow', 'textil-saphirus-nocturnal-shadow', 'img/textiles/nocturnal-shadow.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-nocturnal-shadow'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Oriente', 'textil-saphirus-oriente', 'img/textiles/oriente.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-oriente'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Palace', 'textil-saphirus-palace', 'img/textiles/palace.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-palace'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Papaya', 'textil-saphirus-papaya', 'img/textiles/papaya.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-papaya'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Patio', 'textil-saphirus-patio', 'img/textiles/patio.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-patio'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Paula', 'textil-saphirus-paula', 'img/textiles/paula.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-paula'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Peonias y Cedro', 'textil-saphirus-peonias-y-cedro', 'img/textiles/peonias-y-cedro.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 4, TRUE FROM productos WHERE slug = 'textil-saphirus-peonias-y-cedro'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Pistacho Caramel', 'textil-saphirus-pistacho-caramel', 'img/textiles/pistacho-caramel.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-pistacho-caramel'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Pitanga', 'textil-saphirus-pitanga', 'img/textiles/pitanga.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-pitanga'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Pétalos de Orquídeas', 'textil-saphirus-petalos-de-orquideas', 'img/textiles/petalos-de-orquideas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 4, TRUE FROM productos WHERE slug = 'textil-saphirus-petalos-de-orquideas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Red Vanilla', 'textil-saphirus-red-vanilla', 'img/textiles/red-vanilla.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-red-vanilla'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Rocío', 'textil-saphirus-rocio', 'img/textiles/rocio.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-rocio'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Rosas', 'textil-saphirus-rosas', 'img/textiles/rosas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-rosas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Sailor Man (male)', 'textil-saphirus-sailor-man-male', 'img/textiles/sailor-man-male.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-sailor-man-male'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Salvaje', 'textil-saphirus-salvaje', 'img/textiles/salvaje.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 0, TRUE FROM productos WHERE slug = 'textil-saphirus-salvaje'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Snake & Roses', 'textil-saphirus-snake-roses', 'img/textiles/snake-roses.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-snake-roses'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Sunset Fire', 'textil-saphirus-sunset-fire', 'img/textiles/sunset-fire.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-sunset-fire'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Sándalo y Violetas', 'textil-saphirus-sandalo-y-violetas', 'img/textiles/sandalo-y-violetas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-sandalo-y-violetas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Teakwood', 'textil-saphirus-teakwood', 'img/textiles/teakwood.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-teakwood'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Tokyo', 'textil-saphirus-tokyo', 'img/textiles/tokyo.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-tokyo'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Tropical', 'textil-saphirus-tropical', 'img/textiles/tropical.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-tropical'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Uva', 'textil-saphirus-uva', 'img/textiles/uva.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-uva'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Vainilla', 'textil-saphirus-vainilla', 'img/textiles/vainilla.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-vainilla'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Velocity', 'textil-saphirus-velocity', 'img/textiles/velocity.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 1, TRUE FROM productos WHERE slug = 'textil-saphirus-velocity'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Verbena', 'textil-saphirus-verbena', 'img/textiles/verbena.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-verbena'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Violetas', 'textil-saphirus-violetas', 'img/textiles/violetas.jpg', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 2, TRUE FROM productos WHERE slug = 'textil-saphirus-violetas'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

INSERT INTO productos (categoria_id, nombre, slug, imagen_url, activo)
  SELECT id, 'Suit Yourself', 'textil-saphirus-suit-yourself', 'img/textiles/suit-yourself.webp', TRUE FROM categorias WHERE slug = 'textiles'
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes (producto_id, presentacion, precio, stock, activa)
  SELECT id, 'Saphirus', 4200, 3, TRUE FROM productos WHERE slug = 'textil-saphirus-suit-yourself'
  ON CONFLICT (producto_id, presentacion) DO NOTHING;

-- Arreglo puntual: estos 6 productos se editaron desde el panel después de la
-- carga inicial (para probar el precio $4.200), lo que les cambió el slug
-- automáticamente al guardar (el panel siempre regenera el slug a partir del
-- nombre al editar). Se restaura el slug con el prefijo "textil-saphirus-"
-- para que quede igual que el resto del catálogo Saphirus, y se deja el
-- precio ya corregido en $4.200 (por si se vuelve a correr este script).
UPDATE productos SET slug = 'textil-saphirus-antitabaco' WHERE slug = 'antitabaco';
UPDATE productos SET slug = 'textil-saphirus-apple' WHERE slug = 'apple';
UPDATE productos SET slug = 'textil-saphirus-atlantis' WHERE slug = 'atlantis';
UPDATE productos SET slug = 'textil-saphirus-bamboo' WHERE slug = 'bamboo';
UPDATE productos SET slug = 'textil-saphirus-bebe' WHERE slug = 'bebe';
UPDATE productos SET slug = 'textil-saphirus-bergamota-cedro' WHERE slug = 'bergamota-cedro';

UPDATE variantes v SET precio = 4200
  FROM productos p
  WHERE v.producto_id = p.id
    AND p.categoria_id = (SELECT id FROM categorias WHERE slug = 'textiles')
    AND v.presentacion = 'Saphirus'
    AND v.precio <> 4200;
COMMIT;
