import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import ShippingForm from '../components/checkout/ShippingForm'
import PaymentMethodForm from '../components/checkout/PaymentMethodForm'
import Button from '../components/common/Button'
import { Link } from 'react-router-dom'

const SHIPPING_THRESHOLD = 3000
const SHIPPING_FEE = 150

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState('shipping')
  const [shippingData, setShippingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const shipping = items.length === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  const handleShippingSubmit = (data) => {
    setShippingData(data)
    setStep('payment')
    setError(null)
  }

  const handlePaymentSubmit = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      // Create FormData for multipart submission
      const fd = new FormData()

      // Shipping fields
      fd.append('customer_name', formData.customer_name)
      fd.append('customer_email', formData.customer_email)
      fd.append('shipping_address', formData.shipping_address)
      fd.append('city', formData.city)
      fd.append('postal_code', formData.postal_code)
      fd.append('country', formData.country)
      fd.append('customer_phone', formData.customer_phone)

      if (formData.alternative_phone) {
        fd.append('alternative_phone', formData.alternative_phone)
      }

      // Payment method
      fd.append('payment_method', formData.payment_method)

      // Payment proof image (if online payment)
      if (formData.payment_proof_image) {
        fd.append('payment_proof_image', formData.payment_proof_image)
      }

      // Create the order
      await api.createOrder(fd)

      // Clear cart and navigate to success page
      clearCart()
      navigate('/checkout-success', { state: { total } })
    } catch (err) {
      setError(err.message || 'Failed to create order. Please try again.')
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('shipping')
    setError(null)
  }

  // Empty cart message
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="text-5xl" aria-hidden="true">🛍️</span>
        <h1 className="font-display mt-4 text-2xl font-semibold text-brand-900">Your cart is empty</h1>
        <p className="mt-2 text-brand-600">Add items before proceeding to checkout.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-black">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Form Section (2 columns on lg) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-brand-100 p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 'shipping' ? (
              <div>
                <h2 className="font-display mb-6 text-xl font-semibold text-brand-900">Shipping Information</h2>
                <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
              </div>
            ) : (
              <div>
                <h2 className="font-display mb-6 text-xl font-semibold text-brand-900">Payment Method</h2>
                <PaymentMethodForm
                  onSubmit={handlePaymentSubmit}
                  onBack={handleBack}
                  shippingData={shippingData}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="h-fit rounded-2xl border border-brand-100 p-6 sticky top-4">
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

          {/* Bank Details Image */}
          {step === 'payment' && (
            <div className="mt-6 pt-6 border-t border-brand-100">
              <p className="text-xs font-semibold text-brand-900 mb-3">Bank Details</p>
              <img
                src="http://localhost:8000/media/products/bank.png"
                alt="Bank QR Code"
                className="w-full rounded-lg border border-brand-200 shadow-sm"
              />
            </div>
          )}

          <div className="mt-6 space-y-2 text-xs text-brand-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Secure checkout</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Free shipping on orders above Rs 3000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
