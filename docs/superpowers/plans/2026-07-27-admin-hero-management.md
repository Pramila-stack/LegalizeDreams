# Admin Hero Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin manage the homepage hero videos and CTA button from the React dashboard (new "Homepage" page), instead of Django admin.

**Architecture:** Add admin-only write endpoints in `apps/dashboard` (operating on the existing `apps.content` `HeroVideo`/`HeroSettings` models) under `/api/admin/`, gated by `IsAdminUser` — mirroring the Phase 1 Products/Categories pattern. A new dashboard page consumes them. The public `GET /api/hero/` and the storefront hero are untouched. No model changes, no migrations.

**Tech Stack:** Django 4.2, DRF, django-cloudinary-storage (`VideoMediaCloudinaryStorage`), React 19 + Vite, react-router-dom 7, Tailwind.

## Global Constraints

- New endpoints live under `/api/admin/` and set `permission_classes = [IsAdminUser]` (DRF built-in; no custom permission class).
- No model changes and no migrations (operates on existing `apps.content` models).
- Admin list endpoints set `pagination_class = None`.
- Hero video `video` file is required on **create**, optional on **update** (keeps existing video when no new file is sent).
- CTA defaults come from the model, verbatim: `cta_label = "Shop New Arrivals"`, `cta_link = "/shop"`.
- Do not modify the public `GET /api/hero/` endpoint, the `apps.content` models/admin, or the storefront hero component.
- Sidebar nav order after this change: Dashboard, Homepage, Products, Categories.
- Backend tests run with Django's runner (no pytest): from `backend/`, `venv/Scripts/python manage.py test ...`. Before any Django command: `set -a; eval "$(grep -E '^CLOUDINARY_' .env)"; set +a`.
- Video-upload tests must NOT hit the network: patch `cloudinary_storage.storage.MediaCloudinaryStorage.save` and use an in-memory file (a `FileField` accepts any bytes — no Pillow/image validation needed for video).
- Frontend has no test runner: verify with `npm run build` (from `frontend/`) + a manual walkthrough. Do not add a test framework.
- Reuse the existing Tailwind theme (`brand-*`).

---

### Task 1: Backend — hero settings endpoint (GET/PATCH)

**Files:**
- Modify: `backend/apps/dashboard/serializers.py` (add `AdminHeroSettingsSerializer`)
- Modify: `backend/apps/dashboard/views.py` (add `AdminHeroSettingsView`)
- Modify: `backend/apps/dashboard/urls.py` (add `hero-settings/` path)
- Modify: `backend/apps/dashboard/tests.py` (append settings tests)

**Interfaces:**
- Consumes: `IsAdminUser` gating; `apps.content.models.HeroSettings` (singleton, `load()` classmethod).
- Produces: `GET/PATCH /api/admin/hero-settings/` — `{cta_label, cta_link, updated_at}` (staff only); `AdminHeroSettingsSerializer`.

- [ ] **Step 1: Add the serializer**

In `backend/apps/dashboard/serializers.py`, add this import near the other model imports:

```python
from apps.content.models import HeroSettings
```

Append the serializer:

```python
class AdminHeroSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSettings
        fields = ['cta_label', 'cta_link', 'updated_at']
        read_only_fields = ['updated_at']
```

- [ ] **Step 2: Add the view**

In `backend/apps/dashboard/views.py`, add imports (alongside existing):

```python
from apps.content.models import HeroSettings
from .serializers import AdminHeroSettingsSerializer
```

Append the view:

```python
class AdminHeroSettingsView(APIView):
    """Read/update the singleton homepage CTA settings."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(AdminHeroSettingsSerializer(HeroSettings.load()).data)

    def patch(self, request):
        settings_obj = HeroSettings.load()
        serializer = AdminHeroSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
```

- [ ] **Step 3: Wire the URL**

In `backend/apps/dashboard/urls.py`, update the view import and add the path.

Import line — add `AdminHeroSettingsView`:

```python
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet, AdminProductViewSet, AdminHeroSettingsView
```

Add to `urlpatterns` (before the `path('', include(router.urls))` line):

```python
    path('hero-settings/', AdminHeroSettingsView.as_view(), name='admin-hero-settings'),
```

- [ ] **Step 4: Write the failing tests**

Append to `backend/apps/dashboard/tests.py`:

```python
from apps.content.models import HeroSettings


class AdminHeroSettingsTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')

    def test_denies_non_staff(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/hero-settings/').status_code, 403)

    def test_get_returns_defaults(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get('/api/admin/hero-settings/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['cta_label'], 'Shop New Arrivals')
        self.assertEqual(res.data['cta_link'], '/shop')

    def test_patch_updates_and_persists(self):
        self.client.force_authenticate(self.staff)
        res = self.client.patch('/api/admin/hero-settings/', {'cta_label': 'Browse the Sale', 'cta_link': '/category/sale'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['cta_label'], 'Browse the Sale')
        reloaded = HeroSettings.load()
        self.assertEqual(reloaded.cta_link, '/category/sale')
        self.assertEqual(HeroSettings.objects.count(), 1)
```

