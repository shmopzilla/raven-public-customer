"use client"

import { useMemo } from 'react'
import { cn } from "@/lib/utils"
import { getSlotStates, getBookingItemsForDate } from "@/lib/calendar/utils"
import type { BookingItem, AvailabilitySummary as AvailabilitySummaryType, AvailabilitySlot } from "@/lib/calendar/types"

interface AvailabilitySummaryProps {
  startDate: string
  endDate: string
  bookingItems: BookingItem[]
  className?: string
}

export function AvailabilitySummary({ 
  startDate, 
  endDate, 
  bookingItems, 
  className 
}: AvailabilitySummaryProps) {
  
  const summary = useMemo(() => {
    // Generate all dates in the range
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dates.push(dateStr)
    }
    
    // Calculate availability for each slot type
    const slotTypes = [
      { name: 'Morning', key: 'morning' as const, hours: 3 },
      { name: 'Lunch', key: 'lunch' as const, hours: 2 },
      { name: 'Afternoon', key: 'afternoon' as const, hours: 3 },
      { name: 'Evening', key: 'evening' as const, hours: 3 },
      { name: 'Night', key: 'night' as const, hours: 3 }
    ]
    
    const slots: AvailabilitySlot[] = slotTypes.map(slot => {
      const availableDays = dates.filter(date => {
        const dayBookings = getBookingItemsForDate(bookingItems, date)
        const slotState = getSlotStates(dayBookings)
        return !slotState[slot.key] // Available if not booked
      }).length
      
      return {
        name: slot.name,
        isAvailable: availableDays > 0,
        totalDays: dates.length,
        availableDays
      }
    })
    
    // Calculate total available hours
    const totalAvailableHours = slots.reduce((total, slot) => {
      const slotHours = slotTypes.find(s => s.name === slot.name)?.hours || 0
      return total + (slot.availableDays * slotHours)
    }, 0)
    
    return {
      dateRange: { startDate, endDate },
      totalDays: dates.length,
      slots,
      totalAvailableHours
    } as AvailabilitySummaryType
  }, [startDate, endDate, bookingItems])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getAvailabilityColor = (availableDays: number, totalDays: number) => {
    const percentage = availableDays / totalDays
    if (percentage === 1) return 'text-green-400'
    if (percentage >= 0.75) return 'text-green-300'
    if (percentage >= 0.5) return 'text-yellow-400'
    if (percentage >= 0.25) return 'text-orange-400'
    if (percentage > 0) return 'text-red-400'
    return 'text-gray-500'
  }

  return (
    <div 
      className={cn(
        "bg-white/5 rounded-lg p-6 border border-white/10",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Availability Summary
        </h3>
        <div className="text-gray-300 text-sm">
          <span className="font-medium">{formatDate(startDate)}</span>
          {startDate !== endDate && (
            <>
              <span className="mx-2">→</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </>
          )}
          <span className="ml-3 text-gray-400">
            ({summary.totalDays} day{summary.totalDays !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Slot Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {summary.slots.map((slot) => (
          <div 
            key={slot.name}
            className="bg-white/5 rounded-lg p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{slot.name}</span>
              <div className={cn(
                "text-sm font-semibold",
                getAvailabilityColor(slot.availableDays, slot.totalDays)
              )}>
                {slot.availableDays}/{slot.totalDays}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  slot.availableDays === slot.totalDays ? "bg-green-500" :
                  slot.availableDays >= slot.totalDays * 0.75 ? "bg-green-400" :
                  slot.availableDays >= slot.totalDays * 0.5 ? "bg-yellow-500" :
                  slot.availableDays >= slot.totalDays * 0.25 ? "bg-orange-500" :
                  slot.availableDays > 0 ? "bg-red-500" : "bg-gray-600"
                )}
                style={{ 
                  width: `${slot.totalDays > 0 ? (slot.availableDays / slot.totalDays) * 100 : 0}%` 
                }}
              />
            </div>
            
            <div className="text-xs text-gray-400 mt-1">
              {slot.availableDays > 0 ? `${Math.round((slot.availableDays / slot.totalDays) * 100)}% available` : 'Fully booked'}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
        <div>
          <div className="text-white font-semibold text-lg">
            {summary.totalAvailableHours.toFixed(1)} hours
          </div>
          <div className="text-gray-400 text-sm">Total available</div>
        </div>
        
        {summary.totalAvailableHours > 0 && (
          <button className="px-4 py-2 bg-[#8CDBFB] text-black rounded-lg font-medium hover:bg-[#8CDBFB]/90 transition-colors">
            Book Now
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div>• Morning: 9:00-12:00 (3h) • Lunch: 12:00-14:00 (2h) • Afternoon: 14:00-17:00 (3h)</div>
        <div>• Evening: 17:00-20:00 (3h) • Night: 20:00-23:00 (3h)</div>
      </div>
    </div>
  )
}