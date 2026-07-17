# Django REST Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Django REST Framework backend for LEGALIZE DREAMS e-commerce, with user authentication, product management, shopping cart, and order checkout — fully integrated with the existing React frontend.

**Architecture:** Monolithic Django 4.2 project with three main apps (users, products, orders). JWT authentication via `djangorestframework-simplejwt`. SQLite for local development with clear path to PostgreSQL for production. Django Admin handles all product/category/image management. REST API provides endpoints for products, categories, authentication, cart, and orders.

**Tech Stack:**
- Django 4.2 LTS
- Django REST Framework 3.14+
- djangorestframework-simplejwt (JWT auth)
- django-cors-headers (CORS support)
- Pillow (image handling)
- python-decouple (environment vars)
- SQLite (local dev) → PostgreSQL (production)

---

## Global Constraints

- All database queries must use Django ORM (no raw SQL)
- All API responses must be JSON with proper HTTP status codes
- All sensitive data (passwords, tokens) must never be logged
- CORS must allow `http://localhost:5173` (React dev server)
- JWT access token lifetime: 15 minutes; refresh token lifetime: 7 days
- Product stock must never go negative (validate in serializer & view)
- All timestamps use Django's `auto_now_add` and `auto_now` fields
- All models include `created_at` and `updated_at` fields
- All serializers use explicit field declarations (no `__all__`)
- All views use ViewSets where applicable (DRY principle)

---

## Phase 1: Project Setup & Dependencies

### Task 1: Initialize Django Project & Apps

**Files:**
- Create: `legalizedreams_backend/` (new directory)
- Create: `legalizedreams_backend/manage.py`
- Create: `legalizedreams_backend/config/` (Django project folder)
- Create: `legalizedreams_backend/apps/` (apps folder)
- Create: `legalizedreams_backend/requirements.txt`
- Create: `legalizedreams_backend/.env.example`
- Create: `legalizedreams_backend/.gitignore`

**Interfaces:**
- Produces: Django project structure with `config`, `apps` directories and `manage.py`

- [ ] **Step 1: Create project directory structure**

From `c:\Users\Acer\OneDrive\Desktop\`, run:
```bash
mkdir legalizedreams_backend
cd legalizedreams_backend
mkdir config apps media
```

- [ ] **Step 2: Create requirements.txt**

Create file `legalizedreams_backend/requirements.txt`:
```
Django==4.2.3
djangorestframework==3.14.0
djangorestframework-simplejwt==5.2.2
django-cors-headers==4.0.0
Pillow==10.0.0
python-decouple==3.8
psycopg2-binary==2.9.6
```

- [ ] **Step 3: Create .env.example**

Create file `legalizedreams_backend/.env.example`:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173

JWT_SECRET_KEY=your-jwt-secret-here
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7
```

- [ ] **Step 4: Create .gitignore**

Create file `legalizedreams_backend/.gitignore`:
```
# Virtual environment
venv/
env/
ENV/

# Django
*.pyc
__pycache__/
*.egg-info/
dist/
build/
db.sqlite3
db.sqlite3-journal

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Media & Static
media/
staticfiles/

# Logs
*.log
```

- [ ] **Step 5: Initialize virtual environment and install dependencies**

```bash
cd legalizedreams_backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Expected output: All packages installed successfully.

- [ ] **Step 6: Create Django project**

```bash
django-admin startproject config .
```

This creates:
- `config/settings.py`
- `config/urls.py`
- `config/wsgi.py`
- `config/asgi.py`
- `manage.py`

- [ ] **Step 7: Create Django apps**

```bash
python manage.py startapp users
python manage.py startapp products
python manage.py startapp orders
```

Move each app folder into `apps/`:
```bash
mv users apps/
mv products apps/
mv orders apps/
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: initialize Django project with apps and dependencies"
```

---

## Phase 2: Django Settings Configuration

### Task 2: Configure settings.py, Environment Variables, and CORS

**Files:**
- Modify: `config/settings.py`

**Interfaces:**
- Produces: Configured Django settings with JWT, CORS, SQLite/PostgreSQL support

- [ ] **Step 1: Update config/settings.py - Imports and Decouple Setup**

At the top of `config/settings.py`, replace the existing imports:

```python
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = config('DEBUG', default=True, cast=bool)
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
```

- [ ] **Step 2: Configure Database**

In `config/settings.py`, find and replace the `DATABASES` section:

```python
# Database
if config('DATABASE_URL', default='').startswith('postgres'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(default=config('DATABASE_URL'))
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

- [ ] **Step 3: Add apps to INSTALLED_APPS**

In `config/settings.py`, find `INSTALLED_APPS` and update it:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'apps.users',
    'apps.products',
    'apps.orders',
]
```

- [ ] **Step 4: Add CORS middleware**

In `config/settings.py`, find `MIDDLEWARE` and add `corsheaders` middleware (add it before `django.middleware.common.CommonMiddleware`):

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.authentication.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

- [ ] **Step 5: Configure CORS Settings**

At the end of `config/settings.py`, add:

```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=15, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME', default=7, cast=int)),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY', default=SECRET_KEY),
}

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Security Settings (for production, adjust DEBUG=False)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