- [ ] **Step 5: Run tests (fail, then pass)**

From `backend/` (Cloudinary env exported):
Run: `venv/Scripts/python manage.py test apps.dashboard.tests.AdminHeroSettingsTest -v 2`
Expected: FAIL before implementing (endpoint 404); PASS after.
Then full suite: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: PASS (19 tests total).

- [ ] **Step 6: Commit**

```bash
git add backend/apps/dashboard/serializers.py backend/apps/dashboard/views.py backend/apps/dashboard/urls.py backend/apps/dashboard/tests.py
git commit -m "feat: add admin hero-settings endpoint (CTA edit)"
```

---

### Task 2: Backend — hero videos CRUD endpoint

**Files:**
- Modify: `backend/apps/dashboard/serializers.py` (add `AdminHeroVideoSerializer`)
- Modify: `backend/apps/dashboard/views.py` (add `AdminHeroVideoViewSet`)
- Modify: `backend/apps/dashboard/urls.py` (register `hero-videos` route)
- Modify: `backend/apps/dashboard/tests.py` (append hero video tests)

**Interfaces:**
- Consumes: `IsAdminUser`; `apps.content.models.HeroVideo` (`Meta.ordering = ['order', 'created_at']`).
- Produces: `/api/admin/hero-videos/` CRUD — fields `id, title, video (write), src (read), order, is_active, created_at`; video required on create, optional on update.

- [ ] **Step 1: Add the serializer**

In `backend/apps/dashboard/serializers.py`, update the content import to include `HeroVideo`:

```python
from apps.content.models import HeroSettings, HeroVideo
```

Append the serializer:

```python
class AdminHeroVideoSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    video = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = HeroVideo
        fields = ['id', 'title', 'video', 'src', 'order', 'is_active', 'created_at']
        read_only_fields = ['id', 'src', 'created_at']

    def get_src(self, obj):
        return obj.video.url if obj.video else None

    def validate(self, attrs):
        if self.instance is None and not attrs.get('video'):
            raise serializers.ValidationError({'video': 'A video file is required when adding a hero video.'})
        return attrs
```

- [ ] **Step 2: Add the viewset**

In `backend/apps/dashboard/views.py`, update the content import and the serializer import:

```python
from apps.content.models import HeroSettings, HeroVideo
from .serializers import AdminHeroSettingsSerializer, AdminHeroVideoSerializer
```

(`viewsets`, `MultiPartParser`, `FormParser`, `JSONParser` are already imported for the product viewset.)

Append the viewset:

```python
class AdminHeroVideoViewSet(viewsets.ModelViewSet):
    queryset = HeroVideo.objects.all()
    serializer_class = AdminHeroVideoSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
```

- [ ] **Step 3: Register the route**

In `backend/apps/dashboard/urls.py`, add `AdminHeroVideoViewSet` to the view import and register it on the existing router:

```python
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet, AdminProductViewSet, AdminHeroSettingsView, AdminHeroVideoViewSet
```

```python
router.register(r'hero-videos', AdminHeroVideoViewSet, basename='admin-hero-video')
```

- [ ] **Step 4: Write the failing tests**

Append to `backend/apps/dashboard/tests.py`:

```python
from apps.content.models import HeroVideo


def _video():
    return SimpleUploadedFile('v.mp4', b'fake-video-bytes', content_type='video/mp4')


class AdminHeroVideoCRUDTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user('admin@shop.com', 'admin@shop.com', 'pass12345', is_staff=True)
        self.customer = User.objects.create_user('cust@shop.com', 'cust@shop.com', 'pass12345')
        self.client.force_authenticate(self.staff)

    def _create(self, **extra):
        data = {'title': 'Clip', 'order': '0', 'is_active': True, 'video': _video()}
        data.update(extra)
        return self.client.post('/api/admin/hero-videos/', data, format='multipart')

    def test_customer_forbidden(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get('/api/admin/hero-videos/').status_code, 403)

    def test_create_requires_video(self):
        res = self.client.post('/api/admin/hero-videos/', {'title': 'No file', 'order': '0'}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn('video', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_create_returns_src_and_fields(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        res = self._create(title='Army', order='1')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['title'], 'Army')
        self.assertEqual(res.data['order'], 1)
        self.assertTrue(res.data['is_active'])
        self.assertTrue(res.data['src'])
        self.assertNotIn('video', res.data)

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_list_ordered_by_order(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        self._create(title='B', order='2')
        self._create(title='A', order='1')
        res = self.client.get('/api/admin/hero-videos/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual([v['title'] for v in res.data], ['A', 'B'])

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_update_without_video_keeps_existing(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create(title='Editable', order='0').data
        res = self.client.patch(f"/api/admin/hero-videos/{created['id']}/", {'title': 'Renamed', 'order': '5'})
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['title'], 'Renamed')
        self.assertEqual(res.data['order'], 5)
        self.assertTrue(res.data['src'])

    @mock.patch('cloudinary_storage.storage.MediaCloudinaryStorage.save', autospec=True)
    def test_delete(self, mock_save):
        mock_save.side_effect = lambda self, name, content, max_length=None: name
        created = self._create().data
        res = self.client.delete(f"/api/admin/hero-videos/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(HeroVideo.objects.filter(id=created['id']).exists())
```

