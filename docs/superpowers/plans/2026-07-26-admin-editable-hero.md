# Admin-Editable Homepage Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a site owner manage the homepage hero videos and the "Shop New Arrivals" button from the Django admin instead of editing hardcoded frontend code.

**Architecture:** A new `apps/content` Django app stores hero config in two models (a flexible `HeroVideo` list on Cloudinary video storage + a singleton `HeroSettings` for the CTA). A single public DRF endpoint `GET /api/hero/` serves both. `Hero.jsx` fetches that endpoint on mount and falls back to the current two videos + default CTA when the API is empty or unreachable.

**Tech Stack:** Django 4.2, Django REST Framework, django-cloudinary-storage (`VideoMediaCloudinaryStorage`), React 19 + Vite, react-router-dom 7.

## Global Constraints

- Backend app label matches existing convention: `name = 'apps.content'`, `default_auto_field = 'django.db.models.BigAutoField'`.
- Hero videos MUST use `cloudinary_storage.storage.VideoMediaCloudinaryStorage` (the default `MediaCloudinaryStorage` uploads video as an image and corrupts it).
- `HeroSettings` is a singleton: exactly one row, `pk = 1`, no add/delete in admin.
- CTA defaults, copied verbatim: `cta_label = "Shop New Arrivals"`, `cta_link = "/shop"`.
- Do not change anything else in the hero (headline, subtext, "Browse Categories" button, styling, cycle timing) or any product/media code.
- Backend tests run with `python manage.py test` (Django's built-in runner — no pytest). Run backend commands from `backend/` with the venv activated.
- The frontend has no test runner; frontend verification is `npm run build` (from `frontend/`) plus a manual browser check.

---

### Task 1: `content` app — models + migration

**Files:**
- Create: `backend/apps/content/__init__.py` (empty)
- Create: `backend/apps/content/apps.py`
- Create: `backend/apps/content/models.py`
- Create: `backend/apps/content/migrations/__init__.py` (empty)
- Create: `backend/apps/content/tests.py`
- Modify: `backend/config/settings.py` (add `'apps.content'` to `INSTALLED_APPS`)

**Interfaces:**
- Produces:
  - `apps.content.models.HeroVideo` — fields `video` (FileField), `title` (str), `order` (int), `is_active` (bool), `created_at`. `Meta.ordering = ['order', 'created_at']`.
  - `apps.content.models.HeroSettings` — fields `cta_label` (str), `cta_link` (str), `updated_at`. Singleton pinned to `pk=1`. Classmethod `HeroSettings.load()` returns the single instance (creating it with defaults if absent).

- [ ] **Step 1: Create the app package and config**

Create `backend/apps/content/__init__.py` as an empty file.

Create `backend/apps/content/apps.py`:

```python
from django.apps import AppConfig


class ContentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.content'
```

Create `backend/apps/content/migrations/__init__.py` as an empty file.

- [ ] **Step 2: Register the app**

In `backend/config/settings.py`, add `'apps.content'` to the `# Local apps` group of `INSTALLED_APPS`:

```python
    # Local apps
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.content',
```

- [ ] **Step 3: Write the models**

Create `backend/apps/content/models.py`:

```python
from django.db import models
from cloudinary_storage.storage import VideoMediaCloudinaryStorage


class HeroVideo(models.Model):
    """A single autoplaying video slide on the homepage hero."""
    video = models.FileField(
        upload_to='hero/',
        storage=VideoMediaCloudinaryStorage(),
    )
    title = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title or f'Hero Video {self.pk}'


class HeroSettings(models.Model):
    """Singleton config for the hero call-to-action button."""
    cta_label = models.CharField(max_length=100, default='Shop New Arrivals')
    cta_link = models.CharField(max_length=200, default='/shop')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Hero Settings'
        verbose_name_plural = 'Hero Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return 'Homepage Hero Settings'

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
```

- [ ] **Step 4: Write the failing model tests**

Create `backend/apps/content/tests.py`:

```python
from django.test import TestCase
from apps.content.models import HeroVideo, HeroSettings


class HeroSettingsModelTest(TestCase):
    def test_load_creates_defaults(self):
        settings_obj = HeroSettings.load()
        self.assertEqual(settings_obj.pk, 1)
        self.assertEqual(settings_obj.cta_label, 'Shop New Arrivals')
        self.assertEqual(settings_obj.cta_link, '/shop')

    def test_singleton_enforced(self):
        HeroSettings.load()
        second = HeroSettings(cta_label='Other', cta_link='/other')
        second.save()
        self.assertEqual(HeroSettings.objects.count(), 1)
        self.assertEqual(HeroSettings.load().cta_label, 'Other')


class HeroVideoModelTest(TestCase):
    def test_ordering_by_order_field(self):
        HeroVideo.objects.create(video='hero/b.mp4', title='B', order=2)
        HeroVideo.objects.create(video='hero/a.mp4', title='A', order=1)
        titles = list(HeroVideo.objects.values_list('title', flat=True))
        self.assertEqual(titles, ['A', 'B'])

    def test_str_falls_back_when_no_title(self):
        video = HeroVideo.objects.create(video='hero/x.mp4', order=1)
        self.assertEqual(str(video), f'Hero Video {video.pk}')
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `python manage.py test apps.content -v 2`
Expected: FAIL — the migration does not exist yet, so the tables are missing (or an `OperationalError: no such table: content_herovideo`).

- [ ] **Step 6: Create and apply the migration**

Run: `python manage.py makemigrations content`
Expected: creates `backend/apps/content/migrations/0001_initial.py` with `HeroVideo` and `HeroSettings`.

Run: `python manage.py migrate`
Expected: applies `content.0001_initial` with no errors.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `python manage.py test apps.content -v 2`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add backend/apps/content backend/config/settings.py
git commit -m "feat: add content app with hero video and settings models"
```

---

### Task 2: Hero API endpoint

**Files:**
- Create: `backend/apps/content/serializers.py`
- Create: `backend/apps/content/views.py`
- Create: `backend/apps/content/urls.py`
- Modify: `backend/config/urls.py` (include `apps.content.urls`)
- Modify: `backend/apps/content/tests.py` (append API test class)

**Interfaces:**
- Consumes: `HeroVideo`, `HeroSettings.load()` from Task 1.
- Produces: `GET /api/hero/` (public) returning
  `{"cta": {"label": str, "link": str}, "videos": [{"id": int, "title": str, "src": str}]}`.
  `src` is `HeroVideo.video.url` (absolute Cloudinary URL). Only `is_active=True` videos are returned, ordered by the model `Meta`.

- [ ] **Step 1: Write the serializer**

Create `backend/apps/content/serializers.py`:

```python
from rest_framework import serializers
from .models import HeroVideo


class HeroVideoSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = HeroVideo
        fields = ['id', 'title', 'src']

    def get_src(self, obj):
        return obj.video.url if obj.video else None
```

- [ ] **Step 2: Write the view**

Create `backend/apps/content/views.py`:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import HeroVideo, HeroSettings
from .serializers import HeroVideoSerializer


class HeroView(APIView):
    """Public homepage hero content: CTA button + active videos."""
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = HeroSettings.load()
        videos = HeroVideo.objects.filter(is_active=True)
        return Response({
            'cta': {
                'label': settings_obj.cta_label,
                'link': settings_obj.cta_link,
            },
            'videos': HeroVideoSerializer(videos, many=True).data,
        })
```

- [ ] **Step 3: Wire the URLs**

Create `backend/apps/content/urls.py`:

```python
from django.urls import path
from .views import HeroView

urlpatterns = [
    path('hero/', HeroView.as_view(), name='hero'),
]
```

In `backend/config/urls.py`, add the include next to the other app includes (after the `apps.orders` line):

```python
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.content.urls')),
```

- [ ] **Step 4: Write the failing API test**

Append to `backend/apps/content/tests.py`:

```python
from rest_framework.test import APITestCase


class HeroAPITest(APITestCase):
    def test_returns_default_cta_and_empty_videos(self):
        response = self.client.get('/api/hero/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['cta']['label'], 'Shop New Arrivals')
        self.assertEqual(response.data['cta']['link'], '/shop')
        self.assertEqual(response.data['videos'], [])

    def test_returns_only_active_videos_in_order(self):
        HeroVideo.objects.create(video='hero/b.mp4', title='B', order=2, is_active=True)
        HeroVideo.objects.create(video='hero/a.mp4', title='A', order=1, is_active=True)
        HeroVideo.objects.create(video='hero/hidden.mp4', title='Hidden', order=0, is_active=False)

        response = self.client.get('/api/hero/')

        self.assertEqual(response.status_code, 200)
        titles = [v['title'] for v in response.data['videos']]
        self.assertEqual(titles, ['A', 'B'])
        for video in response.data['videos']:
            self.assertIn('id', video)
            self.assertTrue(video['src'])

    def test_reflects_edited_cta(self):
        settings_obj = HeroSettings.load()
        settings_obj.cta_label = 'Browse the Sale'
        settings_obj.cta_link = '/category/sale'
        settings_obj.save()

        response = self.client.get('/api/hero/')

        self.assertEqual(response.data['cta']['label'], 'Browse the Sale')
        self.assertEqual(response.data['cta']['link'], '/category/sale')
```

Note: `test_returns_only_active_videos_in_order` asserts `video['src']` is truthy. Assigning a name string to the FileField and reading `.url` builds a Cloudinary URL from `CLOUDINARY_CLOUD_NAME` without any network upload, so this runs offline as long as the `.env` Cloudinary vars are present (they are, for this project).

- [ ] **Step 5: Run the API test to verify it fails**

Run: `python manage.py test apps.content.tests.HeroAPITest -v 2`
Expected: FAIL — `/api/hero/` returns 404 before the URL is wired (or ImportError if a file is missing). If you completed steps 1-3 already, instead temporarily confirm failure by checking the test was added; otherwise proceed.

- [ ] **Step 6: Run all content tests to verify they pass**

Run: `python manage.py test apps.content -v 2`
Expected: PASS (7 tests total).

- [ ] **Step 7: Manual smoke check**

Run: `python manage.py runserver`
Visit `http://localhost:8000/api/hero/`.
Expected JSON: `{"cta": {"label": "Shop New Arrivals", "link": "/shop"}, "videos": []}`.

- [ ] **Step 8: Commit**

```bash
git add backend/apps/content/serializers.py backend/apps/content/views.py backend/apps/content/urls.py backend/config/urls.py backend/apps/content/tests.py
git commit -m "feat: add public GET /api/hero/ endpoint"
```

---

### Task 3: Admin registration

**Files:**
- Create: `backend/apps/content/admin.py`
- Modify: `backend/apps/content/tests.py` (append admin permission test)

**Interfaces:**
- Consumes: `HeroVideo`, `HeroSettings` from Task 1.
- Produces: admin pages for both models; `HeroSettings` add/delete disabled to keep it a singleton.

- [ ] **Step 1: Write the admin**

Create `backend/apps/content/admin.py`:

```python
from django.contrib import admin
from .models import HeroVideo, HeroSettings


@admin.register(HeroVideo)
class HeroVideoAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'title', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    readonly_fields = ('created_at',)


@admin.register(HeroSettings)
class HeroSettingsAdmin(admin.ModelAdmin):
    list_display = ('cta_label', 'cta_link', 'updated_at')
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        return not HeroSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
```

- [ ] **Step 2: Write the failing admin test**

Append to `backend/apps/content/tests.py`:

```python
from django.contrib.admin.sites import AdminSite
from apps.content.admin import HeroSettingsAdmin


class HeroSettingsAdminTest(TestCase):
    def setUp(self):
        self.admin = HeroSettingsAdmin(HeroSettings, AdminSite())

    def test_add_allowed_only_when_no_row_exists(self):
        self.assertTrue(self.admin.has_add_permission(request=None))
        HeroSettings.load()
        self.assertFalse(self.admin.has_add_permission(request=None))

    def test_delete_never_allowed(self):
        self.assertFalse(self.admin.has_delete_permission(request=None))
```

- [ ] **Step 3: Run the admin test to verify it passes**

Run: `python manage.py test apps.content.tests.HeroSettingsAdminTest -v 2`
Expected: PASS (2 tests). (The admin module must import cleanly for the test to run — that is the failing-first signal if `admin.py` is missing.)

- [ ] **Step 4: Manual admin check**

Run: `python manage.py runserver`, log in at `http://localhost:8000/admin/`.
Expected: a "Content" section with "Hero Settings" (one row, no "Add" button after saving once, no delete) and "Hero Videos" (upload video, edit `order`/`is_active` inline). Upload one short video and confirm it saves without error.

- [ ] **Step 5: Run the full content suite**

Run: `python manage.py test apps.content -v 2`
Expected: PASS (9 tests total).

- [ ] **Step 6: Commit**

```bash
git add backend/apps/content/admin.py backend/apps/content/tests.py
git commit -m "feat: register hero models in admin with singleton settings"
```

---

### Task 4: Frontend — fetch hero content with fallback

**Files:**
- Modify: `frontend/src/services/api.js` (add `getHero`)
- Modify: `frontend/src/components/home/Hero.jsx` (fetch + state + fallback)

**Interfaces:**
- Consumes: `GET /api/hero/` from Task 2.
- Produces: `api.getHero()` returning the parsed payload; `Hero.jsx` renders admin-driven videos and CTA, falling back to the current two videos and default CTA.

- [ ] **Step 1: Add the API method**

In `frontend/src/services/api.js`, add this method to the `api` object (after `getProduct`, keeping the trailing comma style consistent):

```javascript
  async getHero() {
    const response = await fetch(`${API_BASE_URL}/hero/`)
    if (!response.ok) throw new Error('Failed to fetch hero content')
    return await response.json()
  },
```

- [ ] **Step 2: Rewrite `Hero.jsx` to fetch with fallback**

Replace the entire contents of `frontend/src/components/home/Hero.jsx` with:

```jsx
import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { mediaUrl } from '../../utils/mediaUrl'
import { api } from '../../services/api'
import flowerBg from '../../assets/logo/flower.jpg'

// Used only until the admin adds hero videos / edits the CTA.
const FALLBACK_VIDEOS = [
  {
    id: 'fallback-1',
    src: mediaUrl('/media/products/army.MP4'),
    title: 'Army Collection',
  },
  {
    id: 'fallback-2',
    src: mediaUrl('/media/products/lowrise.MP4'),
    title: 'Lowrise Collection',
  },
]

const FALLBACK_CTA = { label: 'Shop New Arrivals', link: '/shop' }

const VIDEO_DURATION = 5000 // 5 seconds per video

export default function Hero() {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS)
  const [cta, setCta] = useState(FALLBACK_CTA)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const videoRef = useRef(null)

  // Load admin-managed hero content; keep fallbacks if empty or unreachable.
  useEffect(() => {
    let cancelled = false
    api
      .getHero()
      .then((data) => {
        if (cancelled) return
        if (data?.videos?.length > 0) {
          setVideos(
            data.videos.map((v) => ({
              id: v.id,
              src: mediaUrl(v.src),
              title: v.title || '',
            }))
          )
          setCurrentIndex(0)
        }
        if (data?.cta?.label && data?.cta?.link) {
          setCta({ label: data.cta.label, link: data.cta.link })
        }
      })
      .catch((error) => {
        console.error('Failed to load hero content:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % videos.length)
          setIsTransitioning(false)
        }, 500)
      }
    }, VIDEO_DURATION)

    return () => clearInterval(interval)
  }, [isVisible, videos.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  return (
    <section className="relative bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div
          className="relative"
          style={{
            backgroundImage: `url(${flowerBg})`,
            backgroundPosition: 'left center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll',
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-slow-text" style={{animationDelay: '0s'}}>New Season Edit</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-black sm:text-5xl animate-slow-text" style={{animationDelay: '0.15s'}}>
            Little joys for your everyday glow
          </h1>
          <p className="mt-4 max-w-md text-gray-700 animate-slow-text" style={{animationDelay: '0.3s'}}>
            Skincare, makeup and fashion accessories curated in one place — cute, considered, and made to be loved.
          </p>
          <div className="mt-8 flex gap-3 animate-slow-text" style={{animationDelay: '0.45s'}}>
            <Link
              to={cta.link}
              className="rounded-full bg-brand-900 px-7 py-3 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
            >
              {cta.label}
            </Link>
            <a
              href="#categories"
              className="rounded-full border border-brand-800 px-7 py-3 text-sm font-medium text-brand-800 hover:bg-white transition-colors"
            >
              Browse Categories
            </a>
          </div>
        </div>

        {/* Video Container */}
        <div ref={videoRef} className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-100 to-brand-200 shadow-xl border-4 border-white/50 animate-slow-text" style={{animationDelay: '0.45s'}}>
          <div className={`relative aspect-square w-full bg-brand-900 ${isTransitioning ? 'video-transitioning' : ''}`}>
            {videos.map((video, idx) => (
              <div
                key={video.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  idx === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  zIndex: idx === currentIndex ? 10 : 0,
                }}
              >
                <video
                  src={video.src}
                  autoPlay
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            {/* Video Navigation Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
              {videos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setIsTransitioning(false)
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'bg-white w-6 h-2'
                      : 'bg-white/40 w-2 h-2 hover:bg-white/70'
                  }`}
                  aria-label={`Go to video ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

Key changes vs. the original (everything else is byte-for-byte the same):
- Added `api` import; renamed module constant `VIDEOS` → `FALLBACK_VIDEOS` and gave the entries string ids; added `FALLBACK_CTA`.
- Added `videos` and `cta` state, seeded from the fallbacks.
- Added the fetch `useEffect` (runs once) that overrides state only when the API has data.
- The cycle `useEffect` now depends on `[isVisible, videos.length]` and uses `videos.length` for the modulo (was `VIDEOS.length`), so changing the video count never desyncs the index.
- `VIDEOS.map` → `videos.map` in both the video container and the dots.
- The primary button now renders `{cta.label}` and links to `cta.link`.

- [ ] **Step 3: Verify the build passes**

Run (from `frontend/`): `npm run build`
Expected: `✓ built` with no import/transform errors.

- [ ] **Step 4: Manual browser verification**

Start the backend (`python manage.py runserver` from `backend/`) and frontend (`npm run dev` from `frontend/`).

1. With no `HeroVideo` rows: homepage hero shows the two fallback videos cycling and the "Shop New Arrivals" button linking to `/shop`. (The network tab shows `GET /api/hero/` returning empty `videos`.)
2. In admin, upload one `HeroVideo` (short clip) and set `is_active=True`. Reload the homepage: the hero now shows that single uploaded video (fallback gone), still cycling without error.
3. In admin, edit Hero Settings — set label to e.g. "Browse the Sale" and link to `/shop`. Reload: the button text updates and still navigates correctly.
4. Toggle the uploaded video's `is_active` off in admin. Reload: hero returns to the two fallback videos.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/api.js frontend/src/components/home/Hero.jsx
git commit -m "feat: drive homepage hero videos and CTA from /api/hero/ with fallback"
```

---

## Self-Review Notes

- **Spec coverage:** flexible video list (Task 1 `HeroVideo` + Task 3 admin `list_editable`), CTA text+link (Task 1 `HeroSettings` + Task 3 admin), upload via Cloudinary video storage (Task 1 `VideoMediaCloudinaryStorage`), single `GET /api/hero/` (Task 2), frontend fetch + Option-A fallback (Task 4). All spec sections map to a task.
- **Type consistency:** `HeroSettings.load()`, `HeroVideoSerializer` field `src`, and the response shape `{cta:{label,link}, videos:[{id,title,src}]}` are used identically across Tasks 2 and 4.
- **Cloudinary offline testing:** tests assign a filename string (never a real upload), so `.url` generation needs only `CLOUDINARY_CLOUD_NAME` from `.env`, which is present.