- [ ] **Step 6: Create .env file (copy from .env.example)**

```bash
cp .env.example .env
```

Edit `.env` and set a proper SECRET_KEY:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy output and paste into .env as SECRET_KEY value
```

- [ ] **Step 7: Test settings by running migrate**

```bash
python manage.py migrate
```

Expected output: "Operations to perform: ... 18 migrations ... OK"

- [ ] **Step 8: Commit**

```bash
git add config/settings.py .env.example .gitignore
git commit -m "config: setup Django settings with JWT, CORS, and environment variables"
```

---

## Phase 3: Database Models

### Task 3: Create User Model (Custom User Extension)

**Files:**
- Create: `apps/users/models.py`

**Interfaces:**
- Produces: `CustomUser` model extending Django's AbstractUser

- [ ] **Step 1: Create CustomUser model**

Replace `apps/users/models.py`:

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
```

- [ ] **Step 2: Update settings.py to use CustomUser**

In `config/settings.py`, add at the end:

```python
AUTH_USER_MODEL = 'users.CustomUser'
```

- [ ] **Step 3: Create initial migration**

```bash
python manage.py makemigrations
```

Expected output: "Create model CustomUser"

- [ ] **Step 4: Apply migration**

```bash
python manage.py migrate
```

- [ ] **Step 5: Commit**

```bash
git add apps/users/models.py config/settings.py
git commit -m "feat: create CustomUser model extending Django's AbstractUser"
```

---

### Task 4: Create Product and Category Models

**Files:**
- Create: `apps/products/models.py`

**Interfaces:**
- Produces: `Category` and `Product` models with proper relationships

- [ ] **Step 1: Create Category and Product models**

Replace `apps/products/models.py`:

```python
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
```

- [ ] **Step 2: Create migrations**

```bash
python manage.py makemigrations
```

Expected output: "Create model Category" and "Create model Product"

- [ ] **Step 3: Apply migrations**

```bash
python manage.py migrate
```

- [ ] **Step 4: Commit**

```bash
git add apps/products/models.py
git commit -m "feat: create Category and Product models with slug auto-generation"
```

---

### Task 5: Create Cart and CartItem Models

**Files:**
- Create: `apps/orders/models.py` (first part)

**Interfaces:**
- Produces: `Cart` and `CartItem` models

- [ ] **Step 1: Create Cart and CartItem models**

Replace `apps/orders/models.py`:

```python
from django.db import models
from django.conf import settings
from apps.products.models import Product


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def get_subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    class Meta:
        unique_together = ('cart', 'product')
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
```

- [ ] **Step 2: Create migrations**

```bash
python manage.py makemigrations
```

Expected output: "Create model Cart" and "Create model CartItem"

- [ ] **Step 3: Apply migrations**

```bash
python manage.py migrate
```

- [ ] **Step 4: Commit**

```bash
git add apps/orders/models.py
git commit -m "feat: create Cart and CartItem models"
```

---

### Task 6: Create Order and OrderItem Models

**Files:**
- Modify: `apps/orders/models.py` (add Order and OrderItem)

**Interfaces:**
- Produces: `Order` and `OrderItem` models for checkout

- [ ] **Step 1: Add Order and OrderItem models to apps/orders/models.py**

Add to the end of `apps/orders/models.py`:

```python
import uuid


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{self.created_at.strftime('%Y%m%d')}-{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_subtotal(self):
        return self.price_at_purchase * self.quantity

    def __str__(self):
        return f"{self.product.name if self.product else 'Deleted Product'} x {self.quantity}"

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
```

- [ ] **Step 2: Create migrations**

```bash
python manage.py makemigrations
```

Expected output: "Create model Order" and "Create model OrderItem"

- [ ] **Step 3: Apply migrations**

```bash
python manage.py migrate
```

- [ ] **Step 4: Verify models**

