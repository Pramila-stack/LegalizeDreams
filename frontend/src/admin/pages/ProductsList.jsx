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
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
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
