# AGENTS.md

## Project overview

Two unrelated projects in one repo:

| Project | Entry | Description |
|---------|-------|-------------|
| **Man-Machine optimization** | `app.py` | Streamlit app — efficiency/cost calculator for assigning workers to machines |
| **Wedding cake website** | `main/index.html` | Static multi-page site for "Taller de Sabores", a Lima bakery |

## Commands

```sh
# Run the Streamlit app
streamlit run app.py
```

No package manager, build step, test framework, linter, or formatter configured.

## Structure

```
app.py                     # Streamlit app (single-file, ~86 lines)
shared/                    # Shared modules
shared/cart.js             # Cart system (localStorage, sliding panel, checkout -> ts_orders)
shared/auth.js             # Auth system (login/register, cliente/admin roles, modal injection)
shared/accessibility.js    # Accessibility widget (font size, high contrast, grayscale, localStorage persistence)
shared/accessibility.css   # Widget styles, high contrast mode, grayscale mode
main/                      # Landing page: index.html, styles.css, script.js
Catalogo/                  # Cake catalog: catalogo.html, catalogo.js (12 cakes from Unsplash), catalogo.css
Catalogo/detallePastel/    # Cake detail page: detalle.html, detalle.js (12 cakes from Unsplash), detalle.css
Contacto/                  # Contact: contacto.html (form with JS handler), contacto.css
Nosotros/                  # About: nosotros.html, nosotros.css
Personalizacion/           # Customisation: personalizacion.html (map, accessibility, step-by-step), personalizacion.js, personalizacion.css
```

## Key facts

- **no `requirements.txt`** — `streamlit` + `pandas` needed to run `app.py`
- **no README**, no CI, no tests
- All pages are in **Spanish** (labels, comments, vars)
- Static site — Bootstrap 5.3.2 via CDN, Google Fonts, Font Awesome (contact page only)
- Cart is `localStorage`-based via `shared/cart.js` — persists across pages. Cart panel slides in from right. Checkout saves to order history under `ts_orders` key.
- Auth is `localStorage`-based via `shared/auth.js`. Two roles: `cliente` and `admin`. Default admin: `admin@tallerdesabores.pe` / `admin123`. Admin panel shows orders and user list.
- Auth modals are **injected automatically** by auth.js — no need to duplicate modal HTML on each page
- Accessibility widget (`shared/accessibility.js` + `shared/accessibility.css`) injected on all pages — floating ♿ button controls font size, high contrast, grayscale. Persists in `ts_accessibility` / `ts_grayscale` keys.
- Catalog data: 12 cakes hardcoded in `Catalogo/catalogo.js` + `Catalogo/detallePastel/detalle.js`, all using Unsplash URLs
- Every page has auth buttons (👤 login, logout, admin gear) in the navbar
- Every page has the cart panel HTML and cart button in the navbar
- Contacto form (`contacto.html:233`) has `onsubmit="return handleContactForm(event)"` — saves mock data, shows toast
- Image paths are all Unsplash (`?auto=format&fit=crop&q=80&w=600`) — no local img/ references
- Default admin credentials: `admin@tallerdesabores.pe` / `admin123`
- localStorage keys: `ts_cart` (cart items), `ts_orders` (checkout history), `ts_auth` (current user), `ts_users` (user DB), `ts_accessibility` (widget prefs), `ts_grayscale` (grayscale toggle)

## Shared modules API

### `shared/cart.js`
- `Cart.addItem({ id, name, price, quantity, image, options })` — add to cart
- `Cart.removeItem(id)` — remove item
- `Cart.updateQuantity(id, qty)` — change qty (0 removes)
- `Cart.getItems()` — return cart array
- `Cart.getTotal()` — return total price
- `Cart.getCount()` — return total item count
- `Cart.togglePanel()` — show/hide sliding cart panel
- `Cart.checkout()` — save to `ts_orders`, clear cart, show admin in admin panel

### `shared/auth.js`
- `Auth.openModal(tab)` — open auth modal (tab: 'login' | 'register')
- `Auth.openAdmin()` — open admin panel modal (orders + users tabs)
- `Auth.logout()` — clear session, update UI
- Injected HTML: Login modal (#authModal, #adminModal), admin panel, toast container
- Auto-updates navbar: shows 👤 when logged out, shows name + logout when logged in, shows ⚙️ for admin users

### `shared/accessibility.js`
- Injects floating ♿ button bottom-left
- Click opens widget panel: font size slider (70-150%), high contrast toggle, grayscale toggle
- Applies `.high-contrast-mode` class to `<html>` for dark bg / white text / gold links
- Applies `filter: grayscale(100%)` to `<html>` for grayscale mode
- Persists settings in `ts_accessibility` (JSON: { fontSize, highContrast }) and `ts_grayscale` (boolean)

## Deployment notes

For production deployment (shared hosting like Hostinger/SiteGround):
1. Replace localStorage CRUD with PHP + MySQL
2. Create PHP API endpoints: `/api/auth/login.php`, `/api/cart/add.php`, `/api/orders/list.php`, etc.
3. Migrate `ts_users`, `ts_orders`, `ts_cart` to MySQL tables
4. Use phpMyAdmin for DB management
5. Update `shared/auth.js` and `shared/cart.js` to `fetch()` from PHP endpoints instead of localStorage
