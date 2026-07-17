import { useState } from 'react'
import Button from '../common/Button'

export default function PaymentMethodForm({ onSubmit, onBack, shippingData, loading = false }) {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showBankDetails, setShowBankDetails] = useState(false)

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    setShowBankDetails(method === 'online')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = {
      ...shippingData,
      payment_method: paymentMethod,
      payment_proof_image: null,
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
              <p className="text-sm text-brand-600">Scan QR code to transfer funds instantly</p>
            </div>
          </label>
        </div>
      </div>

      {/* Bank Details Section - Shows when Online Payment is selected */}
      {showBankDetails && (
        <div className="rounded-lg border-2 border-brand-200 p-6 bg-gradient-to-br from-brand-50 to-blush-50">
          <h3 className="font-display font-semibold text-brand-900 mb-4 text-center">Bank Transfer Details</h3>

          <div className="space-y-4">
            {/* QR Code Section */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-brand-600 mb-4 font-medium">📱 Scan this QR code with your UPI/Banking app</p>
              <div className="bg-white p-4 rounded-xl border-2 border-brand-200 shadow-md">
                <img
                  src="https://via.placeholder.com/220x220?text=Bank+QR+Code"
                  alt="Bank QR Code for payment"
                  className="w-56 h-56 rounded-lg"
                />
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="bg-white p-5 rounded-lg border border-brand-200 space-y-3">
              <div className="border-b border-brand-100 pb-3">
                <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Bank Account Details</p>
              </div>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-brand-500 font-medium">Bank Name</p>
                  <p className="text-sm font-semibold text-brand-900">Example Bank Limited</p>
                </div>
                <div>
                  <p className="text-xs text-brand-500 font-medium">Account Number</p>
                  <p className="text-sm font-semibold text-brand-900">1234567890</p>
                </div>
                <div>
                  <p className="text-xs text-brand-500 font-medium">Account Holder</p>
                  <p className="text-sm font-semibold text-brand-900">LEGALIZE DREAMS</p>
                </div>
                <div>
                  <p className="text-xs text-brand-500 font-medium">IFSC Code</p>
                  <p className="text-sm font-semibold text-brand-900">EXPL0001234</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">ℹ️ How to pay:</span> Use your mobile banking app or UPI to scan the QR code above, or transfer manually using the bank details. Your order will be confirmed immediately after payment.
              </p>
            </div>
          </div>
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
