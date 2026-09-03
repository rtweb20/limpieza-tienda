-- ============================================================================
--  AROMA A LIMPIO — Datos iniciales (PostgreSQL) — manual/opcional
--  Ejecutar DESPUÉS de schema.sql (solo si NO se usa el auto-arranque).
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
  ('Accesorios',       'accesorios', '🧹', 3, TRUE, FALSE);

COMMIT;