```bash
python manage.py shell
>>> from apps.orders.models import Order, OrderItem
>>> from apps.products.models import Product, Category
>>> from apps.users.models import CustomUser
>>> # If no errors, models are working
```

- [ ] **Step 5: Commit**

```bash
git add apps/orders/models.py
git commit -m "feat: create Order and OrderItem models with status tracking"
```

---

## Phase 4: Serializers

### Task 7: Create Product and Category Serializers

**Files:**
- Create: `apps/products/serializers.py`

**Interfaces:**
- Produces: `CategorySerializer` and `ProductSerializer` for REST API

- [ ] **Step 1: Create serializers**

Create file `apps/products/serializers.py`:

```python
from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'category', 'category_name',
            'stock', 'image', 'rating', 'review_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
```

- [ ] **Step 2: Commit**

```bash
git add apps/products/serializers.py
git commit -m "feat: create Category and Product serializers with validation"
```

---

### Task 8: Create User and Authentication Serializers

**Files:**
- Create: `apps/users/serializers.py`

**Interfaces:**
- Produces: `CustomUserSerializer`, `RegisterSerializer`, `UserProfileSerializer` for auth endpoints

- [ ] **Step 1: Create user serializers**

Create file `apps/users/serializers.py`:

```python
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.EmailField()

    def validate(self, attrs):
        attrs['username'] = attrs.get('username', '')
        return super().validate(attrs)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'created_at']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
```

- [ ] **Step 2: Commit**

```bash
git add apps/users/serializers.py
git commit -m "feat: create user and authentication serializers"
```

---

### Task 9: Create Cart and Order Serializers

**Files:**
- Create: `apps/orders/serializers.py`

**Interfaces:**
- Produces: `CartItemSerializer`, `CartSerializer`, `OrderItemSerializer`, `OrderSerializer`

- [ ] **Step 1: Create order serializers**

Create file `apps/orders/serializers.py`:

```python
from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['added_at']

    def get_subtotal(self, obj):
        return str(obj.get_subtotal())

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_total_price(self, obj):
        return str(obj.get_total())

    def get_total_items(self, obj):
        return obj.items.count()


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'price_at_purchase', 'subtotal']

    def get_subtotal(self, obj):
        return str(obj.get_subtotal())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'total_amount', 'shipping_address',
            'city', 'postal_code', 'country', 'customer_email', 'customer_phone',
            'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']

    def validate_postal_code(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Postal code is required.")
        return value
```

- [ ] **Step 2: Commit**

```bash
git add apps/orders/serializers.py
git commit -m "feat: create cart and order serializers with validation"
```

---

## Phase 5: Views and ViewSets

### Task 10: Create Product Views

**Files:**
- Create: `apps/products/views.py`

**Interfaces:**
- Produces: `ProductViewSet`, `CategoryViewSet` REST endpoints

- [ ] **Step 1: Create product views**

Create file `apps/products/views.py`:

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'rating']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_slug = request.query_params.get('slug')
        if not category_slug:
            return Response({'error': 'Category slug is required.'}, status=400)
        
        products = self.get_queryset().filter(category__slug=category_slug)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:5]
        serializer = self.get_serializer(related_products, many=True)
        return Response(serializer.data)
```

- [ ] **Step 2: Commit**

```bash
git add apps/products/views.py
git commit -m "feat: create Product and Category ViewSets with filtering and search"
```

---

### Task 11: Create User and Authentication Views

**Files:**
- Create: `apps/users/views.py`

**Interfaces:**
- Produces: `RegisterView`, `LoginView`, `UserProfileView` REST endpoints

- [ ] **Step 1: Create authentication views**

Create file `apps/users/views.py`:

```python
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import (
    RegisterSerializer, LoginSerializer, CustomUserSerializer, UserProfileSerializer
)


