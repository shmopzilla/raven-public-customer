"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useCartStore } from "@/lib/stores/cart-store"
import { cn } from "@/lib/utils"

interface CartBadgeProps {
  onClick: () => void
  className?: string
}

// Routes that render their own mobile sticky bottom bar. On those routes
// the cart badge is nudged up on mobile so it doesn't sit on top of the
// page's primary CTA. Desktop is unaffected.
const ROUTES_WITH_MOBILE_BOTTOM_BAR = ["/raven/profile/"]

export function CartBadge({ onClick, className }: CartBadgeProps) {
  const [isMounted, setIsMounted] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const pathname = usePathname()

  // Prevent hydration errors by only rendering after client mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || itemCount === 0) return null

  const hasMobileBottomBar = ROUTES_WITH_MOBILE_BOTTOM_BAR.some((prefix) =>
    pathname?.startsWith(prefix),
  )

  const positionClass = hasMobileBottomBar
    ? "fixed bottom-24 right-6 z-50 lg:bottom-8 lg:right-8"
    : "fixed bottom-8 right-8 z-50"

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        positionClass,
        "flex items-center gap-3 px-6 py-4 rounded-full",
        "bg-white text-black shadow-2xl",
        "hover:bg-white/90 transition-colors",
        "font-['Archivo'] font-semibold",
        className
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Cart Icon */}
      <svg
        className="w-6 h-6"
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

      {/* Item Count Badge */}
      <AnimatePresence mode="wait">
        <motion.span
          key={itemCount}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-black text-white rounded-full text-sm font-bold"
        >
          {itemCount}
        </motion.span>
      </AnimatePresence>

      <span className="hidden sm:inline">View Cart</span>
    </motion.button>
  )
}
