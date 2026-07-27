# Admin Dashboard — Homepage (Hero) Management — Design

**Date:** 2026-07-27
**Status:** Approved (pending spec review)
**Phase:** 2 (first piece)

## Problem

The homepage hero (two autoplaying videos + the "Shop New Arrivals" CTA button) is
editable only through **Django admin** (`apps/content` models registered there). The
custom React admin dashboard (Phase 1) covers Products and Categories but **not** the
hero — so the client still has to use Django admin for it, which defeats the purpose of
the dashboard.

This feature brings hero management **into the React dashboard** as a new "Homepage"
section, so the client manages everything in one place.

## Goals

- Manage hero **videos** from the dashboard: add (upload), edit (title/order/active,
  optionally replace the video), delete, and reorder — with any number of videos.
- Edit the **CTA button** (label + link) from the dashboard.
- Keep the existing public `GET /api/hero/` endpoint and the storefront hero unchanged.

## Non-Goals (YAGNI)

- No drag-and-drop reordering (numeric `order` field per decision; drag-drop is possible
  later polish).
- No changes to the storefront hero component or the public `/api/hero/` endpoint.
- No new hero fields beyond what the models already have.
- Django admin registration for hero stays (harmless; still available to the developer).

## Decisions (from brainstorming)

- **Reordering:** numeric `order` field the admin edits (lower shows first), matching
  today's Django-admin behavior.
- **Video source:** file **upload** to Cloudinary (the model already uses
  `VideoMediaCloudinaryStorage`), consistent with product images.
- **Flexible count:** any number of videos (the storefront already cycles through all
  active ones).

## Architecture

Mirrors the Phase 1 Products/Categories pattern exactly. New **admin-only** write
endpoints live in `apps/dashboard` (operating on the existing `apps.content` models),
gated by `IsAdminUser`, under `/api/admin/`. A new dashboard page consumes them.

```
Admin dashboard (/admin/homepage)
  → /api/admin/hero-videos/     (CRUD, IsAdminUser, multipart video upload)
  → /api/admin/hero-settings/   (GET/PATCH singleton, IsAdminUser)
        │
        ▼
  apps.content models: HeroVideo, HeroSettings
        │
        ▼
  Storefront reads the SAME data via the unchanged public GET /api/hero/
```

No model changes, so no migrations.

## Backend Detail (`apps/dashboard`)

### Serializers (`apps/dashboard/serializers.py`, appended)

**`AdminHeroVideoSerializer`**
- Fields: `id`, `title`, `video` (write), `src` (read), `order`, `is_active`,
  `created_at`.
- `video`: `FileField`, `required=False` (see validate); write-only-ish (used for
  upload). Stored via the model's `VideoMediaCloudinaryStorage`.
- `src`: `SerializerMethodField` returning `obj.video.url` (absolute Cloudinary URL) or
  `None` — for display/preview.
- `id`, `src`, `created_at`: read-only.
- `validate`: on create (`self.instance is None`) require `video`; optional on update
  (keeps existing video when no new file is sent) — same rule as products' image.

**`AdminHeroSettingsSerializer`**
- Fields: `cta_label`, `cta_link`, `updated_at` (`updated_at` read-only).
- `ModelSerializer` over `HeroSettings`.

### Views (`apps/dashboard/views.py`, appended)

**`AdminHeroVideoViewSet(ModelViewSet)`**
- `queryset = HeroVideo.objects.all()` (model `Meta.ordering = ['order', 'created_at']`
  applies).
- `serializer_class = AdminHeroVideoSerializer`, `permission_classes = [IsAdminUser]`,
  `pagination_class = None`, `parser_classes = [MultiPartParser, FormParser,
  JSONParser]`.

**`AdminHeroSettingsView(APIView)`**
- `permission_classes = [IsAdminUser]`.
- `get`: return `AdminHeroSettingsSerializer(HeroSettings.load()).data`.
- `patch`: load singleton, `AdminHeroSettingsSerializer(obj, data=request.data,
  partial=True)`, validate, save, return data. (The model's `save()` pins `pk=1`, so it
  stays a singleton.)

### URLs (`apps/dashboard/urls.py`, appended)

- Register `hero-videos` on the existing router → `AdminHeroVideoViewSet`
  (`basename='admin-hero-video'`).
- Add `path('hero-settings/', AdminHeroSettingsView.as_view(), name='admin-hero-settings')`.

## Frontend Detail

### `frontend/src/admin/adminApi.js` (append methods)

- `getHeroSettings()` → GET `/admin/hero-settings/`
- `updateHeroSettings(body)` → PATCH `/admin/hero-settings/` (JSON)
- `listHeroVideos()` → GET `/admin/hero-videos/`
- `createHeroVideo(formData)` → POST `/admin/hero-videos/` (multipart)
- `updateHeroVideo(id, formData)` → PATCH `/admin/hero-videos/{id}/` (multipart)
- `deleteHeroVideo(id)` → DELETE `/admin/hero-videos/{id}/`

### `frontend/src/admin/pages/HomepageSettings.jsx` (new)

- **CTA section**: form with `cta_label` + `cta_link`, loaded from `getHeroSettings`,
  saved via `updateHeroSettings`; `submitting` disabled state; success/error message.
- **Videos section**:
  - List of videos: small muted `<video>` preview (via `src`), title, order,
    active; **Edit** and **Delete** (confirm) actions.
  - **Add/Edit form** (reuse one form with an `editingId`, like CategoriesList):
    fields `title`, `order` (number), `is_active` (checkbox), `video` (file — required
    when adding, optional when editing with "leave empty to keep current"); assembled as
    `FormData`; `submitting` guard; reload list after each mutation; `resetForm()` when
    deleting the row being edited.
- Errors surfaced inline; loading state before render.

### `frontend/src/admin/AdminLayout.jsx` (modify)

Add a **Homepage** nav link after Dashboard:
`{ to: '/admin/homepage', label: 'Homepage' }` → NAV becomes Dashboard, Homepage,
Products, Categories.

### `frontend/src/App.jsx` (modify)

Add a guarded child route `homepage` → `HomepageSettings`, alongside the existing admin
routes, and import the page.

## Testing / Verification

**Backend (`apps/dashboard/tests.py`, appended):**
- Non-staff → 403 on `hero-videos` and `hero-settings`.
- Hero settings: GET returns defaults; PATCH updates `cta_label`/`cta_link` and persists
  (singleton stays pk=1).
- Hero video: create requires a video (400 without); create with a video (Cloudinary
  `save` patched + in-memory GIF, as in the product tests) returns 201 with `src`,
  `order`, `is_active`; list returns active+inactive ordered by `order`; update
  title/order without a new video keeps the existing video; delete returns 204.

**Frontend:** no test runner — verify with `npm run build` and a manual walkthrough
(edit CTA; add a video and confirm it appears on the storefront hero; edit order/active;
delete).

## Files Touched

**Modified (backend)**
- `backend/apps/dashboard/serializers.py` — add the two hero serializers.
- `backend/apps/dashboard/views.py` — add the viewset + settings view.
- `backend/apps/dashboard/urls.py` — register the two routes.
- `backend/apps/dashboard/tests.py` — append hero tests.

**Modified (frontend)**
- `frontend/src/admin/adminApi.js` — add hero methods.
- `frontend/src/admin/AdminLayout.jsx` — add Homepage nav link.
- `frontend/src/App.jsx` — add the homepage route + import.

**New (frontend)**
- `frontend/src/admin/pages/HomepageSettings.jsx`

No new backend files; no model changes; no migrations.
