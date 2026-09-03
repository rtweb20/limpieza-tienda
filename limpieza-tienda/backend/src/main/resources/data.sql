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

COMMIT;
