"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { SelectedSlot, DAY_SLOT_NAMES, STANDARD_TIME_SLOTS } from "@/lib/types/cart"
import type { BookingItem } from "@/lib/calendar/types"

interface SlotSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  instructorId: string
  instructorName: string
  startDate: string
  endDate: string
  bookingItems: BookingItem[]
  hourlyRate: number
  onAddToCart: (selectedSlots: SelectedSlot[]) => void
}

interface DaySlot {
  date: string
  daySlotId: number
  daySlotName: string
  isAvailable: boolean
  startTime: string
  endTime: string
  hours: number
  price: number
}

export function SlotSelectionModal({
  isOpen,
  onClose,
  instructorName,
  startDate,
  endDate,
  bookingItems,
  hourlyRate,
  onAddToCart
}: SlotSelectionModalProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())

  // Generate all days in the selected date range
  const dateRange = useMemo(() => {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    return dates
  }, [startDate, endDate])

  // Generate all available slots for all days
  const availableSlots = useMemo(() => {
    const slots: DaySlot[] = []

    dateRange.forEach(date => {
      // Get booked slots for this date
      const bookedSlotsForDate = bookingItems
        .filter(item => item.date === date)
        .map(item => item.day_slot_id)

      // Generate slots for each time period (Morning, Lunch, Afternoon, Evening)
      ;[2, 3, 4, 5].forEach(daySlotId => {
        const isBooked = bookedSlotsForDate.includes(daySlotId)
        const slotConfig = STANDARD_TIME_SLOTS[daySlotId]

        slots.push({
          date,
          daySlotId,
          daySlotName: DAY_SLOT_NAMES[daySlotId],
          isAvailable: !isBooked,
          startTime: slotConfig.start,
          endTime: slotConfig.end,
          hours: slotConfig.hours,
          price: hourlyRate * slotConfig.hours
        })
      })
    })

    return slots
  }, [dateRange, bookingItems, hourlyRate])

  // Group slots by date for display
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, DaySlot[]> = {}
    availableSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = []
      }
      grouped[slot.date].push(slot)
    })
    return grouped
  }, [availableSlots])

  // Calculate totals
  const totals = useMemo(() => {
    let totalHours = 0
    let totalPrice = 0

    selectedSlots.forEach(slotKey => {
      const slot = availableSlots.find(s =>
        `${s.date}-${s.daySlotId}` === slotKey
      )
      if (slot) {
        totalHours += slot.hours
        totalPrice += slot.price
      }
    })

    return { totalHours, totalPrice, itemCount: selectedSlots.size }
  }, [selectedSlots, availableSlots])

  const toggleSlot = (date: string, daySlotId: number) => {
    const slotKey = `${date}-${daySlotId}`
    const newSelected = new Set(selectedSlots)

    if (newSelected.has(slotKey)) {
      newSelected.delete(slotKey)
    } else {
      newSelected.add(slotKey)
    }

    setSelectedSlots(newSelected)
  }

  const handleAddToCart = () => {
    const slots: SelectedSlot[] = []

    selectedSlots.forEach(slotKey => {
      const slot = availableSlots.find(s =>
        `${s.date}-${s.daySlotId}` === slotKey
      )
      if (slot) {
        slots.push({
          date: slot.date,
          daySlotId: slot.daySlotId,
          daySlotName: slot.daySlotName,
          startTime: slot.startTime,
          endTime: slot.endTime,
          hours: slot.hours,
          price: slot.price
        })
      }
    })

    onAddToCart(slots)
    setSelectedSlots(new Set())
    onClose()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1f] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1a1f]/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['PP_Editorial_New'] text-2xl text-white mb-1">
                  Select Your Sessions
                </h2>
                <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
                  with {instructorName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors text-2xl p-2"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {dateRange.map(date => (
              <div key={date} className="space-y-3">
                <h3 className="font-['Archivo'] font-semibold text-white">
                  {formatDate(date)}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {slotsByDate[date]?.map(slot => {
                    const slotKey = `${slot.date}-${slot.daySlotId}`
                    const isSelected = selectedSlots.has(slotKey)

                    return (
                      <motion.button
                        key={slotKey}
                        onClick={() => slot.isAvailable && toggleSlot(slot.date, slot.daySlotId)}
                        disabled={!slot.isAvailable}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all duration-200",
                          "flex flex-col items-start gap-2",
                          slot.isAvailable
                            ? isSelected
                              ? "bg-blue-400/20 border-blue-400 text-white"
                              : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                            : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed opacity-50"
                        )}
                        whileHover={slot.isAvailable ? { scale: 1.02 } : {}}
                        whileTap={slot.isAvailable ? { scale: 0.98 } : {}}
                      >
                        <div className="font-['Archivo'] font-semibold text-sm">
                          {slot.daySlotName}
                        </div>
                        <div className="font-['Archivo'] text-xs opacity-80">
                          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                        </div>
                        <div className="font-['Archivo'] text-xs font-medium">
                          {slot.hours}h · €{slot.price}
                        </div>
                        {!slot.isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-['Archivo'] text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              Booked
                            </span>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-[#1a1a1f]/95 backdrop-blur-md border-t border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-['Archivo'] text-sm text-[#d5d5d6]">
                {totals.itemCount} slot{totals.itemCount !== 1 ? 's' : ''} selected · {totals.totalHours} hours
              </div>
              <div className="font-['Archivo'] text-2xl font-bold text-white">
                €{totals.totalPrice}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={totals.itemCount === 0}
              className={cn(
                "w-full py-4 rounded-xl font-['Archivo'] font-semibold transition-all",
                totals.itemCount > 0
                  ? "bg-blue-400 text-white hover:bg-blue-500"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Add to Cart
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
