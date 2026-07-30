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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
