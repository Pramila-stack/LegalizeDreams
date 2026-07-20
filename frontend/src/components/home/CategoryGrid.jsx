import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { mediaUrl } from '../../utils/mediaUrl'

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
        <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-title" style={{animationDelay: '0s'}}>
          ✨ Explore
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-black animate-title animate-underline" style={{animationDelay: '0.15s'}}>
          All Our Categories
        </h2>
        <p className="mt-4 text-sm text-brand-600 animate-slow-text" style={{animationDelay: '0.4s'}}>
          Browse through our curated collection
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, idx) => {
          const products = categoryProducts[c.id] || []
          return (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              state={{ scrollTarget: 'categories' }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white hover:shadow-2xl hover:shadow-brand-200 hover:scale-110 transition-all duration-500 animate-scale-in"
              style={{animationDelay: `${0.45 + idx * 0.08}s`}}
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
                            src={mediaUrl(products[0].image)}
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
                                src={mediaUrl(product.image)}
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
                                src={mediaUrl(product.image)}
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
                                src={mediaUrl(product.image)}
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
              <div className="p-4 text-center group-hover:bg-brand-50 transition-colors duration-300">
                <span className="text-sm font-medium text-black group-hover:text-brand-600 transition-colors duration-300">
                  {c.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
