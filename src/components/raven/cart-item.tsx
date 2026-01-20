"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/lib/types/cart"
import Image from "next/image"

interface CartItemProps {
  item: CartItem
  variant?: "compact" | "expanded"
  onRemove: (itemId: string) => void
}

export function CartItemComponent({ item, variant = "compact", onRemove }: CartItemProps) {
  const isCompact = variant === "compact"

  // Format date range
  const startDate = new Date(item.selectedSlots[0]?.date)
  const endDate = new Date(item.selectedSlots[item.selectedSlots.length - 1]?.date)
  const dateRange = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    (startDate.getTime() !== endDate.getTime()
      ? ` - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : '')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "bg-white/5 border border-white/10 rounded-xl overflow-hidden",
        isCompact ? "p-4" : "p-6"
      )}
    >
      <div className="flex gap-4">
        {/* Instructor Avatar */}
        <div className={cn(
          "flex-shrink-0 rounded-lg overflow-hidden bg-white/10",
          isCompact ? "w-16 h-16" : "w-20 h-20"
        )}>
          {item.instructorAvatar ? (
            <Image
              src={item.instructorAvatar}
              alt={item.instructorName}
              width={isCompact ? 64 : 80}
              height={isCompact ? 64 : 80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-2xl font-bold">
              {item.instructorName.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-['Archivo'] font-semibold text-white truncate",
                isCompact ? "text-base" : "text-lg"
              )}>
                {item.instructorName}
              </h3>
              <p className="font-['Archivo'] text-sm text-[#d5d5d6] truncate">
                {item.location} • {item.discipline}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              className="flex-shrink-0 text-white/40 hover:text-red-400 transition-colors p-1"
              aria-label="Remove from cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Date and Slots Summary */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#d5d5d6]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-['Archivo']">{dateRange}</span>
            </div>

            {!isCompact && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.selectedSlots.map((slot, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs font-['Archivo'] bg-blue-400/10 text-blue-400 rounded border border-blue-400/20"
                  >
                    {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {slot.daySlotName}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                {item.totalHours} hours • {item.selectedSlots.length} slots
              </span>
              <span className="font-['Archivo'] text-lg font-bold text-white">
                €{item.totalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
