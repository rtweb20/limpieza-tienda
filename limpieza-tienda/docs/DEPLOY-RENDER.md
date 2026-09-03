# 🚀 Despliegue en Render — Aroma a Limpio

Guía paso a paso para publicar la tienda en [Render](https://render.com).

> ⭐ **Novedad:** la app ahora **crea las tablas y carga los productos
> automáticamente al arrancar**. Ya NO necesitás ejecutar SQL a mano ni usar
> programas como psql o DBeaver.

---

## Paso 0 — Subir el proyecto a GitHub (sin Git)

Descargá el `limpieza-tienda.zip`, descomprimilo y subí su contenido a tu repo
`rtweb20/limpieza-tienda`. Opciones:

### Opción A — GitHub Desktop (recomendada)
1. Instalá [GitHub Desktop](https://desktop.github.com/) y entrá con tu cuenta.
2. **File → Add local repository…** → seleccioná la carpeta descomprimida.
3. Si te ofrece **"create a repository"** → **Publish repository** → publicá.
   (Si ya tenés el repo conectado, con **Commit + Push** actualizás los cambios.)

### Opción B — Por el navegador
1. En `https://github.com/rtweb20/limpieza-tienda`, navegá hasta la carpeta
   interna `limpieza-tienda/limpieza-tienda`.
2. **Add file → Upload files** → arrastrá el contenido del ZIP descomprimido
   (carpetas `backend`, `database`, `docs` y el `README.md`).
3. **Commit changes**.

> ⚠️ No subas una carpeta `limpieza-tienda` anidada de nuevo. Arrastrá lo que
> está **adentro**. Y no toques el `Dockerfile` de la **raíz** del repo (ya
> apunta bien a `limpieza-tienda/limpieza-tienda/backend`).

---

## Paso 1 — Crear (o reiniciar) la base de datos

### Si TODAVÍA no tenés base de datos
1. Render → **New +** → **PostgreSQL** → nombre `aroma-a-limpio-db` → **Create**.
2. Esperá a que diga **Available**.

### Si ya tenés una base de datos vieja (con datos viejos)
Como el catálogo cambió (nombre, sin "Cocina", fotos, código de barras), lo más
limpio es **borrarla y crear una nueva**:
1. Abrí tu base en Render → **Settings** → abajo **Delete Database** → confirmá.
2. Creá una nueva: **New +** → **PostgreSQL** → **Create**.

> Al borrar la base se pierden los pedidos de prueba (no hay problema recién
> empezando). Si NO querés borrar nada, podés dejar la base actual: la app va a
> agregar la columna `codigo_barras` sola, aunque los productos viejos de
> "Cocina" seguirían ahí. Recomendamos empezar limpio.

### Copiá la URL de conexión
1. Abrí tu base → pestaña **Info** → sección **Connections**.
2. Copiá la **Internal Database URL** (se ve `postgresql://usuario:clave@dpg-xxxx:5432/nombre_db`).

---

## Paso 2 — Crear el servicio web (Docker)

1. **New +** → **Web Service** → conectá tu repo de GitHub.
2. **Runtime:** Docker (usa el `Dockerfile` de la raíz del repo).
3. Variables de entorno (pestaña **Environment**):

   | Key | Value |
   | --- | --- |
   | `DB_URL` | la **Internal Database URL** que copiaste |
   | `DB_USER` | usuario de la base (está en la página de tu base) |
   | `DB_PASSWORD` | contraseña de la base |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | una clave segura |
   | `WHATSAPP_NUMBER` | `5492612578860` |
   | `STORE_NAME` | `Aroma a Limpio` |
   | `CORS_ALLOWED_ORIGINS` | `*` |

4. **Create Web Service** y esperá el deploy.

> 💡 **¿Dónde está la sección "Connections"?** En la página de tu base de
> datos hay un botón **Connect** (arriba a la derecha) o una sección
> **Connections** con dos solapas: *Internal* y *External*. La URL interna es
> la que va en `DB_URL`. Render **no tiene** una terminal web para ejecutar SQL;
> por eso la app ahora se encarga sola.

---

## Paso 3 — Probar

En el log del deploy vas a ver (entre las últimas líneas):
```
Started TiendaApplication
```
Y al entrar, la app ya dejó las tablas y los productos cargados.

- Tienda: `https://tu-servicio.onrender.com/`
- Panel: `https://tu-servicio.onrender.com/admin.html` → usuario `admin`
- Carga con lector: dentro del panel, botón **📷 Carga con lector**
- Verificación: `https://tu-servicio.onrender.com/api/categorias` → JSON con
  `Combos y Ofertas, Ropa, Baño, Accesorios`

---

## ⚠️ Notas de producción

- **Plan Free:** el servicio se duerme tras ~15 min de inactividad (tarda ~1 min
  en despertar) y la **PostgreSQL gratuita expira a los 30 días**. Para un local
  real conviene un plan pago.
- **Fotos:** las que trae el catálogo van dentro de la app (`/img/...`). Las
  fotos que saques con el lector van a `/uploads/` dentro del contenedor → en el
  plan Free se pierden al redeployar. Para producción: disco persistente en
  Render (`UPLOADS_DIR`) o storage externo (Cloudinary/S3).
- **Cambiá siempre** `ADMIN_PASSWORD` y las credenciales de la base.
- El deploy es automático con cada `push` a GitHub.
