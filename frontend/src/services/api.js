const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Every function below returns a Promise so callers never need to change
export const api = {
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories/`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  },

  async getCategory(slug) {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/`)
    if (!response.ok) return null
    return await response.json()
  },

  async getProducts({ categorySlug, query, limit } = {}) {
    let url = `${API_BASE_URL}/products/`
    const params = new URLSearchParams()

    if (categorySlug) {
      params.append('category', categorySlug)
    }

    if (query) {
      params.append('search', query.trim())
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()

    let result = data.results || data

    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  },

  async getFeaturedProducts(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/products/`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()
    const products = data.results || data
    return products.slice(0, limit)
  },

  async getProduct(slug) {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/`)
    if (!response.ok) return null
    return await response.json()
  },

  async getRelatedProducts(product, limit = 4) {
    if (!product || !product.category) return []

    const response = await fetch(`${API_BASE_URL}/products/?category=${product.category}`)
    if (!response.ok) throw new Error('Failed to fetch related products')
    const data = await response.json()
    const products = data.results || data

    // Filter out the current product and limit results
    return products
      .filter((p) => p.id !== product.id)
      .slice(0, limit)
  },

  async createOrder(formData) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      throw new Error('You must be logged in to place an order. Please log in first.')
    }

    const response = await fetch(`${API_BASE_URL}/orders/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.detail || data?.error || 'Failed to create order'
      throw new Error(errorMessage)
    }

    return data
  },
}
