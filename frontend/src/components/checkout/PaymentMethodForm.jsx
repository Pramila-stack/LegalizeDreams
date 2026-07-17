import { useState } from 'react'
import Button from '../common/Button'

export default function PaymentMethodForm({ onSubmit, onBack, shippingData, loading = false }) {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [paymentImage, setPaymentImage] = useState(null)

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    if (method === 'online') {
      setShowImageUpload(true)
    } else {
      setShowImageUpload(false)
      setPaymentImage(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setPaymentImage(file)
    }
  }

  const handleDeleteImage = () => {
    setPaymentImage(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation: if online payment, payment proof is required
    if (paymentMethod === 'online' && !paymentImage) {
      alert('Please upload a payment proof image')
      return
    }

    // Merge data and call onSubmit
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
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          {/* COD Option */}
          <label className="flex items-center cursor-pointer p-3 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="h-4 w-4 text-brand-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-brand-900">Cash on Delivery (COD)</p>
              <p className="text-sm text-brand-600">Pay when you receive your order</p>
            </div>
          </label>

          {/* Online Payment Option */}
          <label className="flex items-center cursor-pointer p-3 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="h-4 w-4 text-brand-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-brand-900">Online Payment</p>
              <p className="text-sm text-brand-600">Pay now using online transfer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Conditional Image Upload Section */}
      {showImageUpload && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-brand-900">Upload Payment Proof</label>

          <div className="rounded-lg border-2 border-dashed border-brand-300 p-4">
            <label htmlFor="paymentProof" className="flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer hover:bg-brand-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-3xl mb-2">📸</span>
                <p className="text-sm text-brand-600">Click to upload screenshot/proof</p>
              </div>
              <input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* File Display */}
          {paymentImage && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-brand-50 p-3 border border-brand-200">
              <span className="text-sm text-brand-900 font-medium">{paymentImage.name}</span>
              <button
                type="button"
                onClick={handleDeleteImage}
                className="ml-2 flex items-center justify-center w-6 h-6 rounded-full hover:bg-brand-200 transition-colors text-brand-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm"
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