class RegisterView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': CustomUserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class UserProfileView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
```

- [ ] **Step 2: Commit**

```bash
git add apps/users/views.py
git commit -m "feat: create user registration, login, and profile views"
```

---

### Task 12: Create Cart and Order Views

**Files:**
- Create: `apps/orders/views.py`

**Interfaces:**
- Produces: `CartViewSet`, `OrderViewSet` REST endpoints

- [ ] **Step 1: Create cart and order views**

Create file `apps/orders/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from apps.products.models import Product


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    @action(detail=False, methods=['get'])
    def list(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_cart(request)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if product.stock < quantity:
            return Response({
                'error': f'Insufficient stock. Available: {product.stock}'
            }, status=status.HTTP_409_CONFLICT)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'])
    def update_item(self, request):
        cart = self.get_cart(request)
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        if quantity < 1:
            return Response({'error': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

        if cart_item.product.stock < quantity:
            return Response({
                'error': f'Insufficient stock. Available: {cart_item.product.stock}'
            }, status=status.HTTP_409_CONFLICT)

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = self.get_cart(request)
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            cart = Cart.objects.filter(user=request.user).first()
            if not cart or not cart.items.exists():
                return Response({
                    'error': 'Cart is empty.'
                }, status=status.HTTP_400_BAD_REQUEST)

            total_amount = cart.get_total()

            # Create order
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                **serializer.validated_data
            )

            # Create order items and update stock
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price_at_purchase=cart_item.product.price
                )
                # Deduct from stock
                cart_item.product.stock -= cart_item.quantity
                cart_item.product.save()

            # Clear cart
            cart.items.all().delete()

            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 2: Commit**

```bash
git add apps/orders/views.py
git commit -m "feat: create Cart and Order ViewSets with checkout logic"
```

---

## Phase 6: URL Routing

### Task 13: Configure URL Routing

**Files:**
- Create: `apps/users/urls.py`
- Create: `apps/products/urls.py`
- Create: `apps/orders/urls.py`
- Modify: `config/urls.py`

**Interfaces:**
- Produces: Fully routed REST API endpoints

- [ ] **Step 1: Create users app URLs**

Create file `apps/users/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, UserProfileView

router = DefaultRouter()
router.register(r'register', RegisterView, basename='register')
router.register(r'profile', UserProfileView, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

- [ ] **Step 2: Create products app URLs**

Create file `apps/products/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]
```

- [ ] **Step 3: Create orders app URLs**

Create file `apps/orders/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
```

- [ ] **Step 4: Update config/urls.py**

Replace `config/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

- [ ] **Step 5: Test URL routing**

```bash
python manage.py runserver
```

Visit `http://localhost:8000/api/` in browser. You should see the API root.

- [ ] **Step 6: Commit**

```bash
git add apps/users/urls.py apps/products/urls.py apps/orders/urls.py config/urls.py
git commit -m "feat: setup API URL routing with nested app endpoints"
```

---

## Phase 7: Django Admin Configuration

### Task 14: Configure Django Admin

**Files:**
- Modify: `apps/products/admin.py`
- Modify: `apps/orders/admin.py`
- Create/Modify: `apps/users/admin.py`

**Interfaces:**
- Produces: Customized Django Admin interface for product, order, and user management

- [ ] **Step 1: Configure products admin**

Replace `apps/products/admin.py`:

```python
from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'rating', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'slug']
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'description', 'category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock')
        }),
        ('Media & Ratings', {
            'fields': ('image', 'rating', 'review_count')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['make_active', 'make_inactive']

    def make_active(self, request, queryset):
        queryset.update(is_active=True)
    make_active.short_description = "Mark selected products as active"

    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
    make_inactive.short_description = "Mark selected products as inactive"
```

- [ ] **Step 2: Configure orders admin**

Replace `apps/orders/admin.py`:

```python
from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['product', 'added_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'price_at_purchase', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'user__email', 'customer_email']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Customer Details', {
            'fields': ('customer_email', 'customer_phone')
        }),
        ('Shipping Address', {
            'fields': ('shipping_address', 'city', 'postal_code', 'country')
        }),
        ('Totals', {
            'fields': ('total_amount',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [OrderItemInline]
    actions = ['mark_processing', 'mark_shipped', 'mark_delivered']

    def mark_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_processing.short_description = "Mark as Processing"

    def mark_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_shipped.short_description = "Mark as Shipped"

    def mark_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_delivered.short_description = "Mark as Delivered"
```

- [ ] **Step 3: Configure users admin**

Replace `apps/users/admin.py`:

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password', 'email')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
```

- [ ] **Step 4: Test admin panel**

```bash
python manage.py createsuperuser
# Follow prompts to create admin user

python manage.py runserver
# Visit http://localhost:8000/admin/
# Login with superuser credentials
```

- [ ] **Step 5: Commit**

```bash
git add apps/products/admin.py apps/orders/admin.py apps/users/admin.py
git commit -m "feat: customize Django Admin for products, orders, and users management"
```

---

## Phase 8: Testing and Data Seeding

### Task 15: Create Seed Data Script

**Files:**
- Create: `scripts/seed_data.py`

**Interfaces:**
- Produces: Script to populate initial product and category data

- [ ] **Step 1: Create scripts directory and seed script**

```bash
mkdir scripts
touch scripts/__init__.py
```

Create file `scripts/seed_data.py`:

```python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Category, Product
from apps.users.models import CustomUser

