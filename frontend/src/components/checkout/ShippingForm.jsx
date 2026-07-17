import { useState } from 'react'
import Button from '../common/Button'

export default function ShippingForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    shipping_address: '',
    city: '',
    postal_code: '',
    country: '',
    customer_phone: '',
    alternative_phone: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = 'Name must be at least 2 characters'
    }

    if (!formData.customer_email) {
      newErrors.customer_email = 'Email is required'
    }

    if (!formData.shipping_address) {
      newErrors.shipping_address = 'Address is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.postal_code) {
      newErrors.postal_code = 'Postal code is required'
    }

    if (!formData.country) {
      newErrors.country = 'Country is required'
    }

    if (!formData.customer_phone || formData.customer_phone.replace(/\D/g, '').length < 10) {
      newErrors.customer_phone = 'Valid phone number required (min 10 digits)'
    }

    // alternative_phone is optional, no validation needed

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear errors and call onSubmit callback
    setErrors({})
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name and Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-brand-900">
            Full Name
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="John Doe"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.customer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-brand-900">
            Email Address
          </label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.customer_email && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="shipping_address" className="block text-sm font-medium text-brand-900">
          Shipping Address
        </label>
        <textarea
          id="shipping_address"
          name="shipping_address"
          value={formData.shipping_address}
          onChange={handleChange}
          placeholder="123 Main St, Apt 4B"
          rows="3"
          className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        />
        {errors.shipping_address && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
        )}
      </div>

      {/* City, Postal Code, Country */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-brand-900">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-brand-900">
            Postal Code
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="10001"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.postal_code && (
            <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-brand-900">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="United States"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
      </div>

      {/* Phone Numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customer_phone" className="block text-sm font-medium text-brand-900">
            Phone Number
          </label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.customer_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="alternative_phone" className="block text-sm font-medium text-brand-900">
            Alternative Phone (Optional)
          </label>
          <input
            type="tel"
            id="alternative_phone"
            name="alternative_phone"
            value={formData.alternative_phone}
            onChange={handleChange}
            placeholder="+1 (555) 987-6543"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          {errors.alternative_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.alternative_phone}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  )
}
