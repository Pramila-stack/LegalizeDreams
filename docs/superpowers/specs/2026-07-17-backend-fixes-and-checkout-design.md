# LEGALIZE DREAMS — Backend Fixes & Guest-Cart Checkout

**Date:** 2026-07-17
**Status:** Approved design, ready for implementation planning

## Goal

Take the existing full-stack e-commerce app to a production-quality state for a client
who expects perfection. Fix all backend defects, let the admin manage **everything**
(including category images), and wire the React frontend to the backend end-to-end using
a **guest cart with backend-validated checkout**.

## Cart model (decided)

- **Guest cart:** the shopper's cart lives in the browser (localStorage). No login is
  required to browse or add items. This is the only cart in the system.
- **Backend checkout:** at checkout the cart contents are POSTed to the backend, which
  re-validates every line against the *current* database price and stock, computes the
  order total itself (client-sent prices are never trusted), and creates the order
  atomically. Login is required at this step.
- The previously-existing **server-side cart** (`Cart`/`CartItem` tables and `/api/cart/*`
  endpoints) is **removed** — it was dead code that nothing called and was the source of
  several bugs. Cross-device carts can be re-added cleanly later if ever needed.

---

## Part 1 — Backend data & admin

### Category images
- Add `image = models.ImageField(upload_to='categories/', null=True, blank=True)` to the
  `Category` model; generate the migration.
- Expose `image` in `CategorySerializer`, returning an **absolute URL** (serializer must
  receive request context).
- Admin: add the `image` upload field and a thumbnail preview in both the list view and
  the change form.

### Admin "manage everything"
- **Products:** add an image thumbnail preview to the change form / list (upload already works).
- **Categories:** image upload + thumbnail (above).
- **Media serving:** confirm `MEDIA_URL`/`MEDIA_ROOT` serving works in dev so uploaded
  images render in both the admin and the React app. (Already wired in `config/urls.py`
  under `DEBUG`; verify end-to-end.)
- **Null-safety:** `OrderItem.__str__` (and any remaining `__str__` referencing a
  `SET_NULL` product) must not dereference a possibly-null product — deleting a product
  must never break the order admin.
- Add `django_filters` to `INSTALLED_APPS` for correctness and browsable-API filter forms.

---

## Part 2 — Cart, stock & checkout (backend)

### Category filtering fix
- `/api/products/?category=<slug>` currently filters on the category **UUID primary key**,
  so a slug never matches and category pages return zero products.
- Fix with a small `FilterSet` that filters products by **category slug**, keeping the
  existing `?category=<slug>` query contract so the frontend needs no change.
- Ensure the products serializer always receives request context so image URLs are
  absolute on **every** endpoint, including the category-detail `products` action.

### Checkout — `POST /api/orders/create/` (login required)
Request body:
```json
{
  "items": [{ "product_id": 1, "quantity": 2 }],
  "shipping_address": "...",
  "city": "...",
  "postal_code": "...",
  "country": "...",
  "customer_email": "...",
  "customer_phone": "",
  "notes": ""
}
```
Behavior — all inside a single atomic transaction:
1. Reject an empty `items` list with `400`.
2. `select_for_update()` on each referenced product (row lock — no race conditions).
3. Re-validate each line: product exists, `is_active`, and `stock >= quantity`. If **any**
   line fails, reject the **whole** order with a clear per-item message
   (e.g. "Only 3 left of X"). Nothing is partially committed.
4. Compute `total_amount` server-side from the current DB price; snapshot each line's price
   into `OrderItem.price_at_purchase`. Client-sent prices are ignored.
5. Deduct stock, create the `Order` and its `OrderItem`s, return the created order.

Input validation:
- `quantity` must be a positive integer; malformed input returns `400`, never a `500`.
- Product IDs that don't exist / aren't active return a clear per-item `400`.

### Removal of the server cart
- Delete `Cart` and `CartItem` models, their serializers, the `CartViewSet`, its admin
  registrations, and the `/api/cart/*` routes.
- Migration to drop the `cart` and `cartitem` tables.
- Keep `Order` and `OrderItem` intact.

---

## Part 3 — Frontend wiring (guest cart + login-gated checkout)

### API service (`frontend/src/services/api.js`)
- `register()` and `login()` — call the existing `/api/auth/*` endpoints and store the
  returned JWT access/refresh tokens in localStorage.
- `createOrder(items, shipping)` — `POST /api/orders/create/` with an
  `Authorization: Bearer <access>` header.
- Small auth helper: is-logged-in check, logout, attach-token. Token refresh on 401 is a
  nice-to-have; the simple fallback is to prompt re-login at checkout if the token expired.

### Stock-aware guest cart (`CartContext.jsx`)
- Carry `stock` alongside the existing product data so the UI can cap quantity at available
  stock and disable "Add" when a product is out of stock.
- This is **UX polish only**; the backend re-check at checkout remains the security boundary.

### Checkout flow — dedicated `/checkout` route
1. "Checkout" in the cart navigates to `/checkout`.
2. If not logged in → a lightweight **login / register** panel (toggle between the two,
   both hitting the existing auth endpoints). On success, continue.
3. Shipping form: address, city, postal code, country, email, phone, optional notes.
4. Submit → `createOrder(cartItems, shipping)`.
5. Success → clear the localStorage cart, show an **order confirmation** with the order number.
6. Backend stock error (e.g. "Only 3 left of X") → surface it clearly and let the shopper
   adjust the cart before retrying. This is the one place the guest cart and backend reconcile.

### Auth UX scope (decided)
- Lightweight login/register panel **inside** the checkout flow. No standalone account page,
  profile editing, or order-history UI in this pass. Order history already exists as an API
  and can be surfaced later.

---

## Out of scope (this pass)
- Payment gateway (Stripe/PayPal).
- Email notifications.
- Product reviews submission, wishlists, advanced multi-facet filtering.
- Standalone user account / profile / order-history UI.
- Cross-device (server-side) cart.
- PostgreSQL / Docker / CI.

## Success criteria
- Server starts clean; `manage.py check` passes.
- Admin can create/edit categories **with images** and products with images; both render.
- `/api/products/?category=<slug>` returns the correct products with absolute image URLs.
- Adding to cart caps at stock; out-of-stock products can't be added.
- Checkout: login-gated, validates stock/price server-side atomically, deducts stock,
  returns an order number; concurrent checkouts cannot oversell or drive stock negative.
- No `/api/cart/*` endpoints remain; no dead cart code.
