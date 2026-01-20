/**
 * Cart type definitions for ski instructor booking cart
 */

/**
 * Represents a selected time slot within a day
 */
export interface SelectedSlot {
  date: string              // YYYY-MM-DD format
  daySlotId: number        // 2=Morning, 3=Lunch, 4=Afternoon, 5=Evening
  daySlotName: string      // "Morning", "Lunch", "Afternoon", "Evening"
  startTime: string        // HH:MM:SS format
  endTime: string          // HH:MM:SS format
  hours: number            // Duration in hours
  price: number            // Price for this slot (hourlyRate * hours)
}

/**
 * Represents a complete booking item in the cart
 */
export interface CartItem {
  id: string                    // Unique cart item ID (generated)
  instructorId: string
  instructorName: string
  instructorAvatar: string
  location: string
  discipline: string
  selectedSlots: SelectedSlot[] // Array of time slots selected across date range
  totalHours: number            // Sum of all slot hours
  totalPrice: number            // Sum of all slot prices
  pricePerHour: number         // Hourly rate for reference
  addedAt: number              // Timestamp when added to cart
}

/**
 * Day slot ID to name mapping
 */
export const DAY_SLOT_NAMES: Record<number, string> = {
  1: "Full Day",
  2: "Morning",
  3: "Lunch",
  4: "Afternoon",
  5: "Evening"
}

/**
 * Standard time slot definitions (used when creating available slots)
 */
export const STANDARD_TIME_SLOTS: Record<number, { start: string; end: string; hours: number }> = {
  2: { start: "09:00:00", end: "12:00:00", hours: 3 },  // Morning
  3: { start: "12:00:00", end: "14:00:00", hours: 2 },  // Lunch
  4: { start: "14:00:00", end: "17:00:00", hours: 3 },  // Afternoon
  5: { start: "17:00:00", end: "20:00:00", hours: 3 }   // Evening
}
