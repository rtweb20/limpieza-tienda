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
6. Al leerlo, la pantalla **pita como la caja de un supermercado** y te avisa:
   - 🆕 **Código nuevo** → pitido de OK y cartel verde: completás nombre, precio,
     stock, descripción, foto y categoría.
   - ⛔ **YA CARGADO** → pitido de error y cartel rojo grande con el nombre y el
     stock actual. Si es reposición, ponés la cantidad y tocás **"➕ Sumar stock"**.
7. Tocá **"💾 Guardar producto"** (o "➕ Sumar stock") y listo.

> ⚠️ **La cámara requiere HTTPS.** En Render el sitio ya es HTTPS, así que
> funciona directo. En local también funciona con `http://localhost` (los
> navegadores lo consideran seguro). Los códigos soportados incluyen
> **EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, Codabar y QR**.

## 🧠 Cómo funciona

1. El operador escanea el código (lector que escribe + Enter, o cámara).
2. **La página NO se recarga**: al recibir el código se consulta si ya existe y
   el foco pasa automáticamente al campo **Nombre**.
   - Si el código **ya existe** → cartel rojo **"⛔ YA CARGADO"** (con pitido),
     se precargan nombre, precio, descripción y categoría; el campo stock queda
     para **sumar** reposición.
   - Si es **nuevo** → pitido de OK y cartel verde; formulario limpio.
3. Se completan nombre, precio, stock, descripción, foto y categoría.
4. Al guardar:
   - **Código nuevo** → crea el producto (con una variante "Unidad").
   - **Código existente** → actualiza datos y **suma** el stock escaneado.
   - La foto se sube al servidor con un **nombre único (UUID)** y en la base
     queda la ruta `/uploads/<uuid>.jpg`.

## 🔢 Normalización de códigos (12 vs 13 dígitos)

Algunos lectores/cámaras devuelven el **UPC-A** (12 dígitos) y otros el
**EAN-13** (13 dígitos) para el **mismo** producto. Para que dos celulares
distintos no carguen el mismo producto dos veces:

- Si el código leído tiene **12 dígitos**, se le antepone un `0` y se guarda
  como EAN-13. Ej.: `779123456789` → `0779123456789`.
- La búsqueda y el guardado normalizan igual, así que ambos formatos caen en el
  **mismo** producto.

> 💡 Si un paquete tiene **dos códigos distintos** (uno grande EAN-13 y uno
> chico UPC-A), usá siempre el **grande** (EAN-13). Con la normalización, el
> chico también termina apuntando al mismo producto.

## 🗑️ Empezar de cero (vaciar el catálogo)

El catálogo arranca **vacío de productos** (solo quedan las 4 categorías). Para
borrar todo lo cargado y volver a empezar:

1. Entrá al panel `/admin.html`.
2. Pestaña **📦 Productos** → botón **"🗑️ Vaciar productos"**.
3. Confirmá. Se borran todos los productos (y sus variantes); las categorías se
   conservan.

> Endpoint: `DELETE /api/admin/productos` (requiere token). Devuelve
> `{"eliminados": N, "mensaje": "…"}`.

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

**`DELETE /api/admin/productos`** → vacía el catálogo completo (productos +
variantes). Devuelve `{"eliminados": N, "mensaje": "…"}`.

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
   - `backend/src/main/resources/data.sql` (catálogo arranca vacío)
   - `backend/src/main/resources/static/carga.html` y `static/js/carga.js`
   - `static/admin.html` y `static/js/admin.js` (botón "Vaciar productos")
   - y los Java modificados (AdminController, AdminService, CargaProductoService).

2. **Redeploy** en Render (el Dockerfile compila todo automáticamente).

3. **Probá**: entrá al panel (`/admin.html`) → **"🗑️ Vaciar productos"** para
   empezar de cero → botón **"📷 Carga con lector"** → escaneá un código.
   Al escanear el mismo código de nuevo debe decir **"⛔ YA CARGADO"**.

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
