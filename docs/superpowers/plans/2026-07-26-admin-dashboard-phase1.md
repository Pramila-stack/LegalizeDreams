# Admin Dashboard — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A staff-only React admin dashboard (login, overview, product CRUD, category CRUD) backed by a new admin-only DRF API, so the client manages the store without Django admin.

**Architecture:** New Django app `apps/dashboard` exposes admin-only endpoints under `/api/admin/` gated by DRF `IsAdminUser`; it defines no models (operates on existing product/category/order/user models), so no migrations. A new self-contained `frontend/src/admin/` area (own auth context, API client, layout, pages) routes under `/admin/*` and stores its JWT under admin-specific localStorage keys.

**Tech Stack:** Django 4.2, DRF, SimpleJWT, django-cloudinary-storage, React 19 + Vite, react-router-dom 7, Tailwind.

## Global Constraints

- New app label: `name = 'apps.dashboard'`, `default_auto_field = 'django.db.models.BigAutoField'`. No models, no migrations.
- All admin endpoints live under `/api/admin/` and set `permission_classes = [IsAdminUser]` (DRF built-in; checks `is_staff`). No custom permission class.
- Slugs are auto-generated from `name` on **create** and left **unchanged on update** (keeps URLs stable — deliberate, not a bug).
- Admin list endpoints set `pagination_class = None` (return all rows).
- `rating` and `review_count` are read-only in the admin product serializer.
- Product `image` is required on **create**, optional on **update** (keeps existing image when no new file is sent).
- Frontend admin lives under `/admin/*`; tokens use localStorage keys `admin_access_token` / `admin_refresh_token` (never the customer `access_token`).
- Admin login posts `{email, password}` to the existing `POST /api/auth/login/`. The admin's Django **username must be their email address** (the login serializer authenticates with the email value).
- Backend tests run with Django's runner (no pytest): from `backend/`, `venv/Scripts/python manage.py test ...`. Before running any Django command, make Cloudinary creds available in the shell: `set -a; eval "$(grep -E '^CLOUDINARY_' .env)"; set +a`.
- Image-upload tests must NOT hit the network: patch `cloudinary_storage.storage.MediaCloudinaryStorage.save` and use an in-memory GIF.
- Frontend has no test runner: verify with `npm run build` (from `frontend/`) + a manual walkthrough. Do not add a test framework.
- Reuse the existing Tailwind theme (`brand-*`, `blush-*`). Do not modify the storefront or its API.

---

### Task 1: `dashboard` app scaffold + `me` and `stats` endpoints

**Files:**
- Create: `backend/apps/dashboard/__init__.py` (empty)
- Create: `backend/apps/dashboard/apps.py`
- Create: `backend/apps/dashboard/views.py`
- Create: `backend/apps/dashboard/urls.py`
- Create: `backend/apps/dashboard/tests.py`
- Modify: `backend/config/settings.py` (add `'apps.dashboard'` to `INSTALLED_APPS`)
- Modify: `backend/config/urls.py` (include `apps.dashboard.urls` at `api/admin/`)

**Interfaces:**
- Produces:
  - `GET /api/admin/me/` → `{id, username, email, is_staff, is_superuser}` (staff only).
  - `GET /api/admin/stats/` → `{products, categories, orders, users}` (ints, staff only).
  - `apps.dashboard.views.AdminMeView`, `apps.dashboard.views.AdminStatsView`.

- [ ] **Step 1: Create the app package**

Create `backend/apps/dashboard/__init__.py` (empty).

Create `backend/apps/dashboard/apps.py`:

```python
from django.apps import AppConfig


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.dashboard'
```

- [ ] **Step 2: Register the app**

In `backend/config/settings.py`, add to the `# Local apps` group of `INSTALLED_APPS`:

```python
    # Local apps
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.content',
    'apps.dashboard',
```

- [ ] **Step 3: Write the views**

Create `backend/apps/dashboard/views.py`:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from apps.products.models import Product, Category
from apps.orders.models import Order


