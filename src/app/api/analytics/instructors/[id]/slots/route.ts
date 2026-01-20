import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'
import type { InstructorSlotDetails, SlotTypeBreakdown, ApiResponse } from '@/lib/analytics/types'

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'  // Handle both 0 and 7 as Sunday
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get instructor info
    const { data: instructor, error: instructorError } = await supabaseServer
      .from('instructors')
      .select('id, first_name, last_name')
      .eq('id', id)
      .single()

    if (instructorError) {
      throw new Error(`Failed to fetch instructor: ${instructorError.message}`)
    }

    if (!instructor) {
      return NextResponse.json({
        success: false,
        error: 'Instructor not found'
      }, { status: 404 })
    }

    // Get all day_slots (slot types)
    const { data: daySlots, error: daySlotsError } = await supabaseServer
      .from('day_slots')
      .select('id, name, default_start_time, default_end_time')
      .order('id')

    if (daySlotsError) {
      throw new Error(`Failed to fetch day slots: ${daySlotsError.message}`)
    }

    // Get all slots for this instructor
    const { data: slots, error: slotsError } = await supabaseServer
      .from('booking_slots')
      .select('date, slot_start_time, slot_end_time, weekday, day_slot_id')
      .eq('instructor_id', id)

    if (slotsError) {
      throw new Error(`Failed to fetch slots: ${slotsError.message}`)
    }

    // Group by slot type and track which days each type is configured for
    const slotTypeData = new Map<number, {
      startTime: string
      endTime: string
      weekdays: Set<number>
      dates: string[]
    }>()

    slots?.forEach(slot => {
      if (!slot.day_slot_id) return

      const existing = slotTypeData.get(slot.day_slot_id) || {
        startTime: slot.slot_start_time || '',
        endTime: slot.slot_end_time || '',
        weekdays: new Set<number>(),
        dates: []
      }

      // Track weekdays this slot type is configured for
      if (slot.weekday !== null && slot.weekday !== undefined) {
        existing.weekdays.add(slot.weekday)
      }

      if (slot.date) {
        existing.dates.push(slot.date)
      }

      // Use the actual times from the slot
      if (slot.slot_start_time) {
        existing.startTime = slot.slot_start_time
      }
      if (slot.slot_end_time) {
        existing.endTime = slot.slot_end_time
      }

      slotTypeData.set(slot.day_slot_id, existing)
    })

    // Build slot type breakdown
    const slotTypes: SlotTypeBreakdown[] = []
    const allDates: string[] = []

    slotTypeData.forEach((data, slotTypeId) => {
      const daySlot = daySlots?.find(ds => ds.id === slotTypeId)
      if (!daySlot) return

      const daysConfigured = Array.from(data.weekdays)
        .sort((a, b) => a - b)
        .map(d => DAY_NAMES[d] || `Day ${d}`)

      slotTypes.push({
        id: slotTypeId,
        name: daySlot.name,
        startTime: data.startTime || daySlot.default_start_time || '',
        endTime: data.endTime || daySlot.default_end_time || '',
        daysConfigured
      })

      allDates.push(...data.dates)
    })

    // Sort slot types by id (which corresponds to their natural order)
    slotTypes.sort((a, b) => a.id - b.id)

    // Calculate date range
    const sortedDates = [...new Set(allDates)].sort()
    const dateRange = sortedDates.length > 0 ? {
      earliest: sortedDates[0],
      latest: sortedDates[sortedDates.length - 1]
    } : null

    const data: InstructorSlotDetails = {
      instructor: {
        id: instructor.id,
        name: `${instructor.first_name} ${instructor.last_name}`.trim()
      },
      slotTypes,
      dateRange
    }

    const response: ApiResponse<InstructorSlotDetails> = {
      success: true,
      data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics instructor slots error:', error)
    const response: ApiResponse<InstructorSlotDetails> = {
      success: false,
      error: 'Failed to fetch instructor slot details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
