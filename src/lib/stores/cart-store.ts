import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, SelectedSlot } from '@/lib/types/cart'

interface CartState {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt' | 'totalHours' | 'totalPrice'>) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        // Calculate totals
        const totalHours = item.selectedSlots.reduce((sum, slot) => sum + slot.hours, 0)
        const totalPrice = item.selectedSlots.reduce((sum, slot) => sum + slot.price, 0)

        // Create complete cart item
        const cartItem: CartItem = {
          ...item,
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          totalHours,
          totalPrice,
          addedAt: Date.now()
        }

        set((state) => ({
          items: [...state.items, cartItem]
        }))
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId)
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getCartTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.totalPrice, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.length
      }
    }),
    {
      name: 'raven-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
