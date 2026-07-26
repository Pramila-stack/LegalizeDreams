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
