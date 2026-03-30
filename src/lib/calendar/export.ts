import type { BookingItem } from './types'

export interface CalendarExportData {
  date: string
  events: BookingItem[]
}

/**
 * Export calendar data as CSV format
 */
export function exportToCSV(bookingItems: BookingItem[], startDate?: string, endDate?: string): string {
  const filteredItems = bookingItems.filter(item => {
    if (!startDate || !endDate) return true
    return item.date >= startDate && item.date <= endDate
  })

  if (filteredItems.length === 0) {
    return 'No data to export'
  }

  const headers = [
    'Date',
    'Start Time',
    'End Time',
    'Duration (minutes)',
    'Hourly Rate',
    'Slot Type',
    'Booking ID',
    'Created At'
  ]

  const slotTypeMap: Record<number, string> = {
    1: 'Full Day',
    2: 'Morning',
    3: 'Lunch',
    4: 'Afternoon',
    5: 'Evening',
    6: 'Night'
  }

  const rows = filteredItems.map(item => [
    item.date,
    item.start_time,
    item.end_time,
    item.total_minutes.toString(),
    item.hourly_rate.toString(),
    slotTypeMap[item.day_slot_id] || 'Unknown',
    item.booking_id.toString(),
    new Date(item.created_at).toLocaleDateString()
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  return csvContent
}

/**
 * Export calendar data as JSON format
 */
export function exportToJSON(bookingItems: BookingItem[], startDate?: string, endDate?: string): string {
  const filteredItems = bookingItems.filter(item => {
    if (!startDate || !endDate) return true
    return item.date >= startDate && item.date <= endDate
  })

  const exportData = {
    exportedAt: new Date().toISOString(),
    dateRange: startDate && endDate ? { startDate, endDate } : null,
    totalItems: filteredItems.length,
    bookingItems: filteredItems
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export calendar data as iCal format
 */
export function exportToICS(bookingItems: BookingItem[], instructorName?: string): string {
  const now = new Date()
  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`)
    return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  }

  const events = bookingItems.map(item => {
    const startDateTime = formatDate(item.date, item.start_time)
    const endDateTime = formatDate(item.date, item.end_time)
    const slotNames: Record<number, string> = {
      1: 'Full Day Session',
      2: 'Morning Session',
      3: 'Lunch Session',
      4: 'Afternoon Session',
      5: 'Evening Session',
      6: 'Night Session'
    }

    return [
      'BEGIN:VEVENT',
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${slotNames[item.day_slot_id] || 'Session'} - ${instructorName || 'Instructor'}`,
      `DESCRIPTION:Booking ID: ${item.booking_id}\\nRate: $${item.hourly_rate}/hour\\nDuration: ${item.total_minutes} minutes`,
      `UID:booking-${item.booking_id}-${item.id}@calendar.example.com`,
      `DTSTAMP:${now.toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
      'END:VEVENT'
    ].join('\r\n')
  }).join('\r\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar App//EN',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR'
  ].join('\r\n')
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export calendar data in various formats
 */
export function exportCalendarData(
  bookingItems: BookingItem[],
  format: 'csv' | 'json' | 'ics',
  startDate?: string,
  endDate?: string,
  instructorName?: string
): void {
  let content: string
  let filename: string
  let mimeType: string

  const dateStr = startDate && endDate
    ? `_${startDate}_to_${endDate}`
    : `_${new Date().toISOString().split('T')[0]}`

  switch (format) {
    case 'csv':
      content = exportToCSV(bookingItems, startDate, endDate)
      filename = `calendar_export${dateStr}.csv`
      mimeType = 'text/csv'
      break
    case 'json':
      content = exportToJSON(bookingItems, startDate, endDate)
      filename = `calendar_export${dateStr}.json`
      mimeType = 'application/json'
      break
    case 'ics':
      content = exportToICS(bookingItems, instructorName)
      filename = `calendar_export${dateStr}.ics`
      mimeType = 'text/calendar'
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }

  downloadFile(content, filename, mimeType)
}