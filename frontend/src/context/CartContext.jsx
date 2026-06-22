import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (menuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === menuItem.id)
      if (existing) {
        return prev.map((x) => x.id === menuItem.id ? { ...x, quantity: x.quantity + quantity } : x)
      }
      return [...prev, { ...menuItem, quantity }]
    })
  }

  const updateQuantity = (id, quantity) => {
    setItems((prev) => prev
      .map((x) => x.id === id ? { ...x, quantity } : x)
      .filter((x) => x.quantity > 0))
  }

  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id))
  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, total }), [items, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
