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
    <section id="featured-products" className="bg-brand-50/60 py-16 animate-on-scroll">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-slow-text" style={{animationDelay: '0s'}}>Customer Favorites</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-black animate-slow-text" style={{animationDelay: '0.15s'}}>Most Loved</h2>
          <p className="mt-2 text-sm text-brand-600 animate-slow-text" style={{animationDelay: '0.3s'}}>Bestselling picks from our community</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} scrollTarget="featured-products" />)}
        </div>
      </div>
    </section>
  )
}
