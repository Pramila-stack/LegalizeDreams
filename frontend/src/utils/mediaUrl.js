const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// The API lives at <origin>/api, media at <origin>/media — strip the /api suffix.
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

// Django returns a relative path ('/media/products/x.jpg') for local storage and
// an absolute URL for Cloudinary, so handle both.
export function mediaUrl(path) {
  if (!path || typeof path !== 'string') return path || null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}
