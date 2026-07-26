import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { adminApi, setAdminTokens, clearAdminTokens, getAdminToken } from './adminApi'

const AdminAuthContext = createContext(null)

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function verify() {
      if (!getAdminToken()) {
        if (active) setLoading(false)
        return
      }
      try {
        const me = await adminApi.getMe()
        if (active) setAdmin(me)
      } catch {
        clearAdminTokens()
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    verify()
    return () => { active = false }
  }, [])

  const login = useCallback(async (email, password) => {
    const tokens = await adminApi.login(email, password)
    setAdminTokens(tokens)
    try {
      const me = await adminApi.getMe()
      setAdmin(me)
      return me
    } catch {
      clearAdminTokens()
      setAdmin(null)
      throw new Error('This account is not an admin.')
    }
  }, [])

  const logout = useCallback(() => {
    clearAdminTokens()
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
