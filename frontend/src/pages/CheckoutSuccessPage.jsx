import { Link, useLocation } from 'react-router-dom'
import Button from '../components/common/Button'

export default function CheckoutSuccessPage() {
  const location = useLocation()
  const total = location.state?.total || 0

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-5xl" aria-hidden="true">🎉</span>
      <h1 className="font-display mt-4 text-2xl font-semibold text-black animate-slow-text">Order Placed Successfully!</h1>
      <p className="mt-2 text-brand-600 animate-slow-text" style={{animationDelay: '0.2s'}}>
        Thanks for shopping with LEGALIZE DREAMS. A confirmation email has been sent to your registered email address.
      </p>

      {total > 0 && (
        <p className="mt-4 text-lg font-semibold text-black animate-slow-text" style={{animationDelay: '0.4s'}}>
          Order Total: Rs {total.toLocaleString()}
        </p>
      )}

      <Link to="/" className="mt-6 inline-block">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  )
}
