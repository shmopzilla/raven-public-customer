"use client"

import { motion, AnimatePresence } from "motion/react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItemComponent } from "@/components/raven/cart-item"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const getCartTotal = useCartStore((state) => state.getCartTotal)

  const total = getCartTotal()
  const itemCount = items.length
  const totalHours = items.reduce((sum, item) => sum + item.totalHours, 0)

  const handleContinueShopping = () => {
    router.push('/raven/search')
  }

  const handleCheckout = () => {
    router.push('/raven/checkout')
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a1f] to-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1a1a1f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['PP_Editorial_New'] text-3xl sm:text-4xl text-white mb-2">
                Shopping Cart
              </h1>
              <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
                {itemCount > 0
                  ? `${itemCount} ${itemCount === 1 ? 'booking' : 'bookings'} • ${totalHours} hours total`
                  : 'Your cart is empty'}
              </p>
            </div>
            {itemCount > 0 && (
              <button
                onClick={handleClearCart}
                className="font-['Archivo'] text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-32 h-32 mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white/40"
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
            <h2 className="font-['PP_Editorial_New'] text-3xl text-white mb-4">
              Your cart is empty
            </h2>
            <p className="font-['Archivo'] text-base text-[#d5d5d6] mb-8 max-w-md">
              Explore our ski instructors and add some sessions to your cart to get started on your ski adventure.
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-8 py-4 rounded-xl bg-blue-400 text-white font-['Archivo'] font-semibold hover:bg-blue-500 transition-colors"
            >
              Browse Instructors
            </button>
          </motion.div>
        ) : (
          /* Cart Items Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    variant="expanded"
                    onRemove={removeFromCart}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-28 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
              >
                <h3 className="font-['PP_Editorial_New'] text-2xl text-white">
                  Order Summary
                </h3>

                {/* Summary Details */}
                <div className="space-y-3 border-b border-white/10 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                      Bookings
                    </span>
                    <span className="font-['Archivo'] text-sm text-white">
                      {itemCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                      Total Hours
                    </span>
                    <span className="font-['Archivo'] text-sm text-white">
                      {totalHours}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                      Subtotal
                    </span>
                    <span className="font-['Archivo'] text-sm text-white">
                      €{total}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="font-['Archivo'] text-2xl font-bold text-white">
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
                    onClick={handleContinueShopping}
                    className={cn(
                      "w-full py-4 rounded-xl font-['Archivo'] font-semibold transition-all",
                      "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    )}
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-white/10">
                  <p className="font-['Archivo'] text-xs text-[#d5d5d6] text-center">
                    Secure checkout • All bookings are confirmed instantly
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
