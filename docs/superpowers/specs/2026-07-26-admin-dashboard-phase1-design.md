# Custom Admin Dashboard — Phase 1 Design

**Date:** 2026-07-26
**Status:** Approved (pending spec review)

## Problem

The client currently manages the store through the Django admin panel. The owner
wants a purpose-built React admin dashboard so the client never touches Django
admin. This is **Phase 1** of that dashboard: authentication, an overview
dashboard, and full management of **products** and **categories**.

Phase 2 (separate spec) will add order viewing and user management.

## Goals (Phase 1)

- A staff-only login for the dashboard, separate from the customer session.
- An overview dashboard with key counts and navigation.
- Full product CRUD (create, edit, delete, list) including image upload.
- Full category CRUD (create, edit, delete, list).
- Keep Django admin available to the developer (not exposed to the client).

## Non-Goals (Phase 1)

- Order viewing/management and user management (Phase 2).
- Creating or promoting admin/staff users from the dashboard (out of scope by
  decision — admins are provisioned via `createsuperuser`/Django).
- Editing `rating`/`review_count` (system-managed).
- Any change to the public storefront, its API, or existing customer auth.
- Analytics beyond simple counts.

## Decisions (from brainstorming)

- **Admin = `is_staff`.** All admin endpoints gated by DRF `IsAdminUser`.
- **Phased build**, core first (this spec is the core).
- **No admin-creation** from the dashboard.
- **User management** (Phase 2) will be view + activate/deactivate, no hard delete.
- **Dashboard path** `/admin/*` on the Netlify frontend (Django admin lives on the
  Render backend domain, so no collision).

## Architecture

```
Admin browser (/admin/* on Netlify frontend)
  │  login → JWT (separate admin_access_token in localStorage)
  ▼
frontend/src/admin/*  ──fetch w/ Bearer──▶  /api/admin/*  (DRF, IsAdminUser)
                                                  │
                                                  ▼
                                   existing Product / Category models
```

### Backend: new app `apps/dashboard`

A dedicated app centralizes the admin API. It defines **no models** (it operates
on `apps.products` models), so it needs **no migrations**. It is added to
`INSTALLED_APPS` and mounted at `/api/admin/`.

Rationale for a separate app rather than extending the public viewsets: the
public product/category viewsets are intentionally `ReadOnlyModelViewSet`. Keeping
admin write-access in its own namespace with a single blanket `IsAdminUser`
permission keeps the security boundary obvious and prevents accidental exposure of
write operations on public routes.

### Frontend: new area `frontend/src/admin`

Self-contained: its own auth context, API client, layout, and pages, so it does
not entangle with the storefront components.

## Backend Detail (`apps/dashboard`)

### Permissions & auth

- Authentication: existing default `SafeJWTAuthentication` (returns `None` for
  invalid tokens → `IsAdminUser` then denies).
- Every view sets `permission_classes = [IsAdminUser]` (DRF built-in; checks
  `is_staff`). No custom permission class is needed.

### Endpoints

All under `/api/admin/`:

| Method(s) | Path | View | Behavior |
|---|---|---|---|
| GET | `me/` | `AdminMeView(APIView)` | Returns `{id, username, email, is_staff, is_superuser}` for the authenticated staff user. Used by the frontend to confirm admin status after login and to guard routes. Non-staff → 403. |
| GET | `stats/` | `AdminStatsView(APIView)` | Returns `{products, categories, orders, users}` counts. Order/user counts are included now even though their screens arrive in Phase 2. |
| GET/POST | `categories/` | `AdminCategoryViewSet` | List all / create. |
| GET/PUT/PATCH/DELETE | `categories/{id}/` | `AdminCategoryViewSet` | Retrieve / update / delete. |
| GET/POST | `products/` | `AdminProductViewSet` | List all / create (multipart image upload). |
| GET/PUT/PATCH/DELETE | `products/{id}/` | `AdminProductViewSet` | Retrieve / update / delete. |

- Both viewsets are `ModelViewSet` with `permission_classes = [IsAdminUser]`,
  `pagination_class = None` (admin lists return all rows), and lookup by numeric
  `id` for products / UUID `id` for categories (their existing PKs).
- `AdminProductViewSet` sets `parser_classes = [MultiPartParser, FormParser,
  JSONParser]` to accept image file uploads and JSON.

### Serializers

**`AdminCategorySerializer`** (writable)
- Fields: `id`, `name`, `slug`, `description`, `created_at`.
- `slug` is `read_only` and auto-generated (see Slug generation).

**`AdminProductSerializer`** (writable)
- Fields: `id`, `name`, `slug`, `description`, `price`, `category`, `category_name`,
  `stock`, `image`, `rating`, `review_count`, `is_active`, `created_at`.