Note: `mock` and `SimpleUploadedFile` are already imported at the point where the product tests were added earlier in this file; reuse them (do not re-import if already present — if a duplicate import lint warning appears, remove the redundant one).

- [ ] **Step 5: Run tests (fail, then pass)**

From `backend/` (Cloudinary env exported):
Run: `venv/Scripts/python manage.py test apps.dashboard.tests.AdminHeroVideoCRUDTest -v 2`
Expected: FAIL before implementing (route missing); PASS after.
Then full suite: `venv/Scripts/python manage.py test apps.dashboard -v 2`
Expected: PASS (25 tests total).

- [ ] **Step 6: Commit**

```bash
git add backend/apps/dashboard/serializers.py backend/apps/dashboard/views.py backend/apps/dashboard/urls.py backend/apps/dashboard/tests.py
git commit -m "feat: add admin hero-videos CRUD endpoint with upload"
```

---

### Task 3: Frontend — Homepage management page

**Files:**
- Modify: `frontend/src/admin/adminApi.js` (add hero methods)
- Create: `frontend/src/admin/pages/HomepageSettings.jsx`
- Modify: `frontend/src/admin/AdminLayout.jsx` (add Homepage nav link)
- Modify: `frontend/src/App.jsx` (add `homepage` route + import)

**Interfaces:**
- Consumes: `/api/admin/hero-settings/` (GET/PATCH), `/api/admin/hero-videos/` (CRUD), `mediaUrl`.

- [ ] **Step 1: Add the API methods**

In `frontend/src/admin/adminApi.js`, add these to the `adminApi` object (after the product methods, keeping the trailing-comma style):

```javascript
  getHeroSettings: () => request('/admin/hero-settings/'),
  updateHeroSettings: (body) => request('/admin/hero-settings/', { method: 'PATCH', body }),
  listHeroVideos: () => request('/admin/hero-videos/'),
  createHeroVideo: (formData) => request('/admin/hero-videos/', { method: 'POST', body: formData, isForm: true }),
  updateHeroVideo: (id, formData) => request(`/admin/hero-videos/${id}/`, { method: 'PATCH', body: formData, isForm: true }),
  deleteHeroVideo: (id) => request(`/admin/hero-videos/${id}/`, { method: 'DELETE' }),
```

- [ ] **Step 2: Create the Homepage page**