class AdminMeView(APIView):
    """Identity of the authenticated staff user; used to guard the dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        u = request.user
        return Response({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_staff': u.is_staff,
            'is_superuser': u.is_superuser,
        })


class AdminStatsView(APIView):
    """Overview counts for the dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'products': Product.objects.count(),
            'categories': Category.objects.count(),
            'orders': Order.objects.count(),
            'users': User.objects.count(),
        })
```

- [ ] **Step 4: Wire the URLs**

Create `backend/apps/dashboard/urls.py`:

```python
from django.urls import path
from .views import AdminMeView, AdminStatsView

urlpatterns = [
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
```

In `backend/config/urls.py`, add the include after the other app includes (after the `apps.content` line, before the React catch-all):

```python
    path('api/', include('apps.content.urls')),
    path('api/admin/', include('apps.dashboard.urls')),
```

- [ ] **Step 5: Write the failing tests**

Create `backend/apps/dashboard/tests.py`:

```python
from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class AdminAuthTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')

    def test_me_denies_unauthenticated(self):
        self.assertIn(self.client.get('/api/admin/me/').status_code, (401, 403))

    def test_me_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/me/').status_code, 403)

    def test_me_returns_identity_for_staff(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/me/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['is_staff'])
        self.assertEqual(res.data['email'], 'admin@shop.com')

    def test_stats_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/stats/').status_code, 403)

    def test_stats_returns_integer_counts_for_staff(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/stats/')
        self.assertEqual(res.status_code, 200)
        for key in ('products', 'categories', 'orders', 'users'):
            self.assertIn(key, res.data)
            self.assertIsInstance(res.data[key], int)
        self.assertEqual(res.data['users'], 2)
```

- [ ] **Step 6: Run tests to verify they fail**

From `backend/`: `set -a; eval "$(grep -E '^CLOUDINARY_' .env)"; set +a`
Run: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: FAIL — endpoints 404 until URLs are wired (if you completed steps 1-4 already, the tests will instead PASS; the RED signal is the missing app/URL).

- [ ] **Step 7: Run tests to verify they pass**

Run: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add backend/apps/dashboard backend/config/settings.py backend/config/urls.py
git commit -m "feat: add dashboard app with admin me and stats endpoints"
```

---

### Task 2: Category admin CRUD

**Files:**
- Create: `backend/apps/dashboard/utils.py`
- Create: `backend/apps/dashboard/serializers.py`
- Modify: `backend/apps/dashboard/views.py` (add `AdminCategoryViewSet`)
- Modify: `backend/apps/dashboard/urls.py` (register categories route)
- Modify: `backend/apps/dashboard/tests.py` (append category tests)

**Interfaces:**
- Consumes: `IsAdminUser` gating from Task 1.
- Produces:
  - `apps.dashboard.utils.unique_slug(model, name)` → a slug string unique for `model`.
  - `AdminCategorySerializer` (fields `id, name, slug, description, created_at`; `slug` read-only, auto-set on create).
  - `AdminCategoryViewSet` at `/api/admin/categories/` (full CRUD, `IsAdminUser`, `pagination_class = None`, lookup by `id`).

- [ ] **Step 1: Write the slug helper**

Create `backend/apps/dashboard/utils.py`:

```python
from django.utils.text import slugify


def unique_slug(model, name):
    """A slugified `name` made unique for `model` by appending -2, -3, ..."""
    base = slugify(name) or 'item'
    slug = base
    n = 2
    while model.objects.filter(slug=slug).exists():
        slug = f'{base}-{n}'
        n += 1
    return slug
```

- [ ] **Step 2: Write the category serializer**

Create `backend/apps/dashboard/serializers.py`:

```python
from rest_framework import serializers
from apps.products.models import Category
from .utils import unique_slug


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Category, validated_data['name'])
        return super().create(validated_data)
```

- [ ] **Step 3: Add the category viewset**

In `backend/apps/dashboard/views.py`, add these imports at the top (alongside existing imports):

```python
from rest_framework import viewsets
from .serializers import AdminCategorySerializer
```

And append the viewset at the end of the file:

```python
class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None
```

- [ ] **Step 4: Register the category route**

Replace the contents of `backend/apps/dashboard/urls.py` with:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet

router = DefaultRouter()
router.register(r'categories', AdminCategoryViewSet, basename='admin-category')

urlpatterns = [
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
```

- [ ] **Step 5: Write the failing tests**

Append to `backend/apps/dashboard/tests.py`:

```python
from apps.products.models import Category


class AdminCategoryCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)

    def test_create_generates_slug(self):
        res = self.client.post('/api/admin/categories/', {'name': 'Home & Garden', 'description': 'x'})
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'home-garden')

    def test_slug_collision_gets_unique_suffix(self):
        self.client.post('/api/admin/categories/', {'name': 'Home & Garden'})
        res = self.client.post('/api/admin/categories/', {'name': 'Home Garden'})
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'home-garden-2')

    def test_update_keeps_slug(self):
        created = self.client.post('/api/admin/categories/', {'name': 'Old'}).data
        res = self.client.patch(f"/api/admin/categories/{created['id']}/", {'name': 'New Name'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['name'], 'New Name')
        self.assertEqual(res.data['slug'], 'old')

    def test_list_and_delete(self):
        created = self.client.post('/api/admin/categories/', {'name': 'Temp'}).data
        self.assertEqual(self.client.get('/api/admin/categories/').status_code, 200)
        res = self.client.delete(f"/api/admin/categories/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Category.objects.filter(id=created['id']).exists())

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post('/api/admin/categories/', {'name': 'X'}).status_code, 403)
```

- [ ] **Step 6: Run tests to verify they fail, then pass**

From `backend/` (with Cloudinary env exported as in Task 1):
Run: `venv/Scripts/python manage.py test apps.dashboard.tests.AdminCategoryCRUDTest -v 2`
Expected first: FAIL (route/serializer not present) if run before steps 1-4; after implementing, PASS.
Then run the full suite: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: PASS (10 tests total).

- [ ] **Step 7: Commit**

```bash
git add backend/apps/dashboard/utils.py backend/apps/dashboard/serializers.py backend/apps/dashboard/views.py backend/apps/dashboard/urls.py backend/apps/dashboard/tests.py
git commit -m "feat: add admin category CRUD endpoint with auto-slug"
```

---

### Task 3: Product admin CRUD (image upload)

**Files:**
- Modify: `backend/apps/dashboard/serializers.py` (add `AdminProductSerializer`)
- Modify: `backend/apps/dashboard/views.py` (add `AdminProductViewSet`)
- Modify: `backend/apps/dashboard/urls.py` (register products route)
- Modify: `backend/apps/dashboard/tests.py` (append product tests)

**Interfaces:**
- Consumes: `unique_slug` (Task 2), `IsAdminUser` (Task 1).
- Produces:
  - `AdminProductSerializer` (fields `id, name, slug, description, price, category, category_name, stock, image, rating, review_count, is_active, created_at`; `slug/rating/review_count/created_at` read-only; `image` required on create, optional on update).
  - `AdminProductViewSet` at `/api/admin/products/` (full CRUD, multipart upload, `IsAdminUser`, `pagination_class = None`).

- [ ] **Step 1: Add the product serializer**

In `backend/apps/dashboard/serializers.py`, update the import line and append the serializer:

```python
from apps.products.models import Category, Product
```

```python
class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'category',
                  'category_name', 'stock', 'image', 'rating', 'review_count',
                  'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'rating', 'review_count', 'created_at']

    def validate(self, attrs):
        if self.instance is None and not attrs.get('image'):
            raise serializers.ValidationError({'image': 'An image is required when creating a product.'})
        return attrs

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Product, validated_data['name'])
        return super().create(validated_data)
