import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import ProductImage from '../components/common/ProductImage'
import QuantityInput from '../components/common/QuantityInput'
import Button from '../components/common/Button'

const SHIPPING_THRESHOLD = 3000
const SHIPPING_FEE = 150

export default function CartPage() {
  const { items, updateQty, removeFromCart, subtotal } = useCart()
  const [products, setProducts] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      const productMap = {}
      for (const item of items) {
        if (!productMap[item.slug]) {
          try {
            const product = await api.getProduct(item.slug)
            if (product) {
              productMap[item.slug] = product
            }
          } catch (err) {
            // Product not found or error fetching
          }
        }
      }
      setProducts(productMap)
    }

    if (items.length > 0) {
      fetchProducts()
    } else {
      setProducts({})
    }
  }, [items])

  const shipping = items.length === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping


  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="text-5xl" aria-hidden="true">🛍️</span>
        <h1 className="font-display mt-4 text-2xl font-semibold text-brand-900">Your cart is empty</h1>
        <p className="mt-2 text-brand-600">Looks like you haven’t added anything yet.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="divide-y divide-brand-100 lg:col-span-2">
          {items.map((item) => {
            const product = products[item.slug]
            return (
              <div key={item.id} className="flex items-center gap-4 py-5">
                <Link to={`/product/${item.slug}`} className="shrink-0">
                  {product ? (
                    <ProductImage product={product} size="sm" className="h-20 w-20" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-brand-100" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.slug}`} className="text-sm font-medium text-brand-900 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-brand-500">Rs {item.price.toLocaleString()}</p>
                </div>
                <QuantityInput value={item.qty} onChange={(qty) => updateQty(item.id, qty)} />
                <p className="w-20 text-right text-sm font-semibold text-brand-900">
                  Rs {(item.qty * item.price).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-brand-400 hover:text-red-500"
                  aria-label={`Remove ${item.name}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        <div className="h-fit rounded-2xl border border-brand-100 p-6">
          <h2 className="font-display text-lg font-semibold text-brand-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-600">
              <span>Subtotal</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-brand-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `Rs ${shipping.toLocaleString()}`}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-brand-100 pt-4 text-base font-semibold text-brand-900">
            <span>Total</span>
            <span>Rs {total.toLocaleString()}</span>
          </div>
          <Link to="/checkout">
            <Button className="mt-6 w-full">
              Proceed to Checkout
            </Button>
          </Link>
          <Link to="/" className="mt-3 block text-center text-sm text-brand-500 hover:text-brand-800">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
