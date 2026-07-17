import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'

const SORTS = {
  featured: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(undefined)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    let active = true
    setLoading(true)

    // Scroll to top immediately when slug changes
    window.scrollTo(0, 0)

    Promise.all([api.getCategory(slug), api.getProducts({ categorySlug: slug })]).then(
      ([categoryData, productsData]) => {
        if (!active) return
        setCategory(categoryData)
        setProducts(productsData)
        setLoading(false)
      }
    )
    return () => {
      active = false
    }
  }, [slug])

  const sortedProducts = [...products].sort(SORTS[sort])

  if (!loading && category === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-black">Category not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-900">
          ← Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-on-scroll">
      <div className="mb-4 flex items-center gap-4">
        <Link
          to="/"
          className="inline-block rounded-full border border-brand-600 px-4 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
        >
          ← Back
        </Link>

        <nav className="text-xs text-brand-400 opacity-0" style={{animation: 'slideUp 0.6s ease-out forwards'}}>
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-brand-700">{category?.name ?? '...'}</span>
        </nav>
      </div>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 animate-slow-text" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{category?.icon}</span>
          <h1 className="font-display text-3xl font-semibold text-black">{category?.name ?? 'Loading...'}</h1>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-600 animate-slow-text" style={{animationDelay: '0.2s'}}>
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-400"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
      </div>

      <p className="mt-1 text-sm text-brand-500 animate-slow-text" style={{animationDelay: '0.3s'}}>
        {loading ? 'Loading products...' : `${products.length} product${products.length === 1 ? '' : 's'}`}
      </p>

      <div id="products-grid" className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : sortedProducts.length ? (
          sortedProducts.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)
        ) : (
          <p className="col-span-full py-16 text-center text-brand-500">No products in this category yet.</p>
        )}
      </div>
    </div>
  )
}
