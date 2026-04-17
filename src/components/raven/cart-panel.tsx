"use client"

import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useModalA11y } from "@/lib/hooks/use-modal-a11y"
import { ShoppingBag, X, ArrowRight } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItemComponent } from "./cart-item"
import { Button } from "@/components/raven/ui"

interface CartPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function CartPanel({ isOpen, onClose }: CartPanelProps) {
  const { modalRef, handleKeyDown } = useModalA11y(isOpen, onClose)
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-[#3B3B40] bg-[rgba(20,20,24,0.95)] shadow-2xl backdrop-blur-[25px]"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-panel-title"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[#3B3B40] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
                    Your cart
                  </p>
                  <h2 id="cart-panel-title" className="mt-1 font-['PP_Editorial_New'] text-2xl text-white sm:text-3xl">
                    {itemCount} {itemCount === 1 ? 'booking' : 'bookings'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close cart"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3B3B40] bg-white/[0.04]">
                    <ShoppingBag
                      className="h-5 w-5 text-white/60"
                      strokeWidth={1.6}
                    />
                  </div>
                  <h3 className="mt-5 font-['PP_Editorial_New'] text-2xl text-white sm:text-3xl">
                    Empty for now.
                  </h3>
                  <p className="mt-2 max-w-xs font-['Archivo'] text-sm text-white/60">
                    Add a session to any instructor and they&apos;ll line up
                    here.
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    className="mt-6"
                    onClick={onClose}
                  >
                    Continue browsing
                  </Button>
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="sticky bottom-0 border-t border-[#3B3B40] p-6">
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
                    Subtotal
                  </span>
                  <span className="font-['PP_Editorial_New'] text-2xl text-white sm:text-3xl">
                    €{total}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button fullWidth size="lg" onClick={handleCheckout}>
                    Proceed to checkout
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </Button>
                  <Button
                    fullWidth
                    size="lg"
                    variant="secondary"
                    onClick={handleViewFullCart}
                  >
                    View full cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
