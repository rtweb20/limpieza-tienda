# Marcas y subcategorías

En Administración → Productos → Editar, completar Marca y Subcategoría / tipo de producto. Se puede escribir cualquier marca o tipo nuevo. La categoría general (Ropa, Baño, etc.) se mantiene.

Ejemplos: Saphirus → Aerosoles, Difusores, Difusores para auto, Aromatizantes textiles, Home spray o Aceites aromáticos. Para otras marcas se puede cargar cualquier tipo que venda el local.

La tienda muestra filtros de Marca y Tipo de producto. Los tipos se calculan a partir de los productos que coinciden con la marca, categoría y búsqueda seleccionadas. No aparecen tipos vacíos. Las tarjetas y el detalle muestran la clasificación. Los videos de todas las marcas con nombre permiten abrir sus productos.

Los productos anteriores reciben una clasificación sugerida cuando el nombre o categoría permiten reconocerla. Los datos ingresados manualmente tienen prioridad. Los productos ambiguos deben completarse desde el administrador: el repositorio no contiene el catálogo real del comercio.

## Instalación

Reemplazar los archivos del ZIP respetando sus carpetas. Incluye cambios de Java, HTML, CSS y JS: requiere volver a compilar y desplegar el backend. No alcanza con subir styles.css.

schema.sql agrega las columnas marca y subcategoria con ALTER TABLE ADD COLUMN IF NOT EXISTS, sin borrar productos. El arranque actual ejecuta este esquema y también mantiene hibernate.ddl-auto=update. database/schema.sql contiene la misma ampliación para instalaciones manuales.

## Verificación

node backend/src/test/js/clasificacion.test.cjs

Prueba los filtros de varias marcas, tipos dependientes y su restablecimiento. Las pruebas Java están en backend/src/test/java/com/limpieza/tienda/service/ClasificacionProductoTest.java y se ejecutan con Maven: mvn test desde backend.

En esta sesión pasaron las pruebas JavaScript y los chequeos de sintaxis. No se pudo compilar el backend porque faltan las dependencias de Spring/JPA en el entorno local. No se verificó el despliegue ni la base de datos real.
