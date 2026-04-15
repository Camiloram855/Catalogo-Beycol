# 🛍 Catálogo Web – Fullstack

Proyecto de catálogo web completo con React (Vite) + Laravel 11 + MySQL.

---

## 📁 Estructura del proyecto

```
catalog-project/
├── frontend/          # React + Vite + Tailwind CSS
└── backend/           # Laravel 11 REST API
```

---

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 18+
- PHP 8.2+
- Composer
- MySQL 8+

---

## ⚙️ Backend (Laravel)

### 1. Instalar dependencias

```bash
cd backend
composer install
```

### 2. Configurar entorno

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con tus datos de MySQL:

```env
DB_DATABASE=catalog_db
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
FRONTEND_URL=http://localhost:5173
```

### 3. Crear base de datos

```sql
CREATE DATABASE catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Ejecutar migraciones y seeder

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

Esto crea:

- Todas las tablas necesarias
- Usuario admin: `admin@catalogo.com` / contraseña: `password`
- Categorías y productos de ejemplo
- Textos del sitio por defecto

### 5. Iniciar servidor

```bash
php artisan serve
# API disponible en: http://localhost:8000/api/v1
```

---

## 🖥 Frontend (React + Vite)

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Variables de entorno (opcional)

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api/v1
```

> Sin configurar, usa el proxy de Vite hacia `http://localhost:8000`

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
# Disponible en: http://localhost:5173
```

---

## 🔐 Panel Administrativo

Acceder a `/admin/login` con:

- **Email:** `admin@catalogo.com`
- **Contraseña:** `password`

### Funcionalidades del admin:

- 📦 **Productos** — CRUD completo + subida de imágenes múltiples
- 🏷 **Categorías** — CRUD con slug automático
- 📝 **Textos del sitio** — Edición de contenido dinámico (hero, footer, etc.)
- 🔐 **Autenticación** — Login seguro con Laravel Sanctum

---

## 🗄 Esquema de base de datos

```
users
  id, name, email, password, is_admin

categories
  id, name, slug, description, sort_order, is_active

products
  id, name, description, price, sku, stock
  category_id (FK), is_featured, is_active, sort_order
  deleted_at (soft delete)

product_images
  id, product_id (FK), path, filename, is_primary, sort_order

site_texts
  id, key (unique), value, description, type
```

---

## 📡 Endpoints de la API

### Públicos (sin autenticación)

| Método | Endpoint                | Descripción              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/v1/products`      | Listar productos activos |
| GET    | `/api/v1/products/{id}` | Detalle de un producto   |
| GET    | `/api/v1/categories`    | Listar categorías        |
| GET    | `/api/v1/site-texts`    | Textos del sitio         |
| POST   | `/api/v1/auth/login`    | Iniciar sesión admin     |

### Protegidos (requieren `Bearer Token`)

| Método              | Endpoint                                     | Descripción                 |
| ------------------- | -------------------------------------------- | --------------------------- |
| GET                 | `/api/v1/auth/me`                            | Usuario actual              |
| POST                | `/api/v1/auth/logout`                        | Cerrar sesión               |
| GET/POST/PUT/DELETE | `/api/v1/products`                           | CRUD productos              |
| POST                | `/api/v1/products/{id}/images`               | Subir imagen                |
| DELETE              | `/api/v1/products/{id}/images/{img}`         | Eliminar imagen             |
| PATCH               | `/api/v1/products/{id}/images/{img}/primary` | Imagen principal            |
| GET/POST/PUT/DELETE | `/api/v1/categories`                         | CRUD categorías             |
| PUT                 | `/api/v1/site-texts`                         | Actualizar todos los textos |
| PATCH               | `/api/v1/site-texts/{key}`                   | Actualizar un texto         |

### Parámetros de filtrado para productos

```
GET /api/v1/products?search=camisa&category_id=1&featured=true&per_page=12&page=1
```

---

## 🌐 Despliegue

### Frontend → Vercel

```bash
cd frontend
npm run build
# El archivo vercel.json ya está configurado para SPA routing
```

Variables de entorno en Vercel:

```
VITE_API_URL=https://tu-api.railway.app/api/v1
```

### Backend → Railway

```bash
# El archivo railway.json ya está configurado
# Variables de entorno en Railway:
APP_ENV=production
APP_KEY=  # php artisan key:generate
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_DATABASE=${MYSQLDATABASE}
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
FRONTEND_URL=https://tu-frontend.vercel.app
```

---

## 🎨 Stack tecnológico

| Capa                | Tecnología      |
| ------------------- | --------------- |
| Frontend Framework  | React 18        |
| Build Tool          | Vite 5          |
| Estilos             | Tailwind CSS 3  |
| Estado del servidor | TanStack Query  |
| Routing             | React Router v6 |
| HTTP Client         | Axios           |
| Notificaciones      | React Hot Toast |
| Upload de archivos  | React Dropzone  |
| Backend             | Laravel 11      |
| Autenticación       | Laravel Sanctum |
| Base de datos       | MySQL 8         |
| Despliegue Frontend | Vercel          |
| Despliegue Backend  | Railway         |

---

## 📂 Estructura del frontend

```
src/
├── components/
│   ├── ui/             # Componentes reutilizables (Modal, Badge, Input...)
│   ├── public/         # Navbar, Footer, ProductCard, Layout
│   └── admin/          # AdminLayout, ProtectedRoute
├── context/
│   └── AuthContext.jsx # Estado de autenticación global
├── hooks/
│   └── index.js        # Custom hooks con React Query
├── pages/
│   ├── public/         # HomePage, CatalogPage, ProductDetailPage
│   └── admin/          # LoginPage, DashboardPage, ProductsAdminPage...
├── services/
│   ├── api.js          # Instancia Axios configurada
│   └── index.js        # Servicios por módulo
└── App.jsx             # Router principal
```
