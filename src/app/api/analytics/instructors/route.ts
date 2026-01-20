import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'
import type { InstructorsAnalyticsData, InstructorWithAvailability, ApiResponse } from '@/lib/analytics/types'

export async function GET() {
  try {
    // Get all instructors
    const { data: instructors, error: instructorsError } = await supabaseServer
      .from('instructors')
      .select('id, first_name, last_name')
      .order('first_name')

    if (instructorsError) {
      throw new Error(`Failed to fetch instructors: ${instructorsError.message}`)
    }

    // Get all day_slots (slot types)
    const { data: daySlots, error: daySlotsError } = await supabaseServer
      .from('day_slots')
      .select('id, name')
      .order('id')

    if (daySlotsError) {
      throw new Error(`Failed to fetch day slots: ${daySlotsError.message}`)
    }

    // Create a map of day_slot_id to name
    const daySlotNames = new Map<number, string>()
    daySlots?.forEach(ds => daySlotNames.set(ds.id, ds.name))

    // Get booking slots grouped by instructor
    const { data: slots, error: slotsError } = await supabaseServer
      .from('booking_slots')
      .select('instructor_id, day_slot_id, date')

    if (slotsError) {
      throw new Error(`Failed to fetch booking slots: ${slotsError.message}`)
    }

    // Group slot types by instructor
    const slotTypesByInstructor = new Map<string, {
      slotTypeIds: Set<number>
      dates: string[]
    }>()

    slots?.forEach(slot => {
      const existing = slotTypesByInstructor.get(slot.instructor_id) || {
        slotTypeIds: new Set<number>(),
        dates: []
      }
      if (slot.day_slot_id) {
        existing.slotTypeIds.add(slot.day_slot_id)
      }
      if (slot.date) {
        existing.dates.push(slot.date)
      }
      slotTypesByInstructor.set(slot.instructor_id, existing)
    })

    // Build instructor list with slot type data (include ALL instructors)
    const instructorsWithAvailability: InstructorWithAvailability[] = (instructors || [])
      .map(instructor => {
        const slotData = slotTypesByInstructor.get(instructor.id)

        if (slotData && slotData.slotTypeIds.size > 0) {
          const sortedDates = [...new Set(slotData.dates)].sort()
          const slotTypeNames = Array.from(slotData.slotTypeIds)
            .map(id => daySlotNames.get(id) || `Unknown (${id})`)
            .sort()

          return {
            id: instructor.id,
            name: `${instructor.first_name} ${instructor.last_name}`.trim(),
            slotTypeCount: slotData.slotTypeIds.size,
            slotTypes: slotTypeNames,
            dateRange: sortedDates.length > 0 ? {
              earliest: sortedDates[0],
              latest: sortedDates[sortedDates.length - 1]
            } : null
          }
        }

        // Instructor with no slot types
        return {
          id: instructor.id,
          name: `${instructor.first_name} ${instructor.last_name}`.trim(),
          slotTypeCount: 0,
          slotTypes: [],
          dateRange: null
        }
      })
      .sort((a, b) => b.slotTypeCount - a.slotTypeCount)

    const instructorsWithSlotTypes = instructorsWithAvailability.filter(i => i.slotTypeCount > 0)

    const data: InstructorsAnalyticsData = {
      instructors: instructorsWithAvailability,
      summary: {
        totalInstructorsWithSlotTypes: instructorsWithSlotTypes.length,
        totalInstructors: instructors?.length || 0
      }
    }

    const response: ApiResponse<InstructorsAnalyticsData> = {
      success: true,
      data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics instructors error:', error)
    const response: ApiResponse<InstructorsAnalyticsData> = {
      success: false,
      error: 'Failed to fetch instructor analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