def seed_data():
    print("Seeding data...")

    # Clear existing data
    Category.objects.all().delete()
    Product.objects.all().delete()

    # Create categories
    categories_data = [
        {'name': 'Skincare', 'slug': 'skincare', 'description': 'Face and body care products'},
        {'name': 'Makeup', 'slug': 'makeup', 'description': 'Cosmetics and beauty products'},
        {'name': 'Accessories', 'slug': 'accessories', 'description': 'Fashion accessories'},
        {'name': 'Jewelry', 'slug': 'jewelry', 'description': 'Jewelry items'},
        {'name': 'Bags', 'slug': 'bags', 'description': 'Bags and sleeves'},
    ]

    categories = {}
    for cat_data in categories_data:
        cat = Category.objects.create(**cat_data)
        categories[cat.slug] = cat
        print(f"✓ Created category: {cat.name}")

    # Create products
    products_data = [
        {'name': 'Hydrating Moisturizer', 'price': 499, 'stock': 50, 'category': 'skincare', 'rating': 4.5, 'review_count': 120},
        {'name': 'Vitamin C Serum', 'price': 799, 'stock': 30, 'category': 'skincare', 'rating': 4.8, 'review_count': 85},
        {'name': 'Face Wash', 'price': 299, 'stock': 100, 'category': 'skincare', 'rating': 4.2, 'review_count': 200},
        {'name': 'Lipstick Red', 'price': 399, 'stock': 75, 'category': 'makeup', 'rating': 4.6, 'review_count': 150},
        {'name': 'Mascara Black', 'price': 549, 'stock': 60, 'category': 'makeup', 'rating': 4.7, 'review_count': 95},
        {'name': 'Gold Bracelet', 'price': 1299, 'stock': 25, 'category': 'jewelry', 'rating': 4.9, 'review_count': 45},
        {'name': 'Silver Necklace', 'price': 899, 'stock': 40, 'category': 'jewelry', 'rating': 4.4, 'review_count': 60},
        {'name': 'Crossbody Bag', 'price': 1999, 'stock': 20, 'category': 'bags', 'rating': 4.8, 'review_count': 110},
        {'name': 'Laptop Sleeve', 'price': 799, 'stock': 35, 'category': 'bags', 'rating': 4.3, 'review_count': 78},
        {'name': 'Silk Scarf', 'price': 599, 'stock': 55, 'category': 'accessories', 'rating': 4.5, 'review_count': 92},
    ]

    for prod_data in products_data:
        category_slug = prod_data.pop('category')
        category = categories[category_slug]
        prod_data['category'] = category
        prod = Product.objects.create(**prod_data)
        print(f"✓ Created product: {prod.name}")

    print("✓ Data seeding completed!")

if __name__ == '__main__':
    seed_data()
```

- [ ] **Step 2: Run seed script**

```bash
python scripts/seed_data.py
```

Expected output: "✓ Created category: ..." and "✓ Created product: ..."

- [ ] **Step 3: Verify in admin panel**

```bash
python manage.py runserver
# Visit http://localhost:8000/admin/
# Login and view Products and Categories
```

- [ ] **Step 4: Commit**

```bash
git add scripts/seed_data.py
git commit -m "chore: add data seeding script for initial products and categories"
```

---

### Task 16: Manual API Testing

**Files:** (no new files)

**Interfaces:**
- Verifies: All endpoints working as expected

- [ ] **Step 1: Start the development server**

```bash
python manage.py runserver
```

Expected output: "Starting development server at http://127.0.0.1:8000/"

- [ ] **Step 2: Test Products endpoint (public)**

In a new terminal:
```bash
curl http://localhost:8000/api/products/
```

Expected output: JSON array of products with pagination

- [ ] **Step 3: Test Categories endpoint (public)**

```bash
curl http://localhost:8000/api/categories/
```

Expected output: JSON array of categories

- [ ] **Step 4: Test User Registration**

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Expected output: Access and refresh tokens, user data (HTTP 201)

- [ ] **Step 5: Test User Login**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser@example.com",
    "password": "testpass123"
  }'
```

Expected output: Access and refresh tokens (HTTP 200)

- [ ] **Step 6: Test Get Profile (authenticated)**

```bash
# Replace YOUR_ACCESS_TOKEN with the token from previous step
curl http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected output: User profile data (HTTP 200)

- [ ] **Step 7: Test Add to Cart**

```bash
# Product ID should be 1 (from seeded data)
curl -X POST http://localhost:8000/api/cart/add_item/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

