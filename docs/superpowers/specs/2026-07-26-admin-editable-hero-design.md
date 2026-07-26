# Admin-Editable Homepage Hero — Design

**Date:** 2026-07-26
**Status:** Approved (pending spec review)

## Problem

The homepage hero (`frontend/src/components/home/Hero.jsx`) hardcodes:

- Two auto-cycling videos (`army.MP4`, `lowrise.MP4`) with fixed titles.
- The "Shop New Arrivals" call-to-action button — fixed text, linking to `/shop`.

The site owner wants to change these from the Django admin panel without editing
code or redeploying.

## Goals

- Manage hero videos (add / remove / reorder / hide) from the admin.
- Edit the CTA button label and link target from the admin.
- Keep everything else in the hero unchanged (headline, subtext, "Browse Categories"
  button, cycling behavior, styling).

## Non-Goals (YAGNI)

- No editing of the other hero text (headline, paragraph, "New Season Edit" eyebrow).
- No editing of the second "Browse Categories" button.
- No per-video scheduling, analytics, or transition-timing controls.
- No changes to product media or the existing `mediaUrl` mechanism.

## Architecture

A new dedicated Django app, `apps/content`, holds the hero configuration. This mirrors
the existing per-domain app layout (`apps/products`, `apps/orders`, `apps/users`) and
keeps site-content concerns out of the product catalog.

### Data flow

```
Django Admin  ──edit──▶  content models (DB + Cloudinary)
                                │
                                ▼
                    GET /api/hero/  (DRF, AllowAny)
                                │
                                ▼
              Hero.jsx  ──fetch on mount──▶  render videos + CTA
```

## Models (`apps/content/models.py`)

### HeroVideo — flexible video list

| Field       | Type                                             | Notes                                   |
|-------------|--------------------------------------------------|-----------------------------------------|
| `video`     | `FileField(upload_to="hero/", storage=VideoMediaCloudinaryStorage())` | Uploaded video, stored on Cloudinary as a **video** resource. |
| `title`     | `CharField(max_length=100, blank=True)`          | Optional slide title.                   |
| `order`     | `PositiveIntegerField(default=0)`                | Cycle order (ascending).                |
| `is_active` | `BooleanField(default=True)`                     | Hide without deleting.                  |
| `created_at`| `DateTimeField(auto_now_add=True)`               | Tiebreaker for equal `order`.           |

- `Meta.ordering = ['order', 'created_at']`
- `__str__` returns `title` or `f"Hero Video {pk}"`.

**Storage note:** the default `MediaCloudinaryStorage` uploads as `resource_type=image`
and mangles video. `cloudinary_storage.storage.VideoMediaCloudinaryStorage` uploads as
`resource_type=video`, which is required here.

### HeroSettings — singleton CTA config

| Field        | Type                                          | Default              |
|--------------|-----------------------------------------------|----------------------|
| `cta_label`  | `CharField(max_length=100)`                   | `"Shop New Arrivals"`|
| `cta_link`   | `CharField(max_length=200)`                   | `"/shop"`            |
| `updated_at` | `DateTimeField(auto_now=True)`                | —                    |

- Singleton enforced by overriding `save()` to pin `pk = 1`.
- `load()` classmethod does `get_or_create(pk=1)` and returns the instance, so the API
  always has a row to read even before an admin visits the page.
- `Meta.verbose_name_plural = "Hero Settings"`.

`cta_link` is a free-text path (e.g. `/shop`, `/category/new-arrivals`). It is rendered
into a react-router `<Link to=...>`; internal paths are expected. No URL validation
beyond `max_length` — the admin is trusted.

## API (`apps/content/`)

### Serializer

`HeroVideoSerializer` exposes `id`, `title`, and `src`, where `src` is a
`SerializerMethodField` returning `obj.video.url` (an absolute Cloudinary URL) or `null`.

### View

`HeroView(APIView)`, `permission_classes = [AllowAny]`, GET only:

```json
{
  "cta":   { "label": "Shop New Arrivals", "link": "/shop" },
  "videos": [ { "id": 1, "title": "Army Collection", "src": "https://res.cloudinary.com/..." } ]
}
```

