import type { BookingItem, SlotState } from './types'

/**
 * Calculate which time slots are booked for a specific date
 * @param bookingItems - Array of booking items for the date
 * @returns SlotState object indicating which slots are booked
 */
export function getSlotStates(bookingItems: BookingItem[]): SlotState {
  const slotState: SlotState = {
    fullDay: false,
    morning: false,
    lunch: false,
    afternoon: false,
    evening: false,
    night: false
  }

  // Process each booking item
  bookingItems.forEach(item => {
    switch (item.day_slot_id) {
      case 1: // Full day - mark morning/lunch/afternoon as booked
        slotState.fullDay = true
        slotState.morning = true
        slotState.lunch = true
        slotState.afternoon = true
        break
      case 2: // Morning
        slotState.morning = true
        break
      case 3: // Lunch
        slotState.lunch = true
        break
      case 4: // Afternoon
        slotState.afternoon = true
        break
      case 5: // Evening
        slotState.evening = true
        break
      case 6: // Night
        slotState.night = true
        break
    }
  })

  return slotState
}

/**
 * Filter booking items for a specific date
 * @param bookingItems - All booking items
 * @param date - Date string in YYYY-MM-DD format
 * @returns Filtered booking items for the date
 */
export function getBookingItemsForDate(bookingItems: BookingItem[], date: string): BookingItem[] {
  return bookingItems.filter(item => item.date === date)
}

/**
 * Check if a date is today
 * @param date - Date string in YYYY-MM-DD format
 * @returns Boolean indicating if the date is today
 */
export function isToday(date: string): boolean {
  const today = new Date()
  const todayStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0')
  return date === todayStr
}

/**
 * Get day number from date string
 * @param date - Date string in YYYY-MM-DD format
 * @returns Day number
 */
export function getDayNumber(date: string): number {
  return parseInt(date.split('-')[2], 10)
}

/**
 * Check if date is in current month
 * @param date - Date string in YYYY-MM-DD format
 * @param currentMonth - Current month being displayed (0-11)
 * @param currentYear - Current year being displayed
 * @returns Boolean indicating if date is in current month
 */
export function isCurrentMonth(date: string, currentMonth: number, currentYear: number): boolean {
  const dateObj = new Date(date)
  return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear
}

/**
 * Get month name from month number
 * @param monthNumber - Month number (0-11)
 * @returns Month name
 */
export function getMonthName(monthNumber: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[monthNumber] || 'Unknown'
}

/**
 * Get the number of days in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the first day of the week for a month (0 = Sunday, 6 = Saturday)
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Day of week (0-6)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}