Create `frontend/src/admin/pages/HomepageSettings.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { adminApi } from '../adminApi'
import { mediaUrl } from '../../utils/mediaUrl'

const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none'

export default function HomepageSettings() {
  const [cta, setCta] = useState({ cta_label: '', cta_link: '' })
  const [ctaSaving, setCtaSaving] = useState(false)
  const [ctaMsg, setCtaMsg] = useState('')

  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', order: '0', is_active: true })
  const [videoFile, setVideoFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function reloadVideos() {
    setLoadingVideos(true)
    try {
      setVideos(await adminApi.listHeroVideos())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingVideos(false)
    }
  }

  useEffect(() => {
    adminApi.getHeroSettings()
      .then((s) => setCta({ cta_label: s.cta_label, cta_link: s.cta_link }))
      .catch((e) => setError(e.message))
    reloadVideos()
  }, [])

  async function handleCtaSave(e) {
    e.preventDefault()
    setCtaMsg('')
    setCtaSaving(true)
    try {
      await adminApi.updateHeroSettings({ cta_label: cta.cta_label, cta_link: cta.cta_link })
      setCtaMsg('Saved.')
    } catch (err) {
      setCtaMsg(err.message)
    } finally {
      setCtaSaving(false)
    }
  }

  function resetVideoForm() {
    setEditingId(null)
    setForm({ title: '', order: '0', is_active: true })
    setVideoFile(null)
  }

  function startEdit(v) {
    setEditingId(v.id)
    setForm({ title: v.title || '', order: String(v.order), is_active: v.is_active })
    setVideoFile(null)
  }

  async function handleVideoSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('order', form.order)
      fd.append('is_active', form.is_active)
      if (videoFile) fd.append('video', videoFile)
      if (editingId) {
        await adminApi.updateHeroVideo(editingId, fd)
      } else {
        await adminApi.createHeroVideo(fd)
      }
      resetVideoForm()
      await reloadVideos()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(v) {
    if (!window.confirm(`Delete this hero video${v.title ? ` ("${v.title}")` : ''}?`)) return
    setError('')
    try {
      await adminApi.deleteHeroVideo(v.id)
      if (editingId === v.id) resetVideoForm()
      await reloadVideos()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">Homepage</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Call-to-action button</h2>
        <form onSubmit={handleCtaSave} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Button text</label>
            <input value={cta.cta_label} onChange={(e) => setCta((c) => ({ ...c, cta_label: e.target.value }))} required className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Button link</label>
            <input value={cta.cta_link} onChange={(e) => setCta((c) => ({ ...c, cta_link: e.target.value }))} required placeholder="/shop" className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={ctaSaving} className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60">
              {ctaSaving ? 'Saving…' : 'Save'}
            </button>
            {ctaMsg && <span className="text-sm text-gray-500">{ctaMsg}</span>}
          </div>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">{editingId ? 'Edit video' : 'Add video'}</h2>
        <form onSubmit={handleVideoSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Order</label>
              <input type="number" min="0" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Video {editingId && <span className="text-gray-400">(leave empty to keep current)</span>}</label>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0] || null)} required={!editingId} className="mt-1 block text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active (shown on the homepage)
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60">
              {submitting ? 'Saving…' : editingId ? 'Save' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={resetVideoForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {loadingVideos ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl border border-gray-200 bg-white p-4">
              {v.src ? (
                <video src={mediaUrl(v.src)} muted className="mb-3 h-40 w-full rounded-lg bg-brand-900 object-cover" />
              ) : (
                <div className="mb-3 h-40 w-full rounded-lg bg-gray-100" />
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-brand-900">{v.title || `Video ${v.id}`}</div>
                  <div className="text-xs text-gray-500">order {v.order} · {v.is_active ? 'active' : 'hidden'}</div>
                </div>
                <div className="text-sm">
                  <button onClick={() => startEdit(v)} className="mr-3 text-brand-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(v)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {videos.length === 0 && <p className="text-sm text-gray-400">No hero videos yet.</p>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add the nav link**

In `frontend/src/admin/AdminLayout.jsx`, extend `NAV` so Homepage sits between Dashboard and Products:

```jsx
const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/homepage', label: 'Homepage' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
]
```

- [ ] **Step 4: Add the route**

In `frontend/src/App.jsx`, import the page:

```jsx
import HomepageSettings from './admin/pages/HomepageSettings'
```

Add inside the guarded admin routes (next to the other admin child routes):

```jsx
              <Route path="homepage" element={<HomepageSettings />} />
```

- [ ] **Step 5: Verify the build**

From `frontend/`: `npm run build`
Expected: `✓ built` with no import/transform errors.

- [ ] **Step 6: Manual verification**

Start backend + frontend, log in as staff:
1. Sidebar shows **Homepage**; open `/admin/homepage`.
2. Edit the CTA text/link → Save → reload the storefront home; the button reflects it.
3. Add a video (upload a short clip, set order, active) → it appears in the list and on the storefront hero.
4. Edit a video's order/title/active (no new file) → saves, video preserved.
5. Delete a video (confirm) → removed from the list and the storefront.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/admin/adminApi.js frontend/src/admin/pages/HomepageSettings.jsx frontend/src/admin/AdminLayout.jsx frontend/src/App.jsx
git commit -m "feat: add homepage (hero) management page to admin dashboard"
```

---

## Self-Review Notes

- **Spec coverage:** hero video CRUD + upload (Task 2 backend, Task 3 frontend), CTA edit (Task 1 backend, Task 3 frontend), numeric order reordering (Task 2 `order` field + Task 3 form), any number of videos (no count limit), IsAdminUser gating on both endpoints, public `/api/hero/` + storefront untouched, nav order Dashboard/Homepage/Products/Categories. All spec sections map to a task.
- **Type/name consistency:** response fields (`cta_label`, `cta_link`; `id, title, src, order, is_active`) are used identically across serializers and `adminApi`/`HomepageSettings`; `adminApi` method names (`getHeroSettings`, `updateHeroSettings`, `listHeroVideos`, `createHeroVideo`, `updateHeroVideo`, `deleteHeroVideo`) match their usages; view/serializer/viewset names are consistent across tasks and the URL imports.
- **Offline video tests:** patch `MediaCloudinaryStorage.save` + in-memory bytes; `video` is a `FileField` (no image validation), so plain bytes suffice; `.url` still builds from `CLOUDINARY_*` env.
- **Video required-on-create/optional-on-update:** enforced in `AdminHeroVideoSerializer.validate` and exercised by `test_create_requires_video` + `test_update_without_video_keeps_existing`.
