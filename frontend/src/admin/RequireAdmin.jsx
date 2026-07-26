import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return <div className="p-8 text-center text-brand-600">Loading…</div>
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}
