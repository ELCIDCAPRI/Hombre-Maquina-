# AGENTS.md

## Project overview

Three projects in one repo:

| Project | Entry | Description |
|---------|-------|-------------|
| **Taller de Sabores (Frontend)** | `frontend/index.html` | Static multi-page bakery website, deployed on **Render** |
| **Taller de Sabores (Backend)** | `backend/src/server.js` | Node.js Express API, deployed on **Railway** |
| **Man-Machine optimization** | `streamlit/app.py` | Streamlit app — efficiency/cost calculator for assigning workers to machines |

## Commands

```sh
# Frontend (local dev) — serve static files from frontend/
npx serve frontend

# Backend (local dev)
cd backend && npm install && npm run dev

# Streamlit app
streamlit run streamlit/app.py
```

## Structure

```
frontend/                        # Static site → Render
├── index.html                   # Landing page
├── styles.css                   # Landing page styles
├── script.js                    # Featured cakes + reviews (fetches from API)
├── img/                         # Local images
├── shared/
│   ├── api.js                   # API helper (auto-detects localhost vs production)
│   ├── auth.js                  # Auth system (JWT-based, calls /api/auth/*)
│   ├── cart.js                  # Cart (localStorage + checkout via /api/pedidos)
│   ├── accessibility.js         # Accessibility widget (localStorage)
│   ├── accessibility.css        # Widget styles
│   └── cake3d.js                # Three.js 3D cake preview
├── catalogo/                    # Catalog page + detail page
├── contacto/                    # Contact form (POSTs to /api/contactos)
├── nosotros/                    # About page
└── personalizacion/             # 3-step cake configurator + 3D preview

backend/                         # Express API → Railway
├── package.json                 # express, mysql2, bcryptjs, jsonwebtoken, etc.
├── .env.example                 # Environment variables template
├── basededatos.sql              # MySQL schema (optimized for Railway)
├── railway.json                 # Railway deploy config
└── src/
    ├── server.js                # Express app entry point
    ├── config/db.js             # MySQL2 connection pool
    ├── middleware/auth.js       # JWT authentication middleware
    ├── routes/
    │   ├── auth.js              # POST /register, /login, GET /users
    │   ├── productos.js         # GET / (list+search), /featured, /:id
    │   ├── pedidos.js           # POST / (checkout), GET / (user orders), /all (admin)
    │   ├── resenas.js           # GET / (list), POST / (create)
    │   ├── contactos.js         # POST / (contact form), GET / (admin)
    │   └── personalizaciones.js # POST /, GET /:sesion_id
    └── seed.js                  # Seeds admin user + 12 cakes + 3 categories

streamlit/                       # Standalone Streamlit app
└── app.py                       # Man-Machine optimizer (~86 lines)
```

## Database

- **Engine**: MySQL (Railway managed)
- **Schema**: `backend/basededatos.sql` — 8 tables with IF NOT EXISTS + INSERT IGNORE
- **Seed**: `backend/src/seed.js` — runs on deploy, idempotent
- **Connect via SQL Workbench/J**: Use Railway MySQL connection string from dashboard
- **Tables**: usuarios, categorias, pasteles, pedidos, detalle_pedido, resenas, contactos, personalizaciones

## Key facts

- **Frontend**: Static site — Bootstrap 5.3.2 via CDN, Google Fonts, Font Awesome (contact page)
- **Backend**: Node.js 18+ / Express 4 / MySQL2 — JWT auth, bcryptjs hashing, rate limiting, helmet
- **Auth flow**: Register → Login (returns JWT) → Token stored in `ts_token` localStorage → Sent as Bearer header
- **Cart flow**: localStorage (`ts_cart`) for ephemeral cart → Checkout sends items to POST /api/pedidos with JWT
- **Catalog**: 12 cakes from database (seeded via seed.js), fetched via GET /api/productos
- **Admin**: Default credentials `admin@tallerdesabores.pe` / `admin123` (seeded via seed.js with bcryptjs hash)
- **All pages in Spanish** (labels, comments, vars)
- **Accessibility**: Widget persists in `ts_accessibility` / `ts_grayscale` localStorage (client-only)
- **API base URL**: Auto-detected in `shared/api.js` — localhost:4000 for dev, Railway URL for production

## Deployment

### Frontend → Render
1. Push repo to GitHub
2. Create new **Static Site** on Render
3. Connect GitHub repo, set root directory to `frontend/`
4. No build command needed
5. Set environment variable if needed (API URL is auto-detected)

### Backend → Railway
1. Create new **Node.js** service on Railway
2. Connect GitHub repo, set root directory to `backend/`
3. Add **MySQL** plugin on Railway
4. Set environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from Railway MySQL plugin)
   - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL` (your Render frontend URL, e.g. `https://taller-de-sabores.onrender.com`)
   - `NODE_ENV=production`
5. Deploy command: `node src/seed.js && node src/server.js` (set in railway.json)

### Database → SQL Workbench/J
1. Get MySQL connection details from Railway dashboard (MySQL plugin)
2. Open SQL Workbench/J
3. Create new connection with Railway host, port, user, password, database
4. Run `backend/basededatos.sql` to create tables
5. Tables are auto-seeded on backend deploy via `seed.js`

### Streamlit App
```sh
streamlit run streamlit/app.py
```
Standalone — no dependencies on the bakery project.
