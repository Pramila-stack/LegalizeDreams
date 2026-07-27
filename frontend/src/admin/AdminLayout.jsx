import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/homepage', label: 'Homepage' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
]

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 bg-brand-900 text-white flex flex-col">
        <div className="px-6 py-5 text-lg font-semibold">Legalize Dreams</div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-sm">
          <div className="px-3 py-1 text-white/60 truncate">{admin?.email || admin?.username}</div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
