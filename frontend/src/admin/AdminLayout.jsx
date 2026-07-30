import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/homepage', label: 'Homepage' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
]

function SidebarInner({ admin, onLogout, onNavigate }) {
  return (
    <>
      <div className="px-6 py-5 text-lg font-semibold">Legalize Dreams</div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10'}`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3 text-sm">
        <div className="truncate px-3 py-1 text-white/60">{admin?.email || admin?.username}</div>
        <button
          onClick={onLogout}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 bg-brand-900 px-4 py-3 text-white lg:hidden">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-base font-semibold">Legalize Dreams</span>
      </div>

      {/* Static sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-900 text-white lg:flex">
        <SidebarInner admin={admin} onLogout={handleLogout} />
      </aside>

      {/* Off-canvas drawer (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-60 max-w-[80%] flex-col bg-brand-900 text-white shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="rounded-lg p-1 text-white/80 hover:bg-white/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SidebarInner admin={admin} onLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
