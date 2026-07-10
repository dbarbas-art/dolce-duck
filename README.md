# 🦆 Dolce Duck

**Dolce Duck** es un e-commerce de pastelería artesanal: los usuarios navegan el menú de productos, arman su carrito, coordinan fecha y forma de entrega, y pagan online de forma segura con Mercado Pago. Incluye un panel de administración para gestionar productos y pedidos.

## ✨ Funcionalidades

- Catálogo de productos con detalle, opciones personalizables e imágenes.
- Carrito de compras persistente por usuario.
- Registro e inicio de sesión de clientes.
- Checkout con validación de datos de envío/retiro y fecha estimada de entrega.
- Pago online integrado con **Mercado Pago** (Checkout Pro).
- Panel de administrador para el CRUD de productos y la gestión del estado de los pedidos.
- Notificación automática de carritos abandonados (cron job).

## 🛠️ Tecnologías

- **[Next.js](https://nextjs.org/)** — framework de React (App Router) para el frontend y las API routes del backend.
- **[Supabase](https://supabase.com/)** — base de datos Postgres, autenticación de usuarios y storage.
- **[Mercado Pago](https://www.mercadopago.com.ar/developers)** — procesamiento de pagos (Checkout Pro).
- **React** — librería de UI.
- CSS modular (por sección/página) para los estilos.

## 🚀 Cómo ejecutarlo en desarrollo

### 1. Requisitos previos

- Node.js 18 o superior
- Una cuenta y proyecto de [Supabase](https://supabase.com/)
- Credenciales de prueba de [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)

### 2. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd dolce-duck
npm install
```

### 3. Configurar variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto con las siguientes claves:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase

MERCADO_PAGO_ACCESS_TOKEN=tu-access-token-de-mercado-pago

# URL pública del sitio (usada, entre otras cosas, para las back_urls de Mercado Pago)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

### 5. Otros comandos

```bash
npm run build   # build de producción
npm run start   # levanta el build de producción
```

---

Proyecto académico desarrollado como e-commerce de pastelería 🍰
