# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LEGALIZE DREAMS** is a full-stack e-commerce application with **frontend and backend fully integrated and running**:
- **Frontend:** React 19 + Vite + Tailwind CSS (http://localhost:5173)
- **Backend:** Django 4.2 + Django REST Framework (http://localhost:8000)
- **Database:** SQLite (development)

The frontend API service (`frontend/src/services/api.js`) is **already connected** to the Django backend at `http://localhost:8000/api`. All data (categories, products) comes from the real backend, not mock data.

**Project Structure:**
```
LEGALIZEDREAMS/
├── frontend/          # React application (Vite)
│   ├── src/
│   │   ├── components/    # UI components (common/, home/, layout/, product/)
│   │   ├── context/       # CartContext for state
│   │   ├── services/      # API client (connected to Django)
│   │   ├── data/          # Mock data (deprecated, kept for reference)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env               # VITE_API_URL=http://localhost:8000/api
├── backend/           # Django application
│   ├── apps/
│   │   ├── users/         # Auth (register, login, profile, JWT)
│   │   ├── products/      # Product & category management
│   │   └── orders/        # Cart & order management
│   ├── config/            # Django settings (settings.py, urls.py, wsgi.py)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env               # Django configuration
│   ├── .env.example
│   └── db.sqlite3
├── docs/              # Shared documentation
└── .claude/           # Claude Code config
```

---

## Quick Start (Development)

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate  # (Windows: venv\Scripts\activate)
python manage.py runserver
# Backend at http://localhost:8000
# Admin Dashboard: http://localhost:8000/admin
#   Login: admin / admin123
#   Use this to create categories, add products, manage inventory
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Frontend at http://localhost:5173
```

Both have hot reload. Edit code, save, changes appear instantly.

---

## Frontend (React 19 + Vite)

### Commands

**Development (run from `frontend/` folder):**
- `npm run dev` — Start dev server with HMR (http://localhost:5173)
- `npm run build` — Build for production (`dist/`)
- `npm run preview` — Preview production build locally
- `npm run lint` — Run Oxlint (React rules, no auto-fix)

**No test suite configured.** Testing is manual (browser verification).

### Tech Stack
- React 19 (plain JSX, no TypeScript)
- Vite 8 + HMR
- Tailwind CSS 4 with custom `@theme` palette (`frontend/src/index.css`)
- react-router-dom 7 (classic JSX Routes/Route config)
- Context API (CartContext for cart state)

### Architecture

**Entry Point Chain:**
1. `frontend/src/main.jsx` → mounts `<App />`
2. `frontend/src/App.jsx` → wraps router in `CartProvider` → `BrowserRouter` → layout route
3. `frontend/src/components/layout/Layout.jsx` → renders Header + Outlet + Footer

**Routes (all defined in App.jsx):**

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | HomePage | Hero, categories, featured, FAQ |
| `/category/:slug` | CategoryPage | Filtered product list by category |
| `/product/:slug` | ProductPage | Product detail, add-to-cart, related products |
| `/cart` | CartPage | Cart review, checkout preparation |
| `/search` | SearchPage | Full-text search on products |
| `*` | NotFoundPage | 404 fallback |

**Component Structure:**
```
frontend/src/components/
├── common/    # Button, Price, ProductImage, QuantityInput, StarRating, ScrollToTop
├── home/      # Hero, CategoryGrid, FeaturedProducts, FaqAccordion
├── layout/    # Header, Footer, Layout (global wrapper)
└── product/   # ProductCard, ProductCardSkeleton
```

### State Management

**React Context API only** (no Redux/Zustand).

`frontend/src/context/CartContext.jsx`:
- Hook: `useCart()` → `{ addToCart, removeFromCart, updateQty, clearCart, itemCount, subtotal }`
- Persisted to localStorage (`'lune.cart'` — key unchanged for backwards compatibility)
- Consumed by: Header (cart badge), CartPage, ProductPage

### API Integration

`frontend/src/services/api.js` is **already connected** to the Django backend:
- `getCategories()` → `GET /api/categories/`
- `getCategory(slug)` → `GET /api/categories/{slug}/`
- `getProducts({categorySlug, query, limit})` → `GET /api/products/?category=...&search=...`
- `getFeaturedProducts(limit)` → `GET /api/products/`
- `getProduct(slug)` → `GET /api/products/{slug}/`
- `getRelatedProducts(product, limit)` → `GET /api/products/?category={id}`

**Environment:** `frontend/.env` → `VITE_API_URL=http://localhost:8000/api`

### Coding Conventions

- Plain JSX (no TypeScript)
- Function components + hooks only
- Relative imports (no path aliases)
- Default export for components; named exports for utilities/context/data
- Tailwind utility classes exclusively
- Active unmount checks in `useEffect` to prevent state-after-unmount warnings

### Key Details

- **Slugs:** Products/categories use URL-friendly slugs for routing
- **Ratings:** Display-only (from backend product data)
- **Responsive:** Tailwind breakpoints (sm, md, lg, xl)
- **Mobile Menu:** Simple useState toggle in Header

---

## Backend (Django 4.2 + DRF)

### Setup (One-time)

**1. Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

**3. Configure environment:**
```bash
cp .env.example .env
# .env already populated with generated SECRET_KEY, JWT settings, etc.
```

**4. Initialize database:**
```bash
python manage.py migrate
```

**5. Create admin account (already done):**
- Username: `admin`
- Password: `admin123`
- Login at http://localhost:8000/admin/

**6. Run server:**
```bash
python manage.py runserver
```

**Virtual Environment Notes:**
- Always activate the venv before running Django commands: `venv\Scripts\activate` (Windows)
- If dependencies fail to load after closing/reopening terminal, reinstall: `pip install -r requirements.txt --force-reinstall`
- The venv is in `backend/venv/` and should NOT be committed to git (already in .gitignore)

### Commands (run from `backend/` folder with venv activated)

**Development:**
- `python manage.py runserver` — Start dev server (http://localhost:8000)
- `python manage.py runserver 0.0.0.0:8000` — Listen on all network interfaces

**Database:**
- `python manage.py makemigrations [app]` — Create migrations after model changes
- `python manage.py migrate` — Apply all pending migrations
- `python manage.py migrate [app] --fake-initial` — Mark as applied without running

**Admin & Utilities:**
- `python manage.py createsuperuser` — Create admin account
- `python manage.py shell` — Interactive Python shell with Django context

**Testing:** No test suite configured. Manual testing via Postman/cURL or React frontend.

### Tech Stack
- Django 4.2 LTS
- Django REST Framework (DRF) 3.14
- djangorestframework-simplejwt 5.3.1 (JWT authentication)
- django-cors-headers 4.3.1 (CORS for localhost:5173)
- django-filter 24.1 (API filtering for products by category, search, ordering)
- Pillow 11.0.0 (image uploads)
- python-decouple 3.8 (environment variables)
- SQLite (development)

### Architecture

```
config/
├── settings.py      # Django settings, installed apps, middleware, JWT config
├── urls.py         # URL routing (includes apps.users, apps.products, apps.orders)
├── wsgi.py         # WSGI entry point
└── asgi.py         # ASGI (unused for now)

apps/
├── users/          # Authentication & user profiles
│   ├── models.py   # UserProfile (extends Django User)
│   ├── views.py    # AuthViewSet (register, login, profile endpoints)
│   ├── serializers.py # User/registration/login serializers
│   ├── urls.py     # /api/auth/* routes
│   └── admin.py    # Django Admin config
│
├── products/       # Product & category management
│   ├── models.py   # Category, Product
│   ├── views.py    # CategoryViewSet, ProductViewSet (read-only, filterable)
│   ├── serializers.py # CategorySerializer, ProductSerializer
│   ├── urls.py     # /api/products/*, /api/categories/*
│   └── admin.py    # Django Admin (add/edit/delete products, upload images)
│
└── orders/         # Cart & order management
    ├── models.py   # Cart, CartItem, Order, OrderItem
    ├── views.py    # CartViewSet (add/remove items), OrderViewSet (create orders)
    ├── serializers.py # Serializers for all models
    ├── urls.py     # /api/cart/*, /api/orders/*
    └── admin.py    # Django Admin (order management, status updates)
```

### API Endpoints (All tested and working)

**Authentication (Public/Auth as noted):**
- `POST /api/auth/register/` — Create account → returns access + refresh tokens
- `POST /api/auth/login/` — Login → returns tokens
- `POST /api/auth/refresh/` — Refresh expired access token
- `GET /api/auth/profile/` [Auth] — Get current user
- `PUT /api/auth/profile/` [Auth] — Update profile

Token lifetimes: Access=15min, Refresh=7days (configured in .env)

**Products & Categories (Public, Read-only):**
- `GET /api/products/` — List (paginated: 20 per page, searchable, filterable)
  - Query: `?page=1`, `?search=term`, `?category=<slug>`, `?ordering=-created_at`
- `GET /api/products/<slug>/` — Product detail
- `GET /api/categories/` — List all categories
- `GET /api/categories/<slug>/` — Category detail with products

**Cart (Auth required):**
- `GET /api/cart/` — View user's cart
- `POST /api/cart/add-item/` — Add product (`{"product_id": 1, "quantity": 2}`)
- `PUT /api/cart/items/<id>/` — Update quantity
- `DELETE /api/cart/items/<id>/` — Remove item
- `DELETE /api/cart/clear/` — Clear entire cart

**Orders (Auth required):**
- `POST /api/orders/create/` — Create order from cart (shipping details in body)
  - Side effects: clears cart, deducts stock, captures product price snapshot
- `GET /api/orders/` — List user's orders (paginated)
- `GET /api/orders/<id>/` — Order detail (user can only see own)

### Database Models

**User** (extends Django default):
- email, username, password (hashed), first_name, last_name, created_at, updated_at

**Category:**
- name, slug (unique), description, created_at, updated_at

**Product:**
- name, slug (unique), description, price, category (FK), stock, image, rating, review_count, is_active, created_at, updated_at

**Cart:**
- user (OneToOne), created_at, updated_at

**CartItem:**
- cart (FK), product (FK), quantity, added_at
- unique_together: (cart, product)

**Order:**
- user (FK), order_number (unique), status (pending/processing/shipped/delivered)
- total_amount, shipping_address, city, postal_code, country, customer_email, customer_phone, notes
- created_at, updated_at

**OrderItem:**
- order (FK), product (FK), quantity, price_at_purchase (snapshot at order time)

### Configuration

**Backend .env:**
```
DEBUG=True                              # False in production
SECRET_KEY=<random-generated>           # For sessions/tokens
ALLOWED_HOSTS=localhost,127.0.0.1      # Allowed hostnames
DATABASE_URL=sqlite:///db.sqlite3       # SQLite dev; PostgreSQL for prod
CORS_ALLOWED_ORIGINS=http://localhost:5173  # React frontend URL
JWT_SECRET_KEY=<jwt-secret>             # Can be same as SECRET_KEY
JWT_ACCESS_TOKEN_LIFETIME=15            # Minutes
JWT_REFRESH_TOKEN_LIFETIME=7            # Days
```

**Settings (config/settings.py):**
- REST Framework pagination: 20 items per page
- Search/filter on products by name, description, category
- CSRF protection enabled
- Passwords hashed with PBKDF2 (Django default)
- JWT tokens signed with SECRET_KEY
- Rate limiting: NOT implemented (add if needed)

### Adding Data to Backend

**Option 1: Django Admin (Easiest)**
1. Visit http://localhost:8000/admin/
2. Login with `admin`/`admin123`
3. Click "Products" → "Categories" → "Add Category"
4. Click "Products" → "Products" → "Add Product"
5. Upload images, set prices, stock, ratings

**Option 2: Management Command (Future)**
- Create `backend/apps/products/management/commands/seed_products.py`
- Run: `python manage.py seed_products`

### Coding Conventions

- Models: descriptive names, include `created_at`/`updated_at` timestamps
- Serializers: separate read/write if needed; mark `read_only_fields`
- Views: use ViewSets with `@action` decorators; return correct HTTP status codes
- URLs: organized by app; meaningful route names
- Admin: register all models; customize `list_display`, `search_fields`, `list_filter`
- Validation: validate in serializer and model layers; raise DRF `ValidationError`

---

## When to Modify Key Files

| File | When to change | Notes |
|------|----------------|-------|
| `backend/config/settings.py` | Adding apps, changing DB, updating CORS | Also update `.env` template |
| `backend/config/urls.py` | Adding new routes | Keep organized by app |
| `backend/apps/*/models.py` | Changing schema | Run `makemigrations` → `migrate` |
| `backend/apps/*/serializers.py` | Changing API response format | Ensure frontend still works |
| `backend/apps/*/views.py` | Adding/modifying endpoints | Return correct HTTP status |
| `frontend/src/services/api.js` | Adding new API calls | Already connected to backend |
| `frontend/src/context/CartContext.jsx` | Changing cart logic | Update both context and backend if needed |
| `frontend/src/App.jsx` | Adding routes | Update CLAUDE.md routes table |
| `backend/apps/products/views.py` | Changing product filtering behavior | Uses custom FilterSet for category slug filtering |

---

## Integration Checklist

✅ **Already Completed:**
- Frontend connected to Django backend
- API service (`frontend/src/services/api.js`) calls `/api/*` endpoints
- Database initialized with migrations
- Admin account created (admin/admin123)
- Categories & products can be managed via Django Admin
- Frontend displays real data from backend (not mock data)
- Cart state persisted to localStorage (migrated to backend later if needed)

⏭️ **Future Enhancements (Not in MVP):**
- Product reviews/ratings (backend submission)
- Payment gateway (Stripe/PayPal)
- Email notifications
- Advanced filtering (price range, ratings, multiple categories)
- Wishlists
- PostgreSQL for production
- Docker containerization
- CI/CD (GitHub Actions)

---

## Troubleshooting

**Backend: `ModuleNotFoundError: No module named 'django_filters'`**
- The virtual environment may be stale. Reinstall dependencies:
  ```bash
  cd backend
  deactivate  # Exit venv if active
  venv\Scripts\activate  # Windows: Re-activate
  pip install -r requirements.txt --force-reinstall
  python manage.py runserver
  ```

**Frontend shows "no products":**
- Verify backend is running (`python manage.py runserver`)
- Check `.env` in frontend: `VITE_API_URL=http://localhost:8000/api`
- Check browser console for API errors (CORS, 404, etc.)
- Verify database has categories/products: Visit http://localhost:8000/admin (admin/admin123)

**CORS errors when frontend calls backend:**
- Verify `CORS_ALLOWED_ORIGINS=http://localhost:5173` in backend `.env`
- Restart backend after changing `.env`

**Database "no such table" errors:**
- Run `python manage.py makemigrations` for the app
- Run `python manage.py migrate`

**Admin panel not showing categories/products:**
- Verify migrations ran: `python manage.py migrate`
- Check `admin.py` registers the models

---

## Deployment (Deferred)

When ready:
1. **Frontend:** Netlify/Vercel → Set `VITE_API_URL` to production backend URL
2. **Backend:** Render with PostgreSQL → Set `DEBUG=False`, strong `SECRET_KEY`, production `ALLOWED_HOSTS`
3. Update `CORS_ALLOWED_ORIGINS` to production frontend URL

Details in separate deployment guide later.
