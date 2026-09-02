# 🚀 Despliegue en Render — Aroma a Limpio

Guía paso a paso para publicar el servicio (Spring Boot, vía **Docker**) y la
base de datos PostgreSQL en [Render](https://render.com).

> Render no tiene un runtime nativo de Java: los proyectos Spring Boot se
> despliegan con **Docker**. Ya dejamos un `Dockerfile` listo en la raíz del
> proyecto, así que no necesitás Java ni Maven instalados en tu máquina.

---

## Paso 0 — Subir el proyecto a GitHub

Render construye desde un repositorio de GitHub. Tenés 3 opciones (elegí la
que te resulte más cómoda):

### Opción A — GitHub Desktop (recomendada, sin comandos)
1. Descargá el proyecto (el archivo `.zip` que te pasamos) y descomprimilo.
2. Instalá [GitHub Desktop](https://desktop.github.com/) y entrá con tu cuenta de GitHub.
3. **File → Add local repository…** → seleccioná la carpeta descomprimida.
4. Te va a avisar que no tiene repo: click en **"create a repository"**.
5. Botón **Publish repository** → escribí un nombre (ej. `limpieza-tienda`) y
   dejá **"Keep this code private"** marcado → **Publish**.
6. Listo: ya está en tu GitHub. Cada vez que cambies algo en la carpeta,
   GitHub Desktop te muestra los cambios y con **Commit** + **Push** se actualizan.

### Opción B — Subir por el navegador (sin instalar nada)
1. Creá un repo vacío en github.com (**New repository**, sin README).
2. Entrá al repo → botón **Add file → Upload files**.
3. Arrastrá **todo el contenido** de la carpeta descomprimida.
4. **Commit changes**.

> ⚠️ GitHub puede omitir los archivos/carpetas ocultos (`.gitignore`, `.mvn`).
> **No es problema**: el deploy usa el `Dockerfile`, que no depende de esos
> archivos. Si más adelante usás Git normal, agregalos a mano.

### Opción C — Con Git (si instalás Git for Windows)
```bash
git init
git add .
git commit -m "Tienda de limpieza: Spring Boot + PostgreSQL + frontend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/limpieza-tienda.git
git push -u origin main
```

---

## Paso 1 — Crear la base de datos PostgreSQL

1. Dashboard de Render → **New +** → **PostgreSQL**.
2. Nombre: `limpieza-tienda-db` → región más cercana → plan **Free** → **Create**.
3. Esperá a que diga **Available**.
4. Copiá la **Internal Database URL** (algo como
   `postgresql://user:pass@dpg-xxxx:5432/limpieza_tienda_db`).

### Cargar el esquema y los datos

Opción fácil: en la página de tu base, pestaña **Shell**, pegá primero el
contenido de `database/schema.sql` y después el de `database/data.sql`.
(También podés conectarte desde tu máquina con `psql` si lo tenés.)

> Los scripts son idempotentes (hacen `DROP … IF EXISTS` al inicio): podés
> re-ejecutarlos sin miedo.

---

## Paso 2 — Crear el servicio web (Docker)

1. **New +** → **Web Service**.
2. Conectá tu repositorio de GitHub.
3. Configuración:
   - **Name:** `limpieza-tienda-api`
   - **Runtime:** **Docker** (dejá el `Dockerfile` que está en la raíz)
   - **Instance Type:** Free (o el que necesites)
4. Variables de entorno (pestaña **Environment**):

   | Key | Value |
   | --- | --- |
   | `DB_URL` | la **Internal Database URL** de tu PostgreSQL |
   | `DB_USER` | usuario de la BD (aparece en la página de tu PostgreSQL) |
   | `DB_PASSWORD` | contraseña de la BD |
   | `ADMIN_USERNAME` | tu usuario del panel (ej. `admin`) |
   | `ADMIN_PASSWORD` | una contraseña segura |
   | `WHATSAPP_NUMBER` | tu número de WhatsApp, ej. `5492612578860` |
   | `STORE_NAME` | nombre del local |
   | `CORS_ALLOWED_ORIGINS` | `*` |

   > `PORT` lo inyecta Render automáticamente; la app ya lo lee.

5. **Create Web Service** y esperá el primer deploy (descarga la imagen de
   Maven, tarda unos minutos).

---

## Paso 3 — Probar

- **Tienda:** `https://limpieza-tienda-api.onrender.com/`
- **Admin:** `https://limpieza-tienda-api.onrender.com/admin.html`
- **Health:** `GET /api/categorias` debería devolver las categorías.

---

## ⚠️ Notas de producción

- **Cambiá siempre** `ADMIN_PASSWORD` y las credenciales de la BD.
- Plan **Free**: el servicio se duerme tras ~15 min de inactividad (la primera
  visita tarda ~1 min en despertar) y la **PostgreSQL gratuita expira a los 30
  días**. Para un local real conviene el plan pago.
- El deploy es automático: cada `push` a GitHub recompila y publica.
- Las imágenes se sirven por URL externa (S3, Cloudinary, Google Drive…): subí
  las fotos y pegá la URL en el alta del producto.
- Los pedidos quedan guardados en la tabla `pedidos`; desde el panel podés
  cambiarles el estado.
