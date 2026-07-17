import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'lune.cart'

function readInitialCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        )
      }
      return [
        ...prev,
        { id: product.id, name: product.name, slug: product.slug, price: product.price, categorySlug: product.categorySlug, qty },
      ]
    })
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) return
    setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, qty } : item)))
  }

  function clearCart() {
    setItems([])
  }

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
    return { itemCount, subtotal }
  }, [items])

  const value = { items, addToCart, removeFromCart, updateQty, clearCart, ...totals }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
