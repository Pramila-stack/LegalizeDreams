const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const TOKEN_KEY = 'admin_access_token'
const REFRESH_KEY = 'admin_refresh_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminTokens({ access, refresh }) {
  if (access) localStorage.setItem(TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearAdminTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getAdminToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let payload
  if (body && isForm) {
    payload = body
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload })
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401) {
      clearAdminTokens()
      if (!window.location.pathname.endsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    let message = data?.detail || data?.error
    if (!message && data && typeof data === 'object') {
      message = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ')
    }
    const err = new Error(message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const adminApi = {
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.detail || data?.non_field_errors?.[0] || 'Invalid email or password.')
    return data
  },
  getMe: () => request('/admin/me/'),
  getStats: () => request('/admin/stats/'),
  listCategories: () => request('/admin/categories/'),
  createCategory: (body) => request('/admin/categories/', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/admin/categories/${id}/`, { method: 'PATCH', body }),
  deleteCategory: (id) => request(`/admin/categories/${id}/`, { method: 'DELETE' }),
  listProducts: () => request('/admin/products/'),
  getProduct: (id) => request(`/admin/products/${id}/`),
  createProduct: (formData) => request('/admin/products/', { method: 'POST', body: formData, isForm: true }),
  updateProduct: (id, formData) => request(`/admin/products/${id}/`, { method: 'PATCH', body: formData, isForm: true }),
  deleteProduct: (id) => request(`/admin/products/${id}/`, { method: 'DELETE' }),
  getHeroSettings: () => request('/admin/hero-settings/'),
  updateHeroSettings: (body) => request('/admin/hero-settings/', { method: 'PATCH', body }),
  listHeroVideos: () => request('/admin/hero-videos/'),
  createHeroVideo: (formData) => request('/admin/hero-videos/', { method: 'POST', body: formData, isForm: true }),
  updateHeroVideo: (id, formData) => request(`/admin/hero-videos/${id}/`, { method: 'PATCH', body: formData, isForm: true }),
  deleteHeroVideo: (id) => request(`/admin/hero-videos/${id}/`, { method: 'DELETE' }),
}