- `category`: writable by category `id` (PrimaryKeyRelatedField).
- `category_name`: `read_only`, from `category.name`, for list display.
- `image`: writable file (Cloudinary via the model's storage); optional on update.
- `slug`, `rating`, `review_count`, `created_at`: `read_only`.

### Slug generation

Products and Categories both have a unique `slug` the client should never manage.

- A shared helper `unique_slug(model, name)` returns `django.utils.text.slugify(name)`,
  appending `-2`, `-3`, … until unique for that model.
- Each admin serializer's `create()` sets `slug = unique_slug(Model, validated_name)`.
- On `update()`, the slug is left unchanged (renaming a product does not silently
  change its URL; keeps existing links stable). This is a deliberate choice; note
  it in the plan so a reviewer does not flag it as a bug.

### Product delete semantics

Hard `DELETE` is safe: `OrderItem.product` is `on_delete=SET_NULL` with a
`price_at_purchase` snapshot, so past orders keep their line and price (the product
link becomes null). `CartItem.product` is `CASCADE`, so the product is removed from
any active carts. The product form's `is_active` toggle remains available as a
soft-hide alternative.

### URL wiring

- `apps/dashboard/urls.py`: a `DefaultRouter` registers `products` and `categories`;
  explicit paths add `me/` and `stats/`.
- `config/urls.py`: add `path('api/admin/', include('apps.dashboard.urls'))`
  BEFORE the React catch-all (which already excludes `api`). `/api/admin/` is
  distinct from Django's `/admin/`.
- `apps.dashboard` added to `INSTALLED_APPS`.

## Frontend Detail (`frontend/src/admin`)

### Files / responsibilities

- `admin/adminApi.js` — fetch wrapper that attaches `Authorization: Bearer
  <admin_access_token>`, sets JSON or multipart bodies, and throws on non-OK
  (surfacing backend error messages). Methods: `login`, `getMe`, `getStats`,
  `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`,
  `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`.
- `admin/AdminAuthContext.jsx` — stores `admin_access_token` / `admin_refresh_token`
  in localStorage under **admin-specific keys** (never the customer `access_token`);
  exposes `admin` (identity or null), `login(username,password)`, `logout()`,
  `loading`. `login` calls `/api/auth/login/` then `/api/admin/me/`; if `me`
  fails (non-staff), it clears tokens and throws "This account is not an admin."
- `admin/RequireAdmin.jsx` — route guard: if no token → redirect `/admin/login`;
  otherwise validate via `getMe()` once; on 401/403 clear + redirect.
- `admin/AdminLayout.jsx` — sidebar (Dashboard, Products, Categories; Orders/Users
  placeholders labeled "coming soon" or omitted in Phase 1) + header with the admin
  username and a logout button; renders `<Outlet/>`.
- `admin/pages/AdminLogin.jsx` — username/password form; on success routes to
  `/admin`.
- `admin/pages/Dashboard.jsx` — fetches `/api/admin/stats/`; renders count cards +
  quick links.
- `admin/pages/ProductsList.jsx` — table (image thumb, name, category, price, stock,
  active), Edit/Delete actions, "Add product" button.
- `admin/pages/ProductForm.jsx` — used for both add and edit; fields name,
  description, price, category (select populated from categories), stock, image
  (file input; on edit shows current image and keeps it if no new file), is_active.
- `admin/pages/CategoriesList.jsx` — list + inline add/edit/delete (name,
  description).

### Routing (in `App.jsx`)

Add, wrapped so the admin area is isolated from storefront layout:

```
/admin/login                     → AdminLogin
/admin            (RequireAdmin) → AdminLayout
  index                          → Dashboard
  products                       → ProductsList
  products/new                   → ProductForm (create)
  products/:id/edit              → ProductForm (edit)
  categories                     → CategoriesList
```

`AdminAuthProvider` wraps the admin routes (or the whole app) so context is
available to login and guarded pages.

### Auth flow

1. Admin submits login → `POST /api/auth/login/` → `{access, refresh}`.
2. Store tokens (admin keys) → `GET /api/admin/me/`.
3. 200 → store identity, go to `/admin`. 403/401 → clear tokens, show "not an
   admin account."
4. Guarded pages call admin API with the bearer token; a 401 triggers logout →
   `/admin/login`.

### Styling

Reuse the existing Tailwind theme tokens (`brand-*`, `blush-*`) for a clean,
consistent dashboard: fixed sidebar, content area with cards/tables. Distinct
enough to read as "admin," not the storefront.

## Testing / Verification

**Backend (`apps/dashboard/tests.py`, Django `APITestCase`):**
- Unauthenticated and non-staff users get 403 on `me`, `stats`, `products`,
  `categories`.
- Staff user: `me` returns identity with `is_staff=True`; `stats` returns integer
  counts.
- Category: create returns auto-generated slug; duplicate name yields a distinct
  slug; update changes name without changing slug; delete removes it.
- Product: create with a category and fields returns 201 with auto slug and
  `category_name`; update edits fields; delete returns 204 and leaves any existing
  `OrderItem` intact with `product=None`.
- Uses filename-string assignment / small in-memory uploads to avoid real Cloudinary
  network calls (consistent with the hero tests); `CLOUDINARY_*` env available.

**Frontend:** no test runner in the project (only oxlint). Verify with `npm run
build` (import/JSX correctness) and a manual walkthrough: log in as staff, see
stats, add/edit/delete a product with image, add/edit/delete a category, confirm a
non-staff account is rejected.

## Files Touched

**New (backend)**
- `backend/apps/dashboard/__init__.py`
- `backend/apps/dashboard/apps.py`
- `backend/apps/dashboard/serializers.py`
- `backend/apps/dashboard/views.py`
- `backend/apps/dashboard/urls.py`
- `backend/apps/dashboard/utils.py` (`unique_slug`)
- `backend/apps/dashboard/tests.py`

**Modified (backend)**
- `backend/config/settings.py` — add `apps.dashboard` to `INSTALLED_APPS`.
- `backend/config/urls.py` — include `apps.dashboard.urls` at `/api/admin/`.

**New (frontend)**
- `frontend/src/admin/adminApi.js`
- `frontend/src/admin/AdminAuthContext.jsx`
- `frontend/src/admin/RequireAdmin.jsx`
- `frontend/src/admin/AdminLayout.jsx`
- `frontend/src/admin/pages/AdminLogin.jsx`
- `frontend/src/admin/pages/Dashboard.jsx`
- `frontend/src/admin/pages/ProductsList.jsx`
- `frontend/src/admin/pages/ProductForm.jsx`
- `frontend/src/admin/pages/CategoriesList.jsx`

**Modified (frontend)**
- `frontend/src/App.jsx` — add admin routes + `AdminAuthProvider`.
