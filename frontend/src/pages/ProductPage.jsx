import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { getCategoryBySlug } from '../data/categories'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/common/ProductImage'
import Price from '../components/common/Price'
import StarRating from '../components/common/StarRating'
import QuantityInput from '../components/common/QuantityInput'
import Button from '../components/common/Button'
import ProductCard from '../components/product/ProductCard'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(undefined)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let active = true
    setQty(1)
    setAdded(false)
    api.getProduct(slug).then((data) => {
      if (!active) return
      setProduct(data)
      if (data) {
        api.getRelatedProducts(data, 4).then((r) => active && setRelated(r))
      }
    })
    return () => {
      active = false
    }
  }, [slug])

  if (product === undefined) {
    return <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">Loading...</div>
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-black">not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-900">
          ← Back to home
        </Link>
      </div>
    )
  }

  const category = getCategoryBySlug(product.categorySlug)

  function handleAddToCart() {
    addToCart(product, qty)
    setAdded(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs text-brand-400">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to={`/category/${product.categorySlug}`} className="hover:text-brand-700">
          {category?.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-brand-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductImage product={product} size="lg" className="aspect-square w-full" />

        <div>
          <h1 className="font-display text-3xl font-semibold text-black">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviews={product.reviews} size="md" />
          </div>
          <div className="mt-4">
            <Price price={product.price} mrp={product.mrp} size="lg" />
          </div>

          <p className="mt-6 max-w-lg leading-relaxed text-brand-600">{product.description}</p>

          <p className="mt-4 text-sm text-brand-500">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock — ready to ship</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <QuantityInput value={qty} onChange={setQty} max={product.stock} />
            <Button onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
          </div>

          {added && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Added to cart.
              <button onClick={() => navigate('/cart')} className="font-semibold underline underline-offset-2">
                View cart
              </button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-brand-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
