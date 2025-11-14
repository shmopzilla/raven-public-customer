export interface BookingItem {
  id: number
  booking_id: number
  booking_slot_id: number
  day_slot_id: number
  date: string
  start_time: string
  end_time: string
  total_minutes: number
  hourly_rate: number
  offer_id: number
  created_at: string
}

export interface DaySlot {
  id: number
  name: string
  default_start_time: string
  default_end_time: string
}

export interface CalendarDayProps {
  date: string
  dayNumber: number
  bookingItems: BookingItem[]
  showBookingIndicators?: boolean
  isCurrentMonth?: boolean
  isToday?: boolean
  isStartDate?: boolean
  isEndDate?: boolean
  isInRange?: boolean
  isSelectable?: boolean
  onClick?: () => void
  className?: string
}

export interface SlotState {
  morning: boolean    // day_slot_id = 2
  lunch: boolean      // day_slot_id = 3
  afternoon: boolean  // day_slot_id = 4
  evening: boolean    // day_slot_id = 5
}

export interface SlotIndicatorProps {
  slotState: SlotState
  className?: string
}

// Map day_slot_id to position in the 4-segment indicator
export const DAY_SLOT_MAPPING = {
  1: 'fullDay',    // Full day - all segments
  2: 'morning',    // Morning - segment 1
  3: 'lunch',      // Lunch - segment 2
  4: 'afternoon',  // Afternoon - segment 3
  5: 'evening'     // Evening - segment 4
} as const

export type DaySlotType = keyof typeof DAY_SLOT_MAPPING

export interface CalendarProps {
  bookingItems?: BookingItem[]
  onDayClick?: (date: string, dayNumber: number) => void
  onRangeSelect?: (startDate: string, endDate: string) => void
  selectionMode?: 'single' | 'range'
  showBookingIndicators?: boolean
  className?: string
  initialMonth?: number
  initialYear?: number
}

export interface CalendarDayData {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

export interface DateRange {
  startDate: string | null
  endDate: string | null
}

export interface AvailabilitySlot {
  name: string
  isAvailable: boolean
  totalDays: number
  availableDays: number
}

export interface AvailabilitySummary {
  dateRange: DateRange
  totalDays: number
  slots: AvailabilitySlot[]
  totalAvailableHours: number
}