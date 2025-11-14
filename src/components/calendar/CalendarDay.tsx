"use client"

import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from "@/lib/utils"
import { SlotIndicator } from "./SlotIndicator"
import { getSlotStates, getBookingItemsForDate } from "@/lib/calendar/utils"
import type { CalendarDayProps } from "@/lib/calendar/types"

export const CalendarDay = memo(function CalendarDay({
  date,
  dayNumber,
  bookingItems,
  showBookingIndicators = true,
  isCurrentMonth = true,
  isToday = false,
  isStartDate = false,
  isEndDate = false,
  isInRange = false,
  isSelectable = true,
  onClick,
  className
}: CalendarDayProps) {
  
  // Get booking items for this specific date
  const dayBookings = getBookingItemsForDate(bookingItems, date)
  
  // Calculate which slots are booked
  const slotState = getSlotStates(dayBookings)
  
  return (
    <motion.div
      className={cn(
        "box-border flex flex-col gap-2 items-center justify-center overflow-clip px-[3px] py-2 relative rounded-xl size-full transition-all duration-200",
        // Base styling
        isSelectable && "cursor-pointer",
        !isSelectable && "cursor-not-allowed opacity-60",
        // Current month styling
        isCurrentMonth ? "opacity-100" : "opacity-50",
        // Range selection styling - stronger, more vibrant selected state
        (isStartDate || isEndDate) && "bg-white/20 border-2 border-white/40",
        isInRange && !isStartDate && !isEndDate && "bg-white/15 border border-white/20",
        // Rounded corners for range
        isStartDate && !isEndDate && "rounded-l-xl rounded-r-none",
        isEndDate && !isStartDate && "rounded-r-xl rounded-l-none",
        isStartDate && isEndDate && "rounded-xl", // Single day selection
        isInRange && !isStartDate && !isEndDate && "rounded-none",
        // Today highlight removed per user request
        className
      )}
      onClick={isSelectable ? onClick : undefined}
      whileHover={isSelectable ? {
        scale: 1.05,
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : undefined}
      whileTap={isSelectable ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : undefined}
      data-name="calendar-day"
      data-date={date}
    >
      {/* Day Number */}
      <motion.div
        className={cn(
          "font-['Archivo'] font-semibold text-[18px] text-center tracking-tight w-full leading-tight relative",
          isCurrentMonth ? "text-white" : "text-white/50",
          (isStartDate || isEndDate) && "text-white font-bold text-[20px]",
          isToday && "font-bold"
        )}
        data-name="day-number"
      >
        {dayNumber}
        {/* Today indicator removed per user request */}
      </motion.div>
      
      {/* Slot Indicator */}
      {showBookingIndicators && (
        <SlotIndicator
          slotState={slotState}
          className={cn(
            !isCurrentMonth && "opacity-50"
          )}
        />
      )}
      
    </motion.div>
  )
})