import { useState } from 'react'
import Button from '../common/Button'

export default function PaymentMethodForm({ onSubmit, onBack, shippingData, loading = false }) {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showUpload, setShowUpload] = useState(false)
  const [paymentImage, setPaymentImage] = useState(null)

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    setShowUpload(method === 'online')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentImage(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (paymentMethod === 'online' && !paymentImage) {
      alert('Please upload payment proof image')
      return
    }

    const formData = {
      ...shippingData,
      payment_method: paymentMethod,
      payment_proof_image: paymentImage,
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="font-display text-lg font-semibold text-brand-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          {/* COD Option */}
          <label className="flex items-center cursor-pointer p-4 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="h-4 w-4 text-brand-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-brand-900">💵 Cash on Delivery (COD)</p>
              <p className="text-sm text-brand-600">Pay when you receive your order</p>
            </div>
          </label>

          {/* Online Payment Option */}
          <label className="flex items-center cursor-pointer p-4 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="h-4 w-4 text-brand-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-brand-900">🔐 Online Payment</p>
              <p className="text-sm text-brand-600">Upload payment proof to confirm transfer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Upload Payment Proof - Shows when Online Payment is selected */}
      {showUpload && (
        <div className="rounded-lg border-2 border-brand-200 p-6 bg-brand-50">
          <label className="block text-sm font-semibold text-brand-900 mb-3">Upload Payment Proof</label>

          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-2 border-dashed border-brand-300 rounded-lg cursor-pointer hover:bg-white transition-colors">
              <div className="flex flex-col items-center justify-center pt-7">
                <span className="text-3xl mb-2">📸</span>
                <span className="text-sm text-brand-600 font-medium">Click to upload or drag image</span>
                <span className="text-xs text-brand-500 mt-1">PNG, JPG up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {paymentImage && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3 border border-brand-200">
              <span className="text-sm text-brand-900 font-medium truncate">{paymentImage.name}</span>
              <button
                type="button"
                onClick={() => setPaymentImage(null)}
                className="ml-2 text-brand-600 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-colors bg-brand-100 text-brand-900 hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm"
        >
          Back
        </button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </form>
  )
}
