import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import ProductCard from '../product/ProductCard'
import ProductCardSkeleton from '../product/ProductCardSkeleton'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.getFeaturedProducts(5).then((data) => {
      if (active) {
        setProducts(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="bg-brand-50/60 py-16 animate-on-scroll">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-on-load">Customer Favorites</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-black animate-on-load animate-stagger-1">Most Loved</h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
        </div>
      </div>
    </section>
  )
}
