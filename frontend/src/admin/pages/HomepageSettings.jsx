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
                <video src={mediaUrl(v.src)} controls muted playsInline className="mb-3 h-40 w-full rounded-lg bg-brand-900 object-cover" />
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
