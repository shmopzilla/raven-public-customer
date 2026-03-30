"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { SelectedSlot, DAY_SLOT_NAMES, STANDARD_TIME_SLOTS, FULL_DAY_COVERS_SLOTS } from "@/lib/types/cart"
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

/** Individual slot IDs (everything except Full Day) */
const INDIVIDUAL_SLOT_IDS = [2, 3, 4, 5, 6] as const

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

  // Generate all available slots for all days (Full Day + individual slots)
  const availableSlots = useMemo(() => {
    const slots: DaySlot[] = []

    dateRange.forEach(date => {
      // Get booked slots for this date
      const bookedSlotsForDate = bookingItems
        .filter(item => item.date === date)
        .map(item => item.day_slot_id)

      // Full Day slot (ID 1)
      const fullDaySlotConfig = STANDARD_TIME_SLOTS[1]
      const isFullDayBooked = bookedSlotsForDate.includes(1)
      // Full Day is also unavailable if any of the individual slots it covers are booked
      const coveredSlotsBooked = FULL_DAY_COVERS_SLOTS.some(id => bookedSlotsForDate.includes(id))

      slots.push({
        date,
        daySlotId: 1,
        daySlotName: DAY_SLOT_NAMES[1],
        isAvailable: !isFullDayBooked && !coveredSlotsBooked,
        startTime: fullDaySlotConfig.start,
        endTime: fullDaySlotConfig.end,
        hours: fullDaySlotConfig.hours,
        price: hourlyRate * fullDaySlotConfig.hours
      })

      // Individual slots (Morning, Lunch, Afternoon, Evening, Night)
      INDIVIDUAL_SLOT_IDS.forEach(daySlotId => {
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

  // Group ALL slots (including full day) by date in display order
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
      // Deselecting
      newSelected.delete(slotKey)
    } else {
      // Selecting — handle mutual exclusivity
      if (daySlotId === 1) {
        // Selecting Full Day → remove any individual covered slots for this date
        FULL_DAY_COVERS_SLOTS.forEach(id => {
          newSelected.delete(`${date}-${id}`)
        })
        newSelected.add(slotKey)
      } else {
        // Selecting an individual slot
        if ((FULL_DAY_COVERS_SLOTS as readonly number[]).includes(daySlotId)) {
          // This slot is covered by Full Day — remove Full Day if selected
          newSelected.delete(`${date}-1`)
        }
        newSelected.add(slotKey)
      }
    }

    setSelectedSlots(newSelected)
  }

  /** Check if an individual slot is disabled because Full Day is selected */
  const isDisabledByFullDay = (date: string, daySlotId: number): boolean => {
    if (daySlotId === 1) return false
    if (!(FULL_DAY_COVERS_SLOTS as readonly number[]).includes(daySlotId)) return false
    return selectedSlots.has(`${date}-1`)
  }

  /** Check if Full Day is disabled because covered individual slots are selected */
  const isFullDayDisabledByIndividual = (date: string): boolean => {
    return FULL_DAY_COVERS_SLOTS.some(id => selectedSlots.has(`${date}-${id}`))
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

  const formatDateParts = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    }
  }

  /** Icon per slot type */
  const slotIcon = (daySlotId: number) => {
    switch (daySlotId) {
      case 1: // Full Day — sun with horizon
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" /><path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" /><path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )
      case 2: // Morning — sunrise
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" /><path d="m4.93 5.93 1.41 1.41" /><path d="m17.66 7.34 1.41-1.41" />
            <path d="M2 16h20" /><path d="M7 16a5 5 0 0 1 10 0" />
          </svg>
        )
      case 3: // Lunch — utensils
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        )
      case 4: // Afternoon — sun
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 4V2" /><path d="M12 22v-2" />
            <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" /><path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )
      case 5: // Evening — sunset
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10V2" /><path d="m4.93 10.93 1.41 1.41" /><path d="m17.66 12.34 1.41-1.41" />
            <path d="M2 18h20" /><path d="M7 18a5 5 0 0 1 10 0" />
          </svg>
        )
      case 6: // Night — moon
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )
      default:
        return null
    }
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
          <div className="flex-1 overflow-y-auto">
            {dateRange.map((date, idx) => {
              const allSlots = slotsByDate[date]
              if (!allSlots) return null
              const dateParts = formatDateParts(date)
              const isFullDaySelected = selectedSlots.has(`${date}-1`)
              const fullDayDisabled = isFullDayDisabledByIndividual(date)

              return (
                <div
                  key={date}
                  className={cn(
                    "flex items-stretch",
                    idx > 0 && "border-t border-white/10"
                  )}
                >
                  {/* Date label — fixed left column */}
                  <div className="flex-shrink-0 w-16 md:w-20 flex flex-col items-center justify-center py-5 border-r border-white/10">
                    <span className="font-['Archivo'] text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                      {dateParts.weekday}
                    </span>
                    <span className="font-['Archivo'] text-2xl font-bold text-white leading-tight">
                      {dateParts.day}
                    </span>
                    <span className="font-['Archivo'] text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                      {dateParts.month}
                    </span>
                  </div>

                  {/* Slot cards — horizontal scroll */}
                  <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 p-3 min-w-max">
                      {allSlots.map(slot => {
                        const slotKey = `${slot.date}-${slot.daySlotId}`
                        const isSelected = selectedSlots.has(slotKey)
                        const disabledByFD = isDisabledByFullDay(slot.date, slot.daySlotId)
                        const isFullDay = slot.daySlotId === 1
                        const isClickable = slot.isAvailable && !disabledByFD && !(isFullDay && fullDayDisabled)

                        return (
                          <motion.button
                            key={slotKey}
                            onClick={() => isClickable && toggleSlot(slot.date, slot.daySlotId)}
                            disabled={!isClickable}
                            className={cn(
                              "relative flex flex-col items-center gap-1.5 rounded-xl border transition-all duration-200",
                              "w-[100px] md:w-[110px] flex-shrink-0 px-3 py-3",
                              isClickable
                                ? isSelected
                                  ? isFullDay
                                    ? "bg-amber-400/15 border-amber-400 text-white"
                                    : "bg-blue-400/15 border-blue-400 text-white"
                                  : "bg-white/[0.04] border-white/15 text-white hover:bg-white/[0.08] hover:border-white/25"
                                : "bg-white/[0.02] border-white/10 text-white/25 cursor-not-allowed"
                            )}
                            whileHover={isClickable ? { scale: 1.04 } : {}}
                            whileTap={isClickable ? { scale: 0.96 } : {}}
                          >
                            {/* Icon */}
                            <div className={cn(
                              "opacity-60",
                              isSelected && (isFullDay ? "text-amber-400 opacity-100" : "text-blue-400 opacity-100")
                            )}>
                              {slotIcon(slot.daySlotId)}
                            </div>

                            {/* Slot name */}
                            <div className="font-['Archivo'] font-semibold text-xs leading-tight text-center">
                              {slot.daySlotName}
                            </div>

                            {/* Time range */}
                            <div className="font-['Archivo'] text-[10px] opacity-50 leading-tight">
                              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                            </div>

                            {/* Price */}
                            <div className={cn(
                              "font-['Archivo'] text-sm font-bold mt-0.5",
                              isSelected && (isFullDay ? "text-amber-400" : "text-blue-400")
                            )}>
                              €{slot.price}
                            </div>

                            {/* Booked overlay */}
                            {!slot.isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                <span className="font-['Archivo'] text-[10px] font-semibold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                                  Booked
                                </span>
                              </div>
                            )}

                            {/* Covered by Full Day overlay */}
                            {disabledByFD && slot.isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                                <span className="font-['Archivo'] text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                                  Inc. Full Day
                                </span>
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
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
