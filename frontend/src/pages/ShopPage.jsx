import { useEffect, useState } from 'react'
import { api } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/common/Button'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await api.getProducts({ limit: 20 })
        setProducts(data)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [page])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-brand-600">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900">All Products</h1>
        <p className="mt-2 text-brand-600">Explore our latest collection of fashion and skincare products</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-brand-600">No products available</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