- `cta` from `HeroSettings.load()`.
- `videos` from `HeroVideo.objects.filter(is_active=True)` (already ordered by `Meta`).

### Routing

- `apps/content/urls.py` maps `path('hero/', HeroView.as_view(), name='hero')`.
- `config/urls.py` adds `path('api/', include('apps.content.urls'))` alongside the
  existing product/order includes.
- `apps.content` added to `INSTALLED_APPS`.

## Admin (`apps/content/admin.py`)

**HeroSettings**
- `list_display = ('cta_label', 'cta_link', 'updated_at')`.
- `has_add_permission` returns `False` once a row exists; `has_delete_permission`
  returns `False`. Keeps it a true singleton.

**HeroVideo**
- `list_display = ('__str__', 'title', 'order', 'is_active', 'created_at')`.
- `list_editable = ('order', 'is_active')` for quick reordering/toggling.
- `list_filter = ('is_active',)`.

## Frontend (`frontend/src/components/home/Hero.jsx`)

- Add a new `api.getHero()` method in `frontend/src/services/api.js` that fetches
  `${API_BASE_URL}/hero/` and returns the parsed payload (throws on non-OK, like the
  other methods).
- In `Hero.jsx`, replace the module-level `VIDEOS` constant and the hardcoded button
  text/link with component state:
  - `videos` — populated from the API response.
  - `cta` — `{ label, link }` from the API response.
- Fetch on mount in a `useEffect`. On success, set state. On error or empty, use the
  fallback (below).
- Each video `src` is passed through the existing `mediaUrl()` helper, which returns
  absolute (Cloudinary) URLs unchanged and prefixes relative ones — so both local and
  production URLs work and the cycling logic is untouched.
- The CTA `<Link>` uses `cta.link` for `to` and renders `cta.label`.

### Empty-state fallback (Option A — approved)

A module-level `FALLBACK_VIDEOS` constant holds the current two entries
(`/media/products/army.MP4` → "Army Collection", `/media/products/lowrise.MP4` →
"Lowrise Collection"). The effective video list is:

```
effectiveVideos = (apiVideos && apiVideos.length > 0) ? apiVideos : FALLBACK_VIDEOS
```

The CTA similarly falls back to `{ label: "Shop New Arrivals", link: "/shop" }` if the
fetch fails. Result: the hero is never blank, and the instant an admin adds one video
the fallback disappears entirely.

### Cycling guards

The existing interval advances `currentIndex` by `(prev + 1) % videos.length`. With the
fallback always guaranteeing ≥1 video, `length` is never 0, so no divide-by-zero. Logic
otherwise unchanged.

## Testing / Verification

- **Backend:** `makemigrations content` + `migrate` apply cleanly. `GET /api/hero/`
  returns the default CTA and an empty `videos` array on a fresh DB. After uploading a
  `HeroVideo` in admin, it appears in the response with a Cloudinary `src`.
- **Admin:** HeroSettings shows exactly one editable row (no add/delete). HeroVideo
  supports upload, inline `order`/`is_active` editing.
- **Frontend:** With no videos in DB, hero shows the two fallback videos and default
  CTA. After adding videos/editing CTA in admin, a reload reflects the changes. Editing
  `order` reorders the cycle; toggling `is_active` hides a video.

## Files Touched

**New**
- `backend/apps/content/__init__.py`
- `backend/apps/content/apps.py`
- `backend/apps/content/models.py`
- `backend/apps/content/serializers.py`
- `backend/apps/content/views.py`
- `backend/apps/content/urls.py`
- `backend/apps/content/admin.py`
- `backend/apps/content/migrations/__init__.py` (+ generated migration)

**Modified**
- `backend/config/settings.py` — add `apps.content` to `INSTALLED_APPS`.
- `backend/config/urls.py` — include `apps.content.urls`.
- `frontend/src/services/api.js` — add `getHero()`.
- `frontend/src/components/home/Hero.jsx` — fetch + state + fallback.
