# 📷 Carga de productos con código de barras — Aroma a Limpio

Funcionalidad para cargar e inventariar productos escaneando el **código de
barras físico**. Hay dos formas de escanear:

1. **Lector USB o Bluetooth** — funciona como un teclado: escribe el número y
   envía un **Enter** al final.
2. **Cámara del celular** — botón **"📷 Escanear con la cámara"** que abre la
   cámara del teléfono y lee el código sin necesidad de lector externo.

## 📱 Cómo escanear con el celular (paso a paso)

1. Abrí la tienda en el teléfono (la URL de Render, ej.
   `https://tu-servicio.onrender.com/`).
2. Entrá al panel: `/admin.html` → ingresá usuario y clave → botón
   **"📷 Carga con lector"**.
3. Tocá **"📷 Escanear con la cámara"**.
4. El navegador te va a pedir **permiso para usar la cámara** → tocá *Permitir*.
5. Apuntá la cámara al código de barras (cámara trasera, buena luz, a ~15–20 cm).
6. Al leerlo, el código aparece solo en el campo y:
   - Si el producto **ya existe** → se precargan sus datos (nombre, precio,
     categoría) y el stock queda para **sumar** reposición.
   - Si es **nuevo** → completás nombre, precio, stock, descripción, foto y
     categoría.
7. Tocá **"💾 Guardar producto"** y listo: quedó cargado e inventariado.

> ⚠️ **La cámara requiere HTTPS.** En Render el sitio ya es HTTPS, así que
> funciona directo. En local también funciona con `http://localhost` (los
> navegadores lo consideran seguro). Los códigos soportados incluyen
> **EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, Codabar y QR**.

## 🧠 Cómo funciona

1. El operador escanea el código (lector que escribe + Enter, o cámara).
2. **La página NO se recarga**: al recibir el código se consulta si ya existe y
   el foco pasa automáticamente al campo **Nombre**.
   - Si el código **ya existe** → se precargan nombre, precio, descripción y
     categoría; el campo stock queda para **sumar** reposición.
   - Si es **nuevo** → se deja el formulario limpio para completar los datos.
3. Se completan nombre, precio, stock, descripción, foto y categoría.
4. Al guardar:
   - **Código nuevo** → crea el producto (con una variante "Unidad").
   - **Código existente** → actualiza datos y **suma** el stock escaneado.
   - La foto se sube al servidor con un **nombre único (UUID)** y en la base
     queda la ruta `/uploads/<uuid>.jpg`.

## 🗄️ Base de datos

Se agregó la columna `codigo_barras` a la tabla `productos` con un **índice
ÚNICO** (impide duplicar el mismo código y habilita el "upsert").

- **Base nueva (desde cero):** `database/schema.sql` ya incluye la columna.
- **Base existente:** ejecutar `database/migracion_codigo_barras.sql`
  (incluye la variante para MySQL y para PostgreSQL).

> El precio y el stock viven en la tabla `variantes` (así el producto escaneado
> aparece directamente en el catálogo de la tienda). Al cargar se crea/actualiza
> una variante de presentación "Unidad" con el precio y stock escaneados.

## ⚙️ Backend (Spring Boot + PostgreSQL)

Archivos nuevos/ modificados:

| Archivo | Qué hace |
| --- | --- |
| `model/Producto.java` | Campo `codigoBarras` |
| `repository/ProductoRepository.java` | `findByCodigoBarras(...)` |
| `service/ImageStorageService.java` | Guarda la foto con nombre UUID en `uploads/` y borra la anterior |
| `service/CargaProductoService.java` | Lógica de upsert (crear o actualizar + sumar stock) |
| `dto/CargaProductoResponse.java` | Respuesta: creado/actualizado, stock total, imagen |
| `controller/AdminController.java` | Endpoints `POST /api/admin/carga` y `GET /api/admin/productos/barcode/{codigo}` |
| `config/WebConfig.java` | Sirve `/uploads/**` como estático |
| `application.yml` | Límites de subida y carpeta `app.uploads.dir` |

### Endpoints (requieren el token del panel: header `X-Admin-Token`)

**`POST /api/admin/carga`** — `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `codigoBarras` | text | sí | Lo que envía el lector |
| `nombre` | text | sí | Nombre del producto |
| `precio` | number | sí | Decimal (ej. `2150.50`) |
| `stock` | int | sí | Si el código existe, se **suma** |
| `categoriaId` | long | sí | Categoría del producto |
| `descripcion` | text | no | Detalle |
| `imagen` | file | no | `image/*` (jpg/png/webp/gif) |

**`GET /api/admin/productos/barcode/{codigo}`** → devuelve el producto o `404`
si no existe (lo usa la pantalla para precargar datos).

## 🖥️ Frontend

- **`static/carga.html`** — pantalla de carga (acceso desde el panel: botón
  "📷 Carga con lector"). Incluye el botón de escaneo por cámara.
- **`static/js/carga.js`** — lógica del lector, del escáner por cámara y envío
  con `FormData`.
- **`static/js/html5-qrcode.min.js`** — librería de escaneo por cámara
  (servida localmente, sin depender de CDNs).

Detalle del comportamiento del Enter (la parte importante):

```js
codigoInput.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();                 // ← NO recarga la página
  // …consulta si el código existe y precarga…
  nombreInput.focus();                // ← el foco pasa al Nombre
});
```

Y el envío usa `FormData` **sin** poner `Content-Type` manual (el navegador
agrega el `boundary` del multipart automáticamente).

## 🚀 Paso a paso para integrarlo en tu proyecto

1. **Subí los archivos nuevos al repo** (por navegador o GitHub Desktop):
   - `database/migracion_codigo_barras.sql`
   - `backend/src/main/resources/static/carga.html`
   - `backend/src/main/resources/static/js/carga.js`
   - y los archivos Java modificados (Producto, ProductoRepository, ProductoDto,
     AdminController, WebConfig, application.yml, + los 3 servicios/DTO nuevos).

2. **Aplicá la migración en la base** (una sola vez), pegando el contenido de
   `database/migracion_codigo_barras.sql` en la pestaña **Shell** de tu
   PostgreSQL en Render. (Si creás la base de cero con `schema.sql`, no hace
   falta: ya trae la columna.)

3. **Redeploy** en Render (el Dockerfile compila todo automáticamente).

4. **Probá**: entrá al panel (`/admin.html`) → botón **"📷 Carga con lector"**
   → escaneá un código → completá → guardar. El segundo escaneo del mismo
   código debe decir "actualizado" y sumar stock.

## ⚠️ Notas importantes (producción)

- Las fotos se guardan en la carpeta `uploads/` **dentro del contenedor**.
  En el plan **Free de Render el disco es efímero**: las fotos se pierden en
  cada redeploy. Para un local real:
  - agregá un **Disco persistente** al servicio en Render y apuntá
    `UPLOADS_DIR=/ruta/del/disco/uploads`, o
  - subí las fotos a un storage externo (Cloudinary/S3) y guardá la URL.
- El código de barras es único: dos productos no pueden compartirlo (el segundo
  escaneo siempre actualiza/suma stock, nunca crea un duplicado).
- La página de carga está protegida por el mismo login del panel.