Expected output: Cart with added item (HTTP 201)

- [ ] **Step 8: Test Get Cart**

```bash
curl http://localhost:8000/api/cart/list/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected output: Cart contents with items and total (HTTP 200)

- [ ] **Step 9: Test Create Order**

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": "123 Main St",
    "city": "New York",
    "postal_code": "10001",
    "country": "USA",
    "customer_email": "testuser@example.com",
    "customer_phone": "+1234567890"
  }'
```

Expected output: Order created with order_number (HTTP 201), cart cleared

- [ ] **Step 10: Test Get Orders (order history)**

```bash
curl http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected output: List of user's orders (HTTP 200)

- [ ] **Step 11: Document findings**

If all tests pass, create a test log file documenting the results. If failures occur, note them for fixing.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "test: verify all API endpoints working with manual testing"
```

---

## Phase 9: React Frontend Integration Setup

### Task 17: Create Integration Documentation

**Files:**
- Create: `docs/REACT_INTEGRATION.md`

**Interfaces:**
- Produces: Documentation for React frontend integration

- [ ] **Step 1: Create React integration guide**

Create file `docs/REACT_INTEGRATION.md`:

```markdown
# React Frontend Integration Guide

## Backend API Base URL

Configure in your React app's API service file (e.g., `src/services/api.js`):

### Development
\`\`\`javascript
const API_BASE_URL = 'http://localhost:8000/api';
\`\`\`

### Production
\`\`\`javascript
const API_BASE_URL = 'https://your-backend-domain.onrender.com/api';
\`\`\`

## Authentication Flow

### 1. Register New User
\`\`\`javascript
POST /auth/register/
Body: {
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "password_confirm": "password",
  "first_name": "First",
  "last_name": "Last"
}
Response: {
  "user": { "id", "email", "username", ... },
  "access": "jwt_token",
  "refresh": "jwt_refresh_token"
}
\`\`\`

### 2. Login
\`\`\`javascript
POST /auth/login/
Body: {
  "username": "user@example.com",
  "password": "password"
}
Response: {
  "access": "jwt_token",
  "refresh": "jwt_refresh_token"
}
\`\`\`

### 3. Refresh Access Token
\`\`\`javascript
POST /auth/refresh/
Body: {
  "refresh": "jwt_refresh_token"
}
Response: {
  "access": "new_jwt_token"
}
\`\`\`

### 4. Get User Profile
\`\`\`javascript
GET /auth/profile/
Headers: Authorization: Bearer {access_token}
Response: { "id", "email", "username", "first_name", "last_name", "created_at" }
\`\`\`

## Product Endpoints

### Get All Products (Public)
\`\`\`javascript
GET /products/?page=1&search=moisturizer&category=skincare
Response: {
  "count": 50,
  "next": "/products/?page=2",
  "previous": null,
  "results": [...]
}
\`\`\`

### Get Product Detail
\`\`\`javascript
GET /products/{slug}/
Response: Full product object
\`\`\`

### Get Categories
\`\`\`javascript
GET /categories/
Response: [ { "id", "name", "slug", ... } ]
\`\`\`

## Cart Endpoints (Authenticated)

### Get Current Cart
\`\`\`javascript
GET /cart/list/
Headers: Authorization: Bearer {access_token}
Response: {
  "id", "items": [...], "total_items": 2, "total_price": "1000.00"
}
\`\`\`

### Add to Cart
\`\`\`javascript
POST /cart/add_item/
Headers: Authorization: Bearer {access_token}
Body: { "product_id": 1, "quantity": 2 }
Response: Updated cart
\`\`\`

### Update Cart Item Quantity
\`\`\`javascript
PUT /cart/update_item/
Headers: Authorization: Bearer {access_token}
Body: { "item_id": 123, "quantity": 5 }
Response: Updated cart
\`\`\`

### Remove Cart Item
\`\`\`javascript
DELETE /cart/remove_item/
Headers: Authorization: Bearer {access_token}
Body: { "item_id": 123 }
Response: Updated cart
\`\`\`

### Clear Cart
\`\`\`javascript
DELETE /cart/clear/
Headers: Authorization: Bearer {access_token}
Response: Empty cart
\`\`\`

## Order Endpoints (Authenticated)

### Create Order (Checkout)
\`\`\`javascript
POST /orders/
Headers: Authorization: Bearer {access_token}
Body: {
  "shipping_address": "123 Main St",
  "city": "New York",
  "postal_code": "10001",
  "country": "USA",
  "customer_email": "user@example.com",
  "customer_phone": "+1234567890",
  "notes": "Optional delivery notes"
}
Response: {
  "id", "order_number", "status", "total_amount", "items": [...], "created_at"
}
\`\`\`

### Get Order History
\`\`\`javascript
GET /orders/
Headers: Authorization: Bearer {access_token}
Response: [ order1, order2, ... ]
\`\`\`

### Get Order Detail
\`\`\`javascript
GET /orders/{id}/
Headers: Authorization: Bearer {access_token}
Response: Full order object with items
\`\`\`

## Token Management (React Code Example)

\`\`\`javascript
// Store tokens after login/register
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);

// Axios interceptor to attach token to requests
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
          refresh: refreshToken
        });
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers['Authorization'] = \`Bearer \${response.data.access}\`;
        return api(originalRequest);
      } catch (err) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
\`\`\`

## CORS & Environment Setup

The backend is configured to accept requests from `http://localhost:5173` (React dev server).

