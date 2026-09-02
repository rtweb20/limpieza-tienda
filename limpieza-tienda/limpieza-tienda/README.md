# 🫧 Aroma a Limpio — Tienda de productos de limpieza con pedidos por WhatsApp

Tienda web completa para un comercio minorista de barrio. Los clientes arman su
pedido (con variantes por producto), completan un formulario de checkout y el
pedido se envía directo al **WhatsApp del local** con un mensaje ya formateado.

## ✨ Funcionalidades

| Módulo | Detalle |
| --- | --- |
| Catálogo | Categorías por uso cotidiano (Ropa, Baño, Accesorios) + banner de **Combos y Ofertas** |
| Buscador | Búsqueda en tiempo real con autocompletado (endpoint `/api/buscar`) |
| Variantes | Un mismo producto con varias presentaciones/aromas y **una única imagen** (URL externa) |
| Carrito | Persistido en `localStorage`, con control de stock y cantidades |
| Checkout pre-WhatsApp | Nombre, dirección/barrio, modalidad (retiro/envío) y medio de pago (efectivo/transferencia/Mercado Pago) |
| Integración WhatsApp | Genera `https://wa.me/<numero>?text=<mensaje codificado>` con el resumen del pedido y el total |
| Botón flotante | Acceso directo a WhatsApp para consultas |
| Backoffice | Panel protegido por credenciales para editar precios, variantes, productos, categorías y gestionar pedidos |
| Carga con lector | Alta/inventario por **código de barras** (USB/Bluetooth): escaneo → Enter sin recarga → alta o actualización + suma de stock, con subida de foto |

## 🧱 Stack

- **Backend:** Java 17 + Spring Boot 3.3 (API REST, Spring Data JPA)
- **Base de datos:** PostgreSQL (despliegue en Render)
- **Frontend:** HTML/CSS/JS vanilla (mobile-first), servido por el propio Spring Boot
- **Imágenes:** solo se guardan URLs externas (nunca BLOBs)

## 📁 Estructura

```
limpieza-tienda/
├── Dockerfile              # Build multi-etapa (Maven → JRE) para Render/Docker
├── .dockerignore
├── database/
│   ├── schema.sql          # DDL: categorias, productos, variantes, pedidos, pedido_items
│   └── data.sql            # Carga masiva inicial de productos + variantes
├── backend/                # Proyecto Spring Boot (Maven)
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd     # Maven Wrapper (opcional, para compilar sin Maven instalado)
│   └── src/main/
│       ├── java/com/limpieza/tienda/
│       │   ├── model/       # Entidades JPA + enums
│       │   ├── repository/  # Spring Data JPA (con JPQL para catálogo)
│       │   ├── service/     # Lógica de negocio + mensaje de WhatsApp
│       │   ├── controller/  # API REST (pública y de admin)
│       │   ├── dto/         # Records de entrada/salida
│       │   ├── config/      # Propiedades, interceptor de auth, CORS
│       │   └── exception/   # Manejo global de errores
│       └── resources/
│           ├── application.yml
│           └── static/      # index.html, admin.html, css/, js/
└── docs/
    ├── DEPLOY-RENDER.md             # Guía de despliegue en Render (Docker + PostgreSQL)
    └── CARGA-CODIGO-BARRAS.md       # Carga de productos con lector de código de barras
```

## 🚀 Ejecución local

**Requisitos:** Java 17+ y Maven 3.6+ (o usar el wrapper `mvnw`), PostgreSQL 14+.

1. Crear la base y cargar esquema + datos:

   ```bash
   psql -U postgres -c "CREATE DATABASE limpieza_tienda;"
   psql -U postgres -d limpieza_tienda -f database/schema.sql
   psql -U postgres -d limpieza_tienda -f database/data.sql
   ```

2. Levantar la app:

   ```bash
   cd backend
   export DB_URL=jdbc:postgresql://localhost:5432/limpieza_tienda
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   mvn spring-boot:run
   ```

3. Abrir:
   - Tienda: http://localhost:8080/
   - Panel admin: http://localhost:8080/admin.html (usuario `admin` / clave `admin123` por defecto — **cambiala**)

## 🔌 API REST

### Pública

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/categorias` | Categorías activas |
| GET | `/api/productos` | Catálogo completo con variantes |
| GET | `/api/productos/destacados` | Combos y ofertas (banner) |
| GET | `/api/categorias/{slug}/productos` | Productos por categoría |
| GET | `/api/buscar?q=…` | Búsqueda con autocompletado |
| GET | `/api/whatsapp` | Número y enlace de consulta |
| POST | `/api/pedidos` | Crea el pedido y devuelve el enlace `wa.me` |

### Admin (requiere `X-Admin-Token`)

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/admin/login` | Devuelve el token |
| GET/POST | `/api/admin/categorias` | Listar / crear |
| PUT/DELETE | `/api/admin/categorias/{id}` | Editar / eliminar |
| GET/POST | `/api/admin/productos` | Listar / crear (con variantes) |
| PUT/DELETE | `/api/admin/productos/{id}` | Editar / eliminar |
| POST | `/api/admin/carga` | Alta/actualización por código de barras (`multipart/form-data`, sube foto) |
| GET | `/api/admin/productos/barcode/{codigo}` | Buscar producto por código de barras |
| GET | `/api/admin/pedidos` | Pedidos recibidos |
| PATCH | `/api/admin/pedidos/{id}/estado` | Cambiar estado |

## 🔐 Variables de entorno

| Variable | Default | Descripción |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/limpieza_tienda` | URL de la BD |
| `DB_USER` / `DB_PASSWORD` | `postgres` | Credenciales de la BD |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `admin123` | Credenciales del backoffice |
| `WHATSAPP_NUMBER` | `5492612578860` | WhatsApp destino (sin `+`, espacios ni guiones) |
| `STORE_NAME` | `Aroma a Limpio` | Nombre comercial en los mensajes |
| `PORT` | `8080` | Puerto (Render lo inyecta) |
| `CORS_ALLOWED_ORIGINS` | `*` | Orígenes permitidos |

> **Importante:** cambiá `ADMIN_PASSWORD` y las credenciales de la BD antes de salir a producción.

## 📦 Despliegue en Render

Render despliega Spring Boot vía **Docker** (ya hay un `Dockerfile` en la raíz).
Ver [`docs/DEPLOY-RENDER.md`](docs/DEPLOY-RENDER.md) para la guía paso a paso,
incluida la carga de la base y opciones para subir el código a GitHub **sin
Git** (GitHub Desktop o subida por navegador).
