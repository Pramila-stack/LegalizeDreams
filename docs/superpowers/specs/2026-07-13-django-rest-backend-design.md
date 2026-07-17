# Django REST Backend Design Specification

**Date:** 2026-07-13  
**Project:** LEGALIZE DREAMS E-Commerce (React Frontend + Django REST Backend)  
**Status:** Approved  
**Scope:** MVP Backend for Testing/Proof-of-Concept

---

## 1. Overview

Build a professional Django REST Framework backend to power the LEGALIZE DREAMS e-commerce frontend (currently a React/Vite app with mock data and localStorage cart). The backend will:

- Persist product catalog, categories, and images via Django Admin
- Provide REST API endpoints for product browsing, user authentication, cart management, and checkout
- Manage user accounts (registration, login via JWT)
- Handle order creation with customer shipping details
- Support stock management per product

**Tech Stack:**
- Django 4.2 LTS
- Django REST Framework (DRF)
- SQLite (local development) → PostgreSQL (for production/Render later)
- JWT authentication (`djangorestframework-simplejwt`)
- Pillow (image handling)
- Django CORS headers

**Deployment:** Local development only for now; production deployment on Render deferred.

---

## 2. Architecture

### 2.1 Project Structure

```
legalizedreams_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
├── config/                    # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/                # User registration, auth, profile
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── apps.py
│   ├── products/             # Product & category management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── filters.py        # Search, category filter
│   │   └── apps.py
│   └── orders/               # Cart and order management
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       └── apps.py
├── media/                     # Product images (user uploads)
│   └── products/
└── static/                    # Static files (if needed)
```

### 2.2 Architecture Rationale

**Monolithic Django approach** chosen over microservices because:
- Single codebase is simpler to deploy and debug for MVP
- Django Admin handles all product/category/image management without custom UI
- Easier to test locally
- Can scale to microservices later if needed

---

## 3. Database Schema

### 3.1 User Model (extends Django's default User)

```
User
├── email                 (unique, primary login)
├── username              (unique)
├── password              (hashed with PBKDF2)
├── first_name
├── last_name
├── is_active             (default: True)
├── is_staff              (default: False)
├── is_superuser          (default: False)
└── created_at / updated_at
```

**Custom Fields:** None needed for MVP; use Django's built-in User model.

### 3.2 Category Model

```
Category
├── id                 (UUID or AutoField, primary key)
├── name               (max 100 chars, e.g., "Skincare", "Jewelry")
├── slug               (unique, URL-friendly, auto-generated from name)
├── description        (TextField, optional)
├── icon               (Optional: small icon for category)
├── created_at
└── updated_at
```

### 3.3 Product Model

```
Product
├── id                 (AutoField)
├── name               (max 255 chars)
├── slug               (unique, URL-friendly)
├── description        (TextField)
├── price              (DecimalField: max_digits=10, decimal_places=2)
├── category           (ForeignKey → Category, can be null for now)
├── stock              (IntegerField, ≥ 0)
├── image              (ImageField → media/products/)
├── rating             (DecimalField: 1-5, read-only from seed data)
├── review_count       (IntegerField, read-only from seed data)
├── is_active          (BooleanField, default: True, soft delete)
├── created_at
└── updated_at
```

**Constraints:**
- Price must be ≥ 0
- Stock must be ≥ 0
- Slug must be unique

### 3.4 Cart & CartItem Models

```
Cart
├── id                 (AutoField)
├── user               (ForeignKey → User, CASCADE)
├── created_at
└── updated_at

CartItem
├── id                 (AutoField)
├── cart               (ForeignKey → Cart, CASCADE)
├── product            (ForeignKey → Product, CASCADE)
├── quantity           (IntegerField, ≥ 1)
└── added_at
```

**Constraints:**
- One cart per user (unique_together if needed, or enforce in views)
- Quantity must be ≥ 1
- Product stock must be sufficient (validated in views, not DB constraint)

### 3.5 Order & OrderItem Models