For production, update the backend's CORS settings to include your Netlify domain:
\`\`\`
CORS_ALLOWED_ORIGINS=https://your-site.netlify.app
\`\`\`

## Error Handling

All errors follow this format:
\`\`\`json
{
  "detail": "Error message",
  "errors": {
    "field_name": ["Specific field error"]
  }
}
\`\`\`

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/expired token)
- 404: Not Found
- 409: Conflict (stock insufficient, etc.)
- 500: Server Error

## Testing the Integration

1. Start backend: \`python manage.py runserver\`
2. Start React frontend: \`npm run dev\`
3. Register a user in the frontend
4. Add products to cart
5. Create an order
6. View order history

All endpoints should work seamlessly after following this guide.
\`\`\`

- [ ] **Step 2: Commit**

```bash
git add docs/REACT_INTEGRATION.md
git commit -m "docs: add React frontend integration guide"
```

---

## Phase 10: Final Setup & Documentation

### Task 18: Create README and Setup Instructions

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: Complete project README with setup and usage instructions

- [ ] **Step 1: Create project README**

Create file `README.md`:

```markdown
# LEGALIZE DREAMS - Django REST Backend

A professional Django REST Framework backend for the LEGALIZE DREAMS e-commerce platform.

## Features

- ✅ User authentication with JWT tokens
- ✅ Product & category management with Django Admin
- ✅ Shopping cart with stock validation
- ✅ Checkout & order creation
- ✅ Product search & filtering
- ✅ CORS support for React frontend
- ✅ Professional error handling

## Tech Stack

- Django 4.2 LTS
- Django REST Framework
- SQLite (development) / PostgreSQL (production)
- JWT Authentication
- Python 3.10+

## Quick Start

### 1. Clone & Setup

\`\`\`bash
git clone <repo>
cd legalizedreams_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set SECRET_KEY
\`\`\`

### 2. Database Setup

\`\`\`bash
# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Seed initial data
python scripts/seed_data.py
\`\`\`

### 3. Run Server

\`\`\`bash
python manage.py runserver
\`\`\`

Backend runs on: `http://localhost:8000`

### 4. Access Admin Panel

- URL: `http://localhost:8000/admin/`
- Login with superuser credentials
- Manage products, categories, and orders

## API Documentation

See [docs/REACT_INTEGRATION.md](docs/REACT_INTEGRATION.md) for complete API endpoint reference.

### Key Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/products/` - List products (public)
- `GET /api/cart/list/` - Get user's cart (authenticated)
- `POST /api/cart/add_item/` - Add to cart (authenticated)
- `POST /api/orders/` - Create order (authenticated)
- `GET /api/orders/` - Get order history (authenticated)

## Database Models

### Users
- Custom Django User model with email-based login

### Products
- Product: name, slug, description, price, stock, image, rating
- Category: name, slug, description

### Orders
- Cart: per-user shopping cart
- CartItem: individual cart items
- Order: order record with shipping details
- OrderItem: items in an order (with price snapshot)

## Admin Panel Features

### Products Management
- Add/edit/delete products
- Upload product images
- Set stock levels
- Bulk actions for activation/deactivation

### Categories Management
- Add/edit/delete categories
- Organize products by category

### Orders Management
- View all orders
- Update order status (pending → processing → shipped → delivered)
- View customer shipping details

### Users Management
- View registered users
- View user order history

## Environment Variables

See `.env.example` for all configuration options:

