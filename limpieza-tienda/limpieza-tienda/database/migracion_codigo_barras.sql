-- ============================================================================
--  AROMA A LIMPIO — Migración: columna código de barras en `productos`
-- ============================================================================
--  Ejecutar UNA sola vez sobre una base de datos EXISTENTE que ya tenga la
--  tabla `productos`. Si vas a crear la base desde cero, usá directamente
--  `schema.sql` (que ya incluye la columna) — este archivo es solo para
--  bases ya creadas.
--
--  Notas:
--   * Índice ÚNICO sobre el código de barras → impide duplicar el mismo
--     producto y habilita el "upsert" (si existe se actualiza/suma stock).
--   * En PostgreSQL el índice es "parcial" para permitir varios NULL (productos
--     cargados a mano que todavía no tienen código).
--   * La imagen NO se guarda como BLOB: se sube a la carpeta /uploads/ del
--     servidor y en la tabla queda la RUTA (imagen_url). El nombre del archivo
--     se genera con UUID para evitar colisiones.
-- ============================================================================

-- ------------------------- PostgreSQL -------------------------
ALTER TABLE productos
    ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS uq_productos_codigo_barras
    ON productos (codigo_barras)
    WHERE codigo_barras IS NOT NULL;

-- ----------------------------------------------------------------------------
-- ------------------------- MySQL (equivalente) ------------------------------
--  Si usás MySQL en lugar de PostgreSQL, ejecutá ESTO en vez de lo de arriba.
--  En MySQL el UNIQUE ya permite múltiples NULL, así que no hace falta índice
--  parcial:
--
--  ALTER TABLE productos
--      ADD COLUMN codigo_barras VARCHAR(64) NULL AFTER imagen_url;
--
--  ALTER TABLE productos
--      ADD UNIQUE INDEX uq_productos_codigo_barras (codigo_barras);
-- ----------------------------------------------------------------------------

-- (Opcional) Verificación:
--   \d productos              -- en psql muestra la columna y el índice
--   SELECT codigo_barras, count(*) FROM productos GROUP BY codigo_barras;
