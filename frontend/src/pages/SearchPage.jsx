import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.getProducts({ query }).then((data) => {
      if (active) {
        setProducts(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-on-scroll">
      <h1 className="font-display text-2xl font-semibold text-black animate-slow-text">
        Search results for &quot;{query}&quot;
      </h1>
      <p className="mt-1 text-sm text-brand-500 animate-slow-text" style={{animationDelay: '0.2s'}}>
        {loading ? 'Searching...' : `${products.length} result${products.length === 1 ? '' : 's'}`}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : products.length ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="col-span-full py-16 text-center text-brand-500">
            No products matched your search. Try a different keyword.
          </p>
        )}
      </div>
    </div>
  )
}