```

- [ ] **Step 2: Add the product viewset**

In `backend/apps/dashboard/views.py`, add imports (alongside existing):

```python
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import AdminProductSerializer
```

Append the viewset:

```python
class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
```

- [ ] **Step 3: Register the product route**

In `backend/apps/dashboard/urls.py`, update the import and add the registration:

```python
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet, AdminProductViewSet
```

```python
router.register(r'products', AdminProductViewSet, basename='admin-product')
```

- [ ] **Step 4: Write the failing tests**

Append to `backend/apps/dashboard/tests.py`:

```python
from unittest import mock
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.products.models import Product
from apps.orders.models import Order, OrderItem

# Minimal valid 1x1 GIF so DRF's ImageField (Pillow) accepts it.
TINY_GIF = (b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!'
            b'\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')


def _gif():
    return SimpleUploadedFile('p.gif', TINY_GIF, content_type='image/gif')


class AdminProductCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)
        self.category = Category.objects.create(name='Cat', slug='cat')

    def _create(self, name='Cool Shirt', **extra):
        data = {'name': name, 'description': 'nice', 'price': '19.99',
                'stock': '5', 'category': str(self.category.id), 'image': _gif()}
        data.update(extra)
        return self.client.post('/api/admin/products/', data, format='multipart')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_create_generates_slug_and_category_name(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        res = self._create()
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'cool-shirt')
        self.assertEqual(res.data['category_name'], 'Cat')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_duplicate_name_gets_unique_slug(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        self._create(name='Shirt')
        res = self._create(name='Shirt')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['slug'], 'shirt-2')

    def test_create_requires_image(self):
        res = self.client.post('/api/admin/products/', {
            'name': 'No Image', 'description': 'x', 'price': '5.00', 'stock': '1',
            'category': str(self.category.id),
        }, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn('image', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_update_without_image_keeps_slug_and_edits_fields(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(name='Editable').data
        res = self.client.patch(f"/api/admin/products/{created['id']}/", {'price': '12.50'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['price'], '12.50')
        self.assertEqual(res.data['slug'], 'editable')

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_delete_preserves_order_history(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(name='Sold').data
        prod = Product.objects.get(id=created['id'])
        order = Order.objects.create(
            user=self.staff, order_number='ORD1', total_amount='19.99',
            shipping_address='a', city='c', postal_code='1', country='x',
            customer_email='c@x.com')
        item = OrderItem.objects.create(order=order, product=prod, quantity=1, price_at_purchase='19.99')
        res = self.client.delete(f"/api/admin/products/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        item.refresh_from_db()
        self.assertIsNone(item.product_id)
        self.assertEqual(str(item.price_at_purchase), '19.99')

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/products/').status_code, 403)
```

- [ ] **Step 5: Run tests to verify they fail, then pass**

From `backend/` (Cloudinary env exported):
Run: `venv/Scripts/python manage.py test apps.dashboard.tests.AdminProductCRUDTest -v 2`
Expected: FAIL before implementing (route/serializer missing); PASS after.
Then full suite: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: PASS (16 tests total).

- [ ] **Step 6: Commit**

```bash
git add backend/apps/dashboard/serializers.py backend/apps/dashboard/views.py backend/apps/dashboard/urls.py backend/apps/dashboard/tests.py
git commit -m "feat: add admin product CRUD endpoint with image upload"
```

---

### Task 4: Frontend admin auth shell (API client, context, guard, login, layout, dashboard)

**Files:**
- Create: `frontend/src/admin/adminApi.js`
- Create: `frontend/src/admin/AdminAuthContext.jsx`
- Create: `frontend/src/admin/RequireAdmin.jsx`
- Create: `frontend/src/admin/AdminLayout.jsx`
- Create: `frontend/src/admin/pages/AdminLogin.jsx`
- Create: `frontend/src/admin/pages/Dashboard.jsx`
- Modify: `frontend/src/App.jsx` (add admin routes + provider)

**Interfaces:**
- Consumes: `/api/admin/me/`, `/api/admin/stats/`, `/api/auth/login/`.
- Produces:
  - `adminApi` object (methods: `login`, `getMe`, `getStats`, `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`) + token helpers `getAdminToken`, `setAdminTokens`, `clearAdminTokens`.
  - `AdminAuthProvider` + `useAdminAuth()` returning `{admin, loading, login(email,password), logout()}`.
  - `RequireAdmin` guard, `AdminLayout` (renders `<Outlet/>`).

- [ ] **Step 1: Write the admin API client**

Create `frontend/src/admin/adminApi.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const TOKEN_KEY = 'admin_access_token'
const REFRESH_KEY = 'admin_refresh_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminTokens({ access, refresh }) {
  if (access) localStorage.setItem(TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearAdminTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getAdminToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let payload
  if (body && isForm) {
    payload = body
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload })
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    let message = data?.detail || data?.error
    if (!message && data && typeof data === 'object') {
      message = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ')
    }
    const err = new Error(message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const adminApi = {
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.detail || data?.non_field_errors?.[0] || 'Invalid email or password.')
    return data
  },
  getMe: () => request('/admin/me/'),
  getStats: () => request('/admin/stats/'),
  listCategories: () => request('/admin/categories/'),
  createCategory: (body) => request('/admin/categories/', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/admin/categories/${id}/`, { method: 'PATCH', body }),
  deleteCategory: (id) => request(`/admin/categories/${id}/`, { method: 'DELETE' }),
  listProducts: () => request('/admin/products/'),
  getProduct: (id) => request(`/admin/products/${id}/`),
  createProduct: (formData) => request('/admin/products/', { method: 'POST', body: formData, isForm: true }),
  updateProduct: (id, formData) => request(`/admin/products/${id}/`, { method: 'PATCH', body: formData, isForm: true }),
  deleteProduct: (id) => request(`/admin/products/${id}/`, { method: 'DELETE' }),
}
```

- [ ] **Step 2: Write the auth context**

Create `frontend/src/admin/AdminAuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { adminApi, setAdminTokens, clearAdminTokens, getAdminToken } from './adminApi'

const AdminAuthContext = createContext(null)

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function verify() {
      if (!getAdminToken()) {
        if (active) setLoading(false)
        return
      }
      try {
        const me = await adminApi.getMe()
        if (active) setAdmin(me)
      } catch {
        clearAdminTokens()
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    verify()
    return () => { active = false }
  }, [])

  const login = useCallback(async (email, password) => {
    const tokens = await adminApi.login(email, password)
    setAdminTokens(tokens)
    try {
      const me = await adminApi.getMe()
      setAdmin(me)
      return me
    } catch {
      clearAdminTokens()
      setAdmin(null)
      throw new Error('This account is not an admin.')
    }
  }, [])

  const logout = useCallback(() => {
    clearAdminTokens()
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
```

- [ ] **Step 3: Write the route guard**

Create `frontend/src/admin/RequireAdmin.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return <div className="p-8 text-center text-brand-600">Loading…</div>
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}
```

- [ ] **Step 4: Write the layout**

Create `frontend/src/admin/AdminLayout.jsx`:

```jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
]

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 bg-brand-900 text-white flex flex-col">
        <div className="px-6 py-5 text-lg font-semibold">Legalize Dreams</div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-sm">
          <div className="px-3 py-1 text-white/60 truncate">{admin?.email || admin?.username}</div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Write the login page**

Create `frontend/src/admin/pages/AdminLogin.jsx`:

```jsx
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../AdminAuthContext'

export default function AdminLogin() {
  const { admin, login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (admin) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-brand-900">Admin sign in</h1>
        <p className="mt-1 text-sm text-gray-500">Staff access only.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <label className="mt-5 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Write the dashboard page**

Create `frontend/src/admin/pages/Dashboard.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../adminApi'

const CARDS = [
  { key: 'products', label: 'Products', to: '/admin/products' },
  { key: 'categories', label: 'Categories', to: '/admin/categories' },
  { key: 'orders', label: 'Orders', to: null },
  { key: 'users', label: 'Users', to: null },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.getStats().then(setStats).catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">Dashboard</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => {
          const value = stats ? stats[c.key] : '—'
          const inner = (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-3xl font-semibold text-brand-900">{value}</div>
              <div className="mt-1 text-sm text-gray-500">{c.label}</div>
            </div>
          )
          return c.to ? <Link key={c.key} to={c.to}>{inner}</Link> : <div key={c.key}>{inner}</div>
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Wire admin routes into App.jsx**

In `frontend/src/App.jsx`:

Add `Outlet` to the react-router import and add the admin imports below the existing page imports:

```jsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
```

```jsx
import { AdminAuthProvider } from './admin/AdminAuthContext'
import RequireAdmin from './admin/RequireAdmin'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
```

Inside `<Routes>`, add the admin route block BEFORE the storefront `<Route element={<Layout />}>`:

```jsx
          <Route path="/admin" element={<AdminAuthProvider><Outlet /></AdminAuthProvider>}>
            <Route path="login" element={<AdminLogin />} />
            <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<Dashboard />} />
            </Route>
          </Route>
```

- [ ] **Step 8: Verify the build**

From `frontend/`: `npm run build`
Expected: `✓ built` with no import/transform errors.

- [ ] **Step 9: Manual verification**

Start backend (`venv/Scripts/python manage.py runserver` from `backend/`, Cloudinary env exported) and frontend (`npm run dev`). Ensure a staff user exists whose **username is their email** (e.g. `venv/Scripts/python manage.py createsuperuser` with username = `admin@shop.com`).

1. Visit `http://localhost:5173/admin` → redirected to `/admin/login`.
2. Log in with the staff email + password → lands on `/admin`, sidebar shows Dashboard, stat cards show counts.
3. Log out → back to `/admin/login`.
4. Try a non-staff account → "This account is not an admin."

- [ ] **Step 10: Commit**

```bash
git add frontend/src/admin frontend/src/App.jsx
git commit -m "feat: add admin dashboard auth shell, login and overview"
```

---

### Task 5: Categories management page

**Files:**
- Create: `frontend/src/admin/pages/CategoriesList.jsx`
- Modify: `frontend/src/admin/AdminLayout.jsx` (add Categories nav link)
- Modify: `frontend/src/App.jsx` (add `/admin/categories` route)

**Interfaces:**
- Consumes: `adminApi.listCategories/createCategory/updateCategory/deleteCategory`.

- [ ] **Step 1: Write the categories page**

Create `frontend/src/admin/pages/CategoriesList.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { adminApi } from '../adminApi'

export default function CategoriesList() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setCategories(await adminApi.listCategories())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setName('')
    setDescription('')
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, { name, description })
      } else {
        await adminApi.createCategory({ name, description })
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description || '')
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    setError('')
    try {
      await adminApi.deleteCategory(cat.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">Categories</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">{editingId ? 'Edit category' : 'Add category'}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800">
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-brand-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.description}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(cat)} className="mr-3 text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(cat)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add the nav link**

In `frontend/src/admin/AdminLayout.jsx`, extend `NAV`:

```jsx
const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Categories' },
]
```

- [ ] **Step 3: Add the route**

In `frontend/src/App.jsx`, import the page:

```jsx
import CategoriesList from './admin/pages/CategoriesList'
```

Add inside the guarded admin routes (next to `<Route index .../>`):

```jsx
              <Route path="categories" element={<CategoriesList />} />
```

- [ ] **Step 4: Verify the build**

From `frontend/`: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Manual verification**

With backend + frontend running and logged in as staff:
1. Sidebar shows Categories; open `/admin/categories`.
2. Add a category → appears in the table with an auto slug.
3. Edit its name → row updates, slug unchanged.
4. Delete it (confirm dialog) → row removed.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/admin/pages/CategoriesList.jsx frontend/src/admin/AdminLayout.jsx frontend/src/App.jsx
git commit -m "feat: add admin categories management page"
```

---

### Task 6: Products list + add/edit/delete

**Files:**
- Create: `frontend/src/admin/pages/ProductsList.jsx`
- Create: `frontend/src/admin/pages/ProductForm.jsx`
- Modify: `frontend/src/admin/AdminLayout.jsx` (add Products nav link)
- Modify: `frontend/src/App.jsx` (add product routes)

**Interfaces:**
- Consumes: `adminApi.listProducts/getProduct/createProduct/updateProduct/deleteProduct`, `adminApi.listCategories`, `mediaUrl`.

- [ ] **Step 1: Write the products list page**

Create `frontend/src/admin/pages/ProductsList.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../adminApi'
import { mediaUrl } from '../../utils/mediaUrl'

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setProducts(await adminApi.listProducts())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(p) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await adminApi.deleteProduct(p.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">Products</h1>
        <Link to="/admin/products/new" className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800">
          Add product
        </Link>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {p.image ? (
                      <img src={mediaUrl(p.image)} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">Rs {p.price}</td>
                  <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                  <td className="px-4 py-3">{p.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/products/${p.id}/edit`} className="mr-3 text-brand-700 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write the product form (add + edit)**

Create `frontend/src/admin/pages/ProductForm.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../adminApi'
import { mediaUrl } from '../../utils/mediaUrl'

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', is_active: true })
  const [imageFile, setImageFile] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    adminApi.listCategories().then(setCategories).catch(() => {})
    if (isEdit) {
      adminApi.getProduct(id)
        .then((p) => {
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: String(p.stock),
            category: p.category || '',
            is_active: p.is_active,
          })
          setCurrentImage(p.image)
          setLoading(false)
        })
        .catch((e) => { setError(e.message); setLoading(false) })
    }
  }, [id])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('stock', form.stock)
      if (form.category) fd.append('category', form.category)
      fd.append('is_active', form.is_active)
      if (imageFile) fd.append('image', imageFile)
      if (isEdit) {
        await adminApi.updateProduct(id, fd)
      } else {
        await adminApi.createProduct(fd)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none'

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">{isEdit ? 'Edit product' : 'Add product'}</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows="4" required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Price</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Image {isEdit && <span className="text-gray-400">(leave empty to keep current)</span>}</label>
          {isEdit && currentImage && (
            <img src={mediaUrl(currentImage)} alt="current" className="my-2 h-20 w-20 rounded object-cover" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0] || null)} required={!isEdit} className="mt-1 block text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
          Active (visible in the store)
        </label>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60">
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Add the nav link**

In `frontend/src/admin/AdminLayout.jsx`, extend `NAV` (Products before Categories):

```jsx
const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
]
```

- [ ] **Step 4: Add the routes**

In `frontend/src/App.jsx`, import the pages:

```jsx
import ProductsList from './admin/pages/ProductsList'
import ProductForm from './admin/pages/ProductForm'
```

Add inside the guarded admin routes:

```jsx
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
```

- [ ] **Step 5: Verify the build**

From `frontend/`: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 6: Manual verification**

With backend + frontend running and logged in as staff (ensure at least one category exists):
1. Sidebar shows Products; open `/admin/products`.
2. Add product → fill fields, choose category, upload an image, submit → returns to list, product visible with thumbnail; confirm it also appears on the storefront.
3. Edit the product (change price, no new image) → saves, image preserved.
4. Toggle Active off → product hidden from storefront (still listed in admin).
5. Delete a product (confirm) → removed from list.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/admin/pages/ProductsList.jsx frontend/src/admin/pages/ProductForm.jsx frontend/src/admin/AdminLayout.jsx frontend/src/App.jsx
git commit -m "feat: add admin products list and add/edit/delete form"
```

---

## Self-Review Notes

- **Spec coverage:** staff-only auth (`IsAdminUser` on every endpoint; `me` guard — Tasks 1/4), dashboard overview (`stats` + Dashboard — Tasks 1/4), product CRUD incl. image upload (Task 3 backend, Task 6 frontend), category CRUD (Task 2 backend, Task 5 frontend), auto-slug + fixed-on-update (Tasks 2/3), delete preserves orders (Task 3 test), separate admin session (Task 4 token keys), `/admin/*` routing without collision (Task 4). All spec sections map to a task.
- **Type/name consistency:** response shapes (`me`, `stats`, product/category fields) are used identically across backend serializers and `adminApi` methods; `adminApi` method names match their usages in every page; `AdminAuthProvider`/`useAdminAuth`/`RequireAdmin`/`AdminLayout` names are consistent across Task 4 and their imports in Tasks 5-6.
- **Login field:** frontend posts `{email, password}` to `/api/auth/login/`, matching `UserLoginSerializer`; the manual-verification steps note the admin's username must equal their email.
- **Offline image tests:** product tests patch `MediaCloudinaryStorage.save` and use an in-memory GIF, so no Cloudinary network call; `.url` generation still works from `CLOUDINARY_*` env.
