import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        setCategories(data.results || data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) return <section className="mx-auto max-w-7xl px-4 py-16">Loading categories...</section>
  if (!categories.length) return null

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blush-400">Explore</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-brand-900">All Our Categories</h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-brand-100 p-5 text-center transition-shadow hover:shadow-lg hover:shadow-brand-100"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-3xl font-semibold transition-transform group-hover:scale-105 bg-gradient-to-br from-brand-200 to-blush-200"
              aria-hidden="true"
            >
              📁
            </div>
            <span className="text-sm font-medium text-brand-800">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