```
Order
├── id                 (AutoField)
├── user               (ForeignKey → User, CASCADE)
├── order_number       (CharField, unique, auto-generated, e.g., "ORD-20260713-001")
├── status             (CharField, choices: "pending", "processing", "shipped", "delivered")
├── total_amount       (DecimalField: 10, 2)
├── shipping_address   (TextField)
├── city               (CharField, max 100)
├── postal_code        (CharField, max 20)
├── country            (CharField, max 100)
├── customer_email     (EmailField)
├── customer_phone     (CharField, max 20, optional)
├── notes              (TextField, optional)
├── created_at
└── updated_at

OrderItem
├── id                 (AutoField)
├── order              (ForeignKey → Order, CASCADE)
├── product            (ForeignKey → Product)
├── quantity           (IntegerField, ≥ 1)
├── price_at_purchase  (DecimalField: snapshot of product price at order time)
└── created_at
```

**Constraints:**
- Order number must be unique
- total_amount is calculated sum of (quantity × price_at_purchase) for all OrderItems
- status choices are immutable (enforced in serializers/views)

---

## 4. REST API Endpoints

### 4.1 Authentication Endpoints

```
POST   /api/auth/register/
       Request: { "email", "username", "password", "first_name", "last_name" }
       Response: { "access", "refresh", "user": { "id", "email", "username" } }
       Status: 201 Created

POST   /api/auth/login/
       Request: { "email", "password" }
       Response: { "access", "refresh" }
       Status: 200 OK

POST   /api/auth/refresh/
       Request: { "refresh" }
       Response: { "access" }
       Status: 200 OK

POST   /api/auth/logout/
       Request: { "refresh" } (optional, for token blacklist)
       Response: { "detail": "Successfully logged out" }
       Status: 200 OK

GET    /api/auth/profile/  [Authenticated]
       Response: { "id", "email", "username", "first_name", "last_name", "created_at" }
       Status: 200 OK

PUT    /api/auth/profile/  [Authenticated]
       Request: { "first_name", "last_name", "email" (optional) }
       Response: Updated user object
       Status: 200 OK
```

### 4.2 Product Endpoints (Public)

```
GET    /api/products/
       Query params: ?page=1, ?category=skincare, ?search=moisturizer, ?ordering=-created_at
       Response: { "count", "next", "previous", "results": [ { "id", "name", "price", "stock", "rating", "image" } ] }
       Status: 200 OK
       Pagination: 20 items per page

GET    /api/products/:id/
       Response: Full product detail { "id", "name", "slug", "description", "price", "stock", "rating", "review_count", "category" }
       Status: 200 OK

GET    /api/categories/
       Response: [ { "id", "name", "slug", "description" } ]
       Status: 200 OK

GET    /api/categories/:slug/
       Response: { "id", "name", "slug", "products": [ ] }
       Status: 200 OK
```

### 4.3 Cart Endpoints (Authenticated Required)

```
GET    /api/cart/  [Authenticated]
       Response: { "id", "user_id", "items": [ { "id", "product": {...}, "quantity" } ], "total_items", "total_price" }
       Status: 200 OK

POST   /api/cart/items/  [Authenticated]
       Request: { "product_id", "quantity" }
       Response: { "id", "product", "quantity" }
       Status: 201 Created
       Error: 409 Conflict if stock insufficient

PUT    /api/cart/items/:id/  [Authenticated]
       Request: { "quantity" }
       Response: Updated cart item
       Status: 200 OK
       Error: 409 Conflict if stock insufficient

DELETE /api/cart/items/:id/  [Authenticated]
       Response: { "detail": "Item removed" }
       Status: 204 No Content

DELETE /api/cart/  [Authenticated]
       Response: { "detail": "Cart cleared" }
       Status: 204 No Content
```

### 4.4 Order Endpoints (Authenticated Required)

```
POST   /api/orders/  [Authenticated]
       Request: { "shipping_address", "city", "postal_code", "country", "customer_email", "customer_phone" (optional), "notes" (optional) }
       Response: { "id", "order_number", "status", "total_amount", "items": [...], "created_at" }
       Status: 201 Created
       Side effect: Clears user's cart, deducts stock from products

GET    /api/orders/  [Authenticated]
       Query params: ?page=1, ?status=pending
       Response: Paginated list of user's orders
       Status: 200 OK

GET    /api/orders/:id/  [Authenticated]
       Response: Full order detail (user can only view their own)
       Status: 200 OK
       Error: 403 Forbidden if user != order.user
```

