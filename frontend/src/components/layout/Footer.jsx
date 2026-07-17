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
    <footer className="bg-brand-500 text-blue-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold text-white">LEGALIZE DREAMS</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-blue-50">
            Fashion accessories, skincare and makeup curated for your everyday glow.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="rounded-full border border-blue-300 px-3 py-1.5 text-xs text-blue-50 hover:border-white hover:text-white bg-brand-500 hover:bg-brand-400"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} className="text-blue-50 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/cart" className="text-blue-50 hover:text-white">Shopping Cart</Link></li>
            <li><a href="#faq" className="text-blue-50 hover:text-white">FAQs</a></li>
            <li><a href="#" className="text-blue-50 hover:text-white">Shipping Policy</a></li>
            <li><a href="#" className="text-blue-50 hover:text-white">Returns Policy</a></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Company</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="text-blue-50 hover:text-white">About Us</a></li>
            <li><a href="#" className="text-blue-50 hover:text-white">Contact</a></li>
            <li><a href="#" className="text-blue-50 hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="text-blue-50 hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-500 py-5 text-center text-xs text-blue-50">
        © {new Date().getFullYear()} LEGALIZE DREAMS. All rights reserved.
      </div>
    </footer>
  )
}
