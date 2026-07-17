import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-display text-6xl font-semibold text-brand-900">404</p>
      <h1 className="mt-4 text-xl font-semibold text-brand-900">Page not found</h1>
      <p className="mt-2 text-brand-600">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