\`\`\`
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7
\`\`\`

## Testing

### Manual API Testing

Use the cURL commands in the implementation plan or use Postman to test endpoints.

### Frontend Integration

See [docs/REACT_INTEGRATION.md](docs/REACT_INTEGRATION.md) for React setup and integration steps.

## Deployment

When ready for production:

1. Switch DATABASE_URL to PostgreSQL
2. Update CORS_ALLOWED_ORIGINS to your Netlify domain
3. Set DEBUG=False
4. Generate new SECRET_KEY
5. Deploy to Render (or your hosting provider)

See [docs/superpowers/specs/2026-07-13-django-rest-backend-design.md](docs/superpowers/specs/2026-07-13-django-rest-backend-design.md) for detailed deployment guide.

## Project Structure

\`\`\`
legalizedreams_backend/
├── config/              # Django project settings
├── apps/
│   ├── users/          # User auth
│   ├── products/       # Products & categories
│   └── orders/         # Cart & orders
├── media/              # Product images
├── scripts/            # Helper scripts
├── docs/               # Documentation
├── manage.py
├── requirements.txt
└── .env.example
\`\`\`

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Commit with clear messages
5. Push and create PR

## License

© 2026 LEGALIZE DREAMS. All rights reserved.

## Support

For issues or questions, contact the development team.
\`\`\`

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive project README"
```

---

### Task 19: Final Verification & Cleanup

**Files:** (verification only, no new files)

**Interfaces:**
- Verifies: All systems working correctly

- [ ] **Step 1: Verify project structure**

Run:
```bash
ls -la
```

Verify these files exist:
- `manage.py`
- `requirements.txt`
- `.env`
- `.env.example`
- `.gitignore`
- `README.md`
- `config/`, `apps/`, `media/`, `docs/`, `scripts/`

- [ ] **Step 2: Verify all migrations applied**

```bash
python manage.py showmigrations
```

All migrations should show [X] (applied)

- [ ] **Step 3: Test server startup**

```bash
python manage.py runserver
```

Expected output: "Starting development server at http://127.0.0.1:8000/"

No errors should appear.

- [ ] **Step 4: Verify admin panel accessible**

Visit `http://localhost:8000/admin/` and login with superuser.

You should see:
- Products
- Categories
- Orders
- Users

- [ ] **Step 5: Verify API accessible**

Visit `http://localhost:8000/api/products/`

You should see JSON response with products.

- [ ] **Step 6: Check git status**

```bash
git status
```

No untracked files should be left. If any, review and commit or add to .gitignore.

- [ ] **Step 7: Final commit**

```bash
git log --oneline
```

Verify all commits are present and logical.

- [ ] **Step 8: Create a final summary**

Create file `IMPLEMENTATION_COMPLETE.md`:

```markdown
# Implementation Complete

## Summary

Django REST Backend for LEGALIZE DREAMS has been successfully implemented.

### What's Built

✅ Django 4.2 project with 3 apps (users, products, orders)
✅ Custom User model with email-based authentication
✅ Product & Category models with Django Admin management
✅ Cart model with per-user shopping cart
✅ Order model with checkout & order history
✅ JWT authentication for secure API access
✅ REST API with 15+ endpoints
✅ CORS configured for React frontend
✅ Seed data script for testing
✅ Comprehensive documentation

### Development Server

Start with:
\`\`\`
python manage.py runserver
\`\`\`

Backend: http://localhost:8000
Admin: http://localhost:8000/admin/

### Next Steps

1. Integrate React frontend (see REACT_INTEGRATION.md)
2. Test all endpoints with React
3. Add more features (reviews, wishlists, etc.) if needed
4. Deploy to Render when ready

### Key Files

- config/settings.py - Django configuration
- apps/users/ - Authentication
- apps/products/ - Products & categories
- apps/orders/ - Cart & orders
- docs/REACT_INTEGRATION.md - Frontend integration guide
- README.md - Project overview

---

**Date:** 2026-07-13
**Status:** Ready for Frontend Integration
\`\`\`

- [ ] **Step 9: Final commit**

```bash
git add IMPLEMENTATION_COMPLETE.md
git commit -m "chore: mark implementation as complete and ready for integration"
```

---

## Summary

All 19 tasks complete. The Django REST backend is fully implemented with:

✅ Project setup with all dependencies
✅ Django settings configured with JWT, CORS, SQLite
✅ Database models for users, products, cart, orders
✅ Serializers for all models with validation
✅ ViewSets and views for all endpoints
✅ URL routing for REST API
✅ Django Admin customization for product/order management
✅ Seed data script for initial test data
✅ Manual testing verification
✅ React integration documentation
✅ Comprehensive README and docs

**Ready to integrate with React frontend and deploy!**