### 4.5 Admin Panel (Django Admin)

```
URL: /admin/
Login: Super user credentials

Sections:
├── Products
│   └── Add/edit/delete products, upload images, manage stock, set active/inactive
├── Categories
│   └── Add/edit/delete categories
├── Orders
│   └── View orders, update status, view customer details
└── Users
    └── View registered users, view activity/orders
```

---

## 5. Authentication & Security

### 5.1 JWT Authentication Flow

1. **Registration:** 
   - User submits email, username, password, name
   - Backend creates User record
   - Returns access token (15 min lifetime) + refresh token (7 days)

2. **Login:**
   - User submits email + password
   - Backend validates credentials
   - Returns access + refresh tokens

3. **API Calls:**
   - React includes `Authorization: Bearer <access_token>` header
   - All authenticated endpoints verify token validity

4. **Token Refresh:**
   - When access token expires (15 min), React calls `/api/auth/refresh/`
   - Backend returns new access token using refresh token
   - Refresh token lasts 7 days (user must login again after 7 days)

### 5.2 Security Measures

- **Password Hashing:** PBKDF2 (Django's default, industry standard)
- **CSRF Protection:** Enabled on all Django endpoints
- **CORS:** Configured to allow only `http://localhost:5173` (dev) and later `https://your-netlify-domain.netlify.app` (prod)
- **JWT Signing:** Tokens signed with `SECRET_KEY` (environment variable)
- **Rate Limiting:** Implemented on login endpoint (prevent brute-force)
- **Sensitive Data:** Passwords, tokens never logged
- **HTTPS:** Required in production (handled by Render)

### 5.3 Environment Variables (.env)

```
DEBUG=True                              # False in production
SECRET_KEY=<your-secret-key>           # Generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3      # SQLite for local dev
CORS_ALLOWED_ORIGINS=http://localhost:5173

JWT_SECRET_KEY=<your-jwt-secret>       # Can be same as SECRET_KEY
JWT_ACCESS_TOKEN_LIFETIME=15           # minutes
JWT_REFRESH_TOKEN_LIFETIME=7           # days
```

---

## 6. Django Admin Panel Features

### 6.1 Product Management

- **Create Product:** Name, slug (auto-fill from name), description, price, category, stock, image upload
- **Edit Product:** All fields editable
- **Delete Product:** Hard delete or soft delete (toggle is_active)
- **Bulk Actions:** Update stock, deactivate multiple products
- **Search:** By name, description, category
- **Filter:** By category, active/inactive status, stock level
- **Image Preview:** Thumbnail shown in list view

### 6.2 Category Management

- **Create Category:** Name, slug (auto-fill), description, optional icon
- **Edit/Delete:** Full CRUD

### 6.3 Order Management

- **View Orders:** List of all orders with customer, total, status, date
- **Update Status:** Dropdown to change status (pending → processing → shipped → delivered)
- **View Details:** Shipping address, customer email, order items, total
- **Read-only:** Order number, user, created_at

### 6.4 User Management

- **View Users:** List with email, registration date
- **View Activity:** Orders, last login
- **Note:** Deactivate/activate feature NOT included per user feedback

---

## 7. Local Development Setup

### 7.1 Prerequisites

- Python 3.10+ installed
- pip (Python package manager)
- SQLite (included with Python)
- Git

### 7.2 Initial Setup Commands

```bash
# 1. Clone repository
git clone <repo-url>
cd legalizedreams_backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file (copy from .env.example)
cp .env.example .env

# 5. Run migrations
python manage.py migrate

# 6. Create super user (for admin panel)
python manage.py createsuperuser
# Prompts: Username, Email, Password (x2)

# 7. Seed initial data (products, categories)
python manage.py loaddata initial_data.json  # If fixture provided
# OR manually add via admin panel

# 8. Start dev server
python manage.py runserver
# Backend available at: http://localhost:8000
```

### 7.3 Access Points

- **API Base URL:** `http://localhost:8000/api/`
- **Admin Panel:** `http://localhost:8000/admin/` (login with super user credentials)
- **React Frontend:** `http://localhost:5173/` (separate Vite dev server)

### 7.4 Daily Development Workflow

```bash
# Activate virtual environment
source venv/bin/activate

# Start backend
python manage.py runserver

# In another terminal, start React frontend
cd ../legalizedreams  # Path to React app
npm run dev

# Make changes, save — Django and React both have hot reload
```

---

## 8. Integration with React Frontend

### 8.1 API Configuration

In React, configure API base URL (e.g., `src/services/api.js`):

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

Replace mock API calls with real Django endpoints.

### 8.2 Authentication Flow (React Side)

1. **Login/Register:** POST to `/api/auth/login/` or `/api/auth/register/`
2. **Store Tokens:** Save access + refresh tokens to localStorage (or sessionStorage)
3. **Attach Headers:** Use axios/fetch interceptor to add `Authorization: Bearer <access_token>` to all requests
4. **Handle 401:** On 401 response, call `/api/auth/refresh/` to get new access token
5. **Logout:** Clear tokens from storage, redirect to login

### 8.3 Cart Integration

- Replace localStorage cart (`'lune.cart'`) with API calls to `/api/cart/`
- Cart now persists in Django database, tied to user account
- Sync on login (may need to migrate old localStorage carts if desired)

### 8.4 CORS Configuration

Backend already configured to allow `http://localhost:5173`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

No additional setup needed for local development.

---

## 9. Error Handling & Responses

### 9.1 Standard HTTP Status Codes

```
200 OK              → Successful GET, PUT
201 Created         → Successful POST (creation)
204 No Content      → Successful DELETE
400 Bad Request     → Validation error (invalid data, missing fields)
401 Unauthorized    → No token or invalid token
403 Forbidden       → Insufficient permissions (e.g., staff-only)
404 Not Found       → Resource doesn't exist
409 Conflict        → Stock unavailable, duplicate, business logic error
500 Server Error    → Server-side exception
```

### 9.2 Error Response Format

```json
{
  "detail": "Error message here",
  "errors": {
    "field_name": ["Error for this field"]
  }
}
```

### 9.3 Specific Business Logic Errors

```
409 Conflict (Stock Insufficient):
{
  "detail": "Insufficient stock for product 'Moisturizer'. Available: 5, Requested: 10"
}

400 Bad Request (Validation):
{
  "detail": "Invalid data",
  "errors": {
    "price": ["Price must be a positive number"],
    "email": ["This field is required"]
  }
}
```

---

## 10. Testing & Verification

### 10.1 Manual Testing (Before Implementation)

- [ ] Register new user via `/api/auth/register/`
- [ ] Login and verify token received
- [ ] GET `/api/products/` and verify list returned
- [ ] GET `/api/cart/` (authenticated) and verify empty cart
- [ ] POST `/api/cart/items/` and verify item added
- [ ] POST `/api/orders/` and verify order created, cart cleared
- [ ] Admin panel: Create product with image, update category, update order status

### 10.2 API Testing Tools

- **Postman:** Import API endpoints, test with tokens
- **cURL:** Command-line testing
- **React Frontend:** Integration test by using actual frontend

---

## 11. Future Enhancements (Not in MVP)

- Product reviews/ratings submission (backend)
- Payment gateway integration (Stripe, PayPal)
- Email notifications (order confirmation, shipping updates)
- Analytics dashboard
- Advanced filtering (price range, ratings, multiple categories)
- Product wishlists
- PostgreSQL for production
- Docker containerization
- CI/CD pipeline

---

## 12. Deployment (Deferred for Later)

When ready to deploy to Render:

1. Push code to GitHub
2. Create Render account and PostgreSQL database
3. Connect Render Web Service to GitHub repo
4. Set environment variables in Render (SECRET_KEY, DATABASE_URL, CORS_ALLOWED_ORIGINS)
5. Deploy — Render auto-runs migrations

Details will be documented in separate deployment guide.

---

## Summary

This design specifies a **monolithic Django REST backend** with:
- User authentication (JWT)
- Product & category management (Django Admin)
- Shopping cart (persisted in DB, per-user)
- Checkout & order creation
- Stock management
- Clean REST API for React frontend integration

The backend is designed for **local development testing first**, with a clear path to Render deployment later. All sensitive features (auth, admin panel) are professional and production-ready, while non-critical features (reviews, payments) are deferred for later enhancement.
