import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const categoriesData = await api.getCategories()
        const cats = categoriesData.results || categoriesData
        setCategories(cats)

        // Fetch products for each category
        const productsMap = {}
        for (const cat of cats) {
          try {
            const products = await api.getProducts({ categorySlug: cat.slug, limit: 3 })
            productsMap[cat.id] = products
          } catch (err) {
            productsMap[cat.id] = []
          }
        }
        setCategoryProducts(productsMap)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoriesAndProducts()
  }, [])

  if (loading) return <section className="mx-auto max-w-7xl px-4 py-16">Loading categories...</section>
  if (!categories.length) return null

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-on-scroll">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-on-load">Explore</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-black animate-on-load animate-stagger-1">All Our Categories</h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, idx) => {
          const products = categoryProducts[c.id] || []
          return (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-100 hover:scale-105 transition-transform duration-300 animate-on-scroll opacity-0"
              style={{animation: `slideUp 0.6s ease-out forwards`, animationDelay: `${idx * 0.08}s`}}
            >
              {/* Product Images Grid */}
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
                {products.length > 0 ? (
                  <div className="h-full w-full">
                    {products.length === 1 ? (
                      /* Single product - fill entire box */
                      <div className="h-full w-full overflow-hidden bg-brand-100">
                        {products[0].image && (
                          <img
                            src={
                              typeof products[0].image === 'string' && !products[0].image.startsWith('http')
                                ? `http://localhost:8000${products[0].image}`
                                : products[0].image
                            }
                            alt={products[0].name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    ) : products.length === 2 ? (
                      /* Two products - 1 row, 2 columns (each takes half width) */
                      <div className="grid grid-cols-2 gap-0 h-full">
                        {products.slice(0, 2).map((product) => (
                          <div
                            key={product.id}
                            className="relative overflow-hidden bg-brand-100"
                          >
                            {product.image ? (
                              <img
                                src={
                                  typeof product.image === 'string' && !product.image.startsWith('http')
                                    ? `http://localhost:8000${product.image}`
                                    : product.image
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : products.length === 3 ? (
                      /* Three products - 3 columns in 1 row */
                      <div className="grid grid-cols-3 gap-0 h-full">
                        {products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="relative overflow-hidden bg-brand-100"
                          >
                            {product.image ? (
                              <img
                                src={
                                  typeof product.image === 'string' && !product.image.startsWith('http')
                                    ? `http://localhost:8000${product.image}`
                                    : product.image
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Four or more products - Instagram-like 2x2 grid layout */
                      <div className="grid grid-cols-2 gap-0 h-full">
                        {products.slice(0, 4).map((product) => (
                          <div
                            key={product.id}
                            className="relative overflow-hidden bg-brand-100"
                          >
                            {product.image ? (
                              <img
                                src={
                                  typeof product.image === 'string' && !product.image.startsWith('http')
                                    ? `http://localhost:8000${product.image}`
                                    : product.image
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">📁</div>
                )}
              </div>

              {/* Category Name */}
              <div className="p-4 text-center animate-on-load">
                <span className="text-sm font-medium text-black">{c.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
