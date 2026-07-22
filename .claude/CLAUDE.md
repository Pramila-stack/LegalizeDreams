# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LEGALIZE DREAMS** is a full-stack e-commerce application:
- **Frontend:** React 19 + Vite + Tailwind CSS (http://localhost:5173)
- **Backend:** Django 4.2 + Django REST Framework (http://localhost:8000)
- **Database:** SQLite (development) / PostgreSQL (production)

The frontend is fully connected to the Django backend via REST API. All data flows through `frontend/src/services/api.js` which calls `http://localhost:8000/api/*` endpoints.

---

## Quick Commands

### Frontend (from `frontend/` folder)
```bash
npm install              # Install dependencies
npm run dev             # Start dev server with hot reload (http://localhost:5173)
npm run build           # Build for production (creates dist/)
npm run preview         # Preview production build locally
npm run lint            # Run Oxlint (no auto-fix)
```

### Backend (from `backend/` folder with venv activated)
```bash
python manage.py runserver                    # Start dev server (http://localhost:8000)
python manage.py migrate                      # Apply database migrations
python manage.py makemigrations [app]         # Create migrations after model changes
python manage.py createsuperuser              # Create admin user
python manage.py init_admin                   # Create sample data & admin if missing
python manage.py shell                        # Interactive Django shell
```

### Setup (One-time)
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser

# Frontend
cd ../frontend
npm install
```

---

## Architecture Overview

### Data Flow

```
User Browser (http://localhost:5173)
    ↓
React App (frontend/src/)
    ↓
API Service (frontend/src/services/api.js)
    ↓
HTTP Calls to Django API (http://localhost:8000/api/*)
    ↓
Django REST Framework Views (backend/apps/*/views.py)
    ↓
Database (SQLite/PostgreSQL)
```

### Frontend Architecture

**Entry Point:** `frontend/src/main.jsx` → `App.jsx` → `BrowserRouter` with routes

**State Management:**
- `CartContext` — Shopping cart state (persisted to localStorage)
- `ToastContext` — User notifications (success/error/info)
- Local component state for UI interactions

**Key Services:**
- `frontend/src/services/api.js` — All API calls to Django backend (standardized error handling)
- `frontend/src/hooks/useFormValidation.js` — Form validation for checkout, search, etc.

**Routes (in App.jsx):**
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | HomePage | Hero, categories, featured products, FAQ |
| `/category/:slug` | CategoryPage | Products filtered by category |
| `/product/:slug` | ProductPage | Product detail + related products |
| `/cart` | CartPage | Cart review, empty state |
| `/checkout` | CheckoutPage | Shipping form + payment method |
| `/order-confirmation/:orderId` | OrderConfirmationPage | Order summary |
| `/search` | SearchPage | Full-text product search |

### Backend Architecture

**Django Apps (in `backend/apps/`):**

1. **users/** — Authentication & user profiles
   - JWT tokens (access/refresh)
   - User registration, login, profile endpoints
   - `SafeJWTAuthentication` allows guest checkout

2. **products/** — Catalog management
   - Categories (with slug routing)
   - Products (searchable, filterable by category)
   - Both read-only for frontend

3. **orders/** — Shopping cart & orders
   - Cart management (add/update/remove items)
   - Order creation (with guest checkout support)
   - Order history (authenticated users only)

**Database Models:**
- `User` — Extends Django default with email, timestamps
- `Category` — name, slug, description
- `Product` — price, stock, rating, category FK, image
- `Cart` — OneToOne per user
- `CartItem` — product quantity, cart FK
- `Order` — customer info, total, status, timestamps
- `OrderItem` — product snapshot at purchase time (price_at_purchase)

**API Response Format:**
All endpoints return JSON. Errors standardized to: `{ "error": "message", "status": 400 }`

**Key Endpoints:**
- `GET /api/categories/` — List all categories
- `GET /api/products/?search=...&category=...` — Paginated product list (20 per page)
- `POST /api/auth/register/` — Create account
- `POST /api/auth/login/` — Get JWT tokens
- `POST /api/orders/create/` — Create order (allows guest + authenticated)
- `GET /api/cart/` — View user's cart
- `POST /api/cart/add-item/` — Add product to cart

---

## Development Workflow

### Adding a Feature

1. **Backend First:**
   - Update model in `backend/apps/*/models.py`
   - Create migration: `python manage.py makemigrations`
   - Apply: `python manage.py migrate`
   - Add endpoint in `backend/apps/*/views.py` (ViewSet with @action)
   - Add to `backend/apps/*/urls.py`
   - Test with browser/Postman: `GET http://localhost:8000/api/endpoint/`

2. **Frontend Second:**
   - Add API call to `frontend/src/services/api.js`
   - Create component in `frontend/src/components/`
   - Use `useToast()` for error feedback
   - Test in browser at http://localhost:5173

### Modifying Existing Code

**Styling:** Edit components' inline Tailwind classes (`className="..."`). All colors defined in `frontend/src/index.css` (@theme).

**Animations:** Defined as keyframes in `frontend/src/index.css`. Apply via `className="animate-on-scroll"` etc.

**API Errors:** All caught in `frontend/src/services/api.js` and shown via toast. Wrap fetch calls in try-catch with `useToast()`.

**Forms:** Use `useFormValidation()` hook from `frontend/src/hooks/useFormValidation.js` for controlled inputs & validation.

---

## Key Design Decisions

### Why React Context + localStorage instead of Redux?
- Simpler for this scale (cart + notifications only)
- `localStorage` keeps cart between sessions
- No external state library needed

### Why JWT + SafeJWTAuthentication?
- Stateless auth (no sessions table)
- Guest checkout: SafeJWTAuthentication returns `None` for missing tokens (not error)
- Allows `AllowAny()` permission override for `/api/orders/create/`

### Why Django Admin?
- Built-in CRUD for categories/products
- Image upload via media folder
- Staff users can manage inventory without API access
- **Note:** Don't use prepopulated_fields in ProductAdmin (causes template errors in Django 4.2)

### Why Vite + Tailwind CSS?
- Hot reload for fast development
- No CSS-in-JS (pure Tailwind utilities)
- base: '/static/' in vite.config.js for production asset paths
- Small build size (~400KB gzipped)

### Single Database Model Design
- Products have immutable snapshots in OrderItem.price_at_purchase
- Allows price changes without affecting historical orders
- Cart stores product_id, not product data (fetched fresh on load)

---

## Common Tasks

### Adding a New API Endpoint

1. Create ViewSet in `backend/apps/*/views.py`:
```python
class MyViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def my_action(self, request):
        return Response({'result': 'data'}, status=status.HTTP_200_OK)
```

2. Register in `backend/apps/*/urls.py`:
```python
urlpatterns = [
    path('my-endpoint/', MyViewSet.as_view({'post': 'my_action'}))
]
```

3. Add API call in `frontend/src/services/api.js`:
```javascript
async myCall(data) {
    const response = await fetch(`${API_BASE_URL}/my-endpoint/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to call endpoint')
    return await response.json()
}
```

### Adding a New Product Field

1. Add to `backend/apps/products/models.py`:
```python
class Product(models.Model):
    new_field = models.CharField(max_length=100)
```

2. Migrate:
```bash
python manage.py makemigrations products
python manage.py migrate
```

3. Update serializer in `backend/apps/products/serializers.py`:
```python
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'name', ..., 'new_field']
```

4. Update admin in `backend/apps/products/admin.py`:
```python
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'new_field', ...]
```

5. Frontend components will receive the new field automatically via API.

### Resetting Database to Fresh State

```bash
cd backend
# Delete db.sqlite3 file
# Reapply migrations
python manage.py migrate
python manage.py createsuperuser
python manage.py init_admin  # Creates 5 sample categories & products
```

### Testing API Endpoints

Use browser DevTools Console:
```javascript
fetch('http://localhost:8000/api/categories/')
    .then(r => r.json())
    .then(data => console.log(data))
```

Or use curl:
```bash
curl http://localhost:8000/api/products/?search=keyword
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named X" (Backend)
Virtual environment is stale. Reinstall:
```bash
cd backend
deactivate
venv\Scripts\activate
pip install -r requirements.txt --force-reinstall
python manage.py runserver
```

### Frontend shows "no products" but API works
- Check `frontend/.env`: `VITE_API_URL=http://localhost:8000/api`
- Check browser console for fetch errors (CORS, 404, network issues)
- Verify backend is running and has data: Visit http://localhost:8000/admin

### CORS errors (frontend can't reach backend)
- Verify `backend/.env`: `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- **Restart backend** after changing `.env` (Python doesn't auto-reload env vars)
- Check the exact error message for origin URL mismatch

### Admin panel not showing categories/products
- Run migrations: `python manage.py migrate`
- Check `backend/apps/*/admin.py` registers models with `admin.site.register()`
- Verify data exists: `python manage.py shell` → `Product.objects.all()`

### Port already in use (8000 or 5173)
```bash
# Frontend: use different port
cd frontend
npm run dev -- --port 5174

# Backend: use different port
python manage.py runserver 8001
```

### "Cannot GET /static/index.html" in production
- This warning is normal in development (Django doesn't auto-serve React build)
- Production requires running `npm run build` in frontend, then serving dist/ via Django

---

## Configuration Files

**backend/.env:**
```
DEBUG=True                              # False in production
SECRET_KEY=your-secret                  # Keep secret, never in git
ALLOWED_HOSTS=localhost,127.0.0.1       # Add production domains here
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///db.sqlite3       # Or postgresql://... for production
JWT_ACCESS_TOKEN_LIFETIME=15            # Minutes
JWT_REFRESH_TOKEN_LIFETIME=7            # Days
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:8000/api
```

**vite.config.js:**
```javascript
base: '/static/'  // Critical for production: ensures /assets/* paths become /static/assets/*
```

---

## Tech Stack Details

**Frontend Dependencies:** React 19, Vite 8, Tailwind 4, react-router-dom 7, Context API (no Redux)

**Backend Dependencies:** Django 4.2 LTS, DRF 3.14, simplejwt 5.3 (JWT auth), django-cors-headers, django-filter, WhiteNoise (static files)

**Python Version:** 3.12+ required (Django 4.2 compatibility)

**Database:** SQLite (dev), PostgreSQL recommended (production) — configured via `DATABASE_URL`

---

## When to Modify Key Files

| File | When | Notes |
|------|------|-------|
| `frontend/src/index.css` | Changing animations or color theme | Define keyframes here, colors via `@theme` |
| `frontend/src/App.jsx` | Adding routes or global animation logic | IntersectionObserver for scroll animations initialized here |
| `backend/config/settings.py` | Adding Django apps, changing DB, updating CORS | Uses python-decouple for env vars |
| `backend/config/urls.py` | Adding new API routes | Organized by app, with Django admin |
| `backend/apps/*/models.py` | Schema changes | Always run makemigrations → migrate after |
| `frontend/src/services/api.js` | Adding new API calls | All errors caught here and shown via toast |
| `backend/apps/products/admin.py` | Customizing admin panel | Add search_fields, list_filter, list_display for UX |
