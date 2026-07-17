import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useCart } from '../../context/CartContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const { itemCount } = useCart()

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

  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="bg-brand-900 py-1.5 text-center text-xs tracking-wide text-white">
        Free shipping on orders over Rs 3,000 · New arrivals every week
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          className="p-1 text-brand-800 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>

        <Link to="/" className="mr-2 font-display text-2xl font-semibold tracking-wide text-brand-900">
          LEGALIZE DREAMS
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-brand-900' : 'text-brand-500 hover:text-brand-800'}`
            }
          >
            Home
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-800">
              Shop
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full grid w-[420px] grid-cols-2 gap-1 rounded-xl border border-brand-100 bg-white p-3 shadow-xl">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.slug}`}
                    className="rounded-lg px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-brand-900' : 'text-brand-500 hover:text-brand-800'}`
            }
          >
            Cart
          </NavLink>
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-xs flex-1 items-center lg:flex">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-brand-200 bg-brand-50/60 px-4 py-2 text-sm outline-none focus:border-brand-400"
          />
        </form>

        <Link
          to="/cart"
          className="relative ml-auto flex items-center justify-center rounded-full p-2 text-brand-800 hover:bg-brand-50 lg:ml-3"
          aria-label="View cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blush-400 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-100 px-4 pb-4 lg:hidden">
          <form onSubmit={handleSearch} className="mt-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-brand-200 bg-brand-50/60 px-4 py-2 text-sm outline-none focus:border-brand-400"
            />
          </form>
          <nav className="mt-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
              Home
            </Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
              Cart
            </Link>
            <p className="mt-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-400">Shop by category</p>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2 text-sm text-brand-700 hover:bg-brand-50"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
