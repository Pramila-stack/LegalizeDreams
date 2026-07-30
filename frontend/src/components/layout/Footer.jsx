import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const socials = [
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'Facebook', href: '#' },
]

export default function Footer() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        setCategories(data.results || data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <footer className="border-t border-brand-200 bg-brand-100 text-brand-700">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold text-brand-900">LEGALIZE DREAMS</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-700">
            Fashion accessories, skincare and makeup curated for your everyday glow.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="rounded-full border border-brand-300 px-3 py-1.5 text-xs text-brand-700 hover:border-brand-600 hover:text-brand-900 hover:bg-brand-50 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-900">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} className="text-brand-700 hover:text-brand-900">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-900">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/cart" className="text-brand-700 hover:text-brand-900">Shopping Cart</Link></li>
            <li><a href="#faq" className="text-brand-700 hover:text-brand-900">FAQs</a></li>
            <li><a href="#" className="text-brand-700 hover:text-brand-900">Shipping Policy</a></li>
            <li><a href="#" className="text-brand-700 hover:text-brand-900">Returns Policy</a></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-900">Company</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="text-brand-700 hover:text-brand-900">About Us</a></li>
            <li><a href="#" className="text-brand-700 hover:text-brand-900">Contact</a></li>
            <li><a href="#" className="text-brand-700 hover:text-brand-900">Terms of Service</a></li>
            <li><a href="#" className="text-brand-700 hover:text-brand-900">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-200 py-5 text-center text-xs text-brand-700">
        © {new Date().getFullYear()} LEGALIZE DREAMS. All rights reserved.
      </div>
    </footer>
  )
}
