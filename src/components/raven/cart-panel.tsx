"use client"

import { motion, AnimatePresence } from "motion/react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItemComponent } from "./cart-item"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CartPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function CartPanel({ isOpen, onClose }: CartPanelProps) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const getCartTotal = useCartStore((state) => state.getCartTotal)

  const total = getCartTotal()
  const itemCount = items.length

  const handleViewFullCart = () => {
    router.push('/raven/cart')
    onClose()
  }

  const handleCheckout = () => {
    router.push('/raven/checkout')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#1a1a1f] border-l border-white/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1a1a1f]/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['PP_Editorial_New'] text-2xl text-white mb-1">
                    Your Cart
                  </h2>
                  <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
                    {itemCount} {itemCount === 1 ? 'booking' : 'bookings'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors text-2xl p-2"
                  aria-label="Close cart"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-['PP_Editorial_New'] text-xl text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6">
                    Add some instructor sessions to get started
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-lg bg-blue-400 text-white font-['Archivo'] font-semibold hover:bg-blue-500 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItemComponent
                        key={item.id}
                        item={item}
                        variant="compact"
                        onRemove={removeFromCart}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            {items.length > 0 && (
              <div className="sticky bottom-0 bg-[#1a1a1f]/95 backdrop-blur-md border-t border-white/10 p-6">
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                    Subtotal
                  </span>
                  <span className="font-['Archivo'] text-xl font-bold text-white">
                    €{total}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className={cn(
                      "w-full py-4 rounded-xl font-['Archivo'] font-semibold transition-all",
                      "bg-blue-400 text-white hover:bg-blue-500"
                    )}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={handleViewFullCart}
                    className={cn(
                      "w-full py-4 rounded-xl font-['Archivo'] font-semibold transition-all",
                      "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    )}
                  >
                    View Full Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
