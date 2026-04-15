import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'shopping_cart'
const CartContext = createContext(null)

function parseStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (_) {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(parseStoredCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1)
    const normalized = {
      id: product.id,
      nombre: product.nombre || product.name,
      precio: Number(product.precio ?? product.price ?? 0),
      cantidad: safeQuantity,
      imagen: product.imagen || product.image || null,
    }

    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === normalized.id)
      if (index === -1) return [...prev, normalized]

      const next = [...prev]
      next[index] = {
        ...next[index],
        cantidad: next[index].cantidad + safeQuantity,
      }
      return next
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1)
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: safeQuantity } : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const totals = useMemo(() => {
    const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)
    const totalPrice = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    return { totalItems, totalPrice }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice,
    }),
    [items, totals],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
