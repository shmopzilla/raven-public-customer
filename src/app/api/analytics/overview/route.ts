import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'
import type { OverviewData, ApiResponse } from '@/lib/analytics/types'

export async function GET() {
  try {
    // Get instructor count
    const { count: instructorCount, error: instructorError } = await supabaseServer
      .from('instructors')
      .select('*', { count: 'exact', head: true })

    if (instructorError) {
      throw new Error(`Failed to fetch instructors: ${instructorError.message}`)
    }

    // Get customer count
    const { count: customerCount, error: customerError } = await supabaseServer
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (customerError) {
      throw new Error(`Failed to fetch customers: ${customerError.message}`)
    }

    // Get all day_slots (slot types)
    const { data: daySlots, error: daySlotsError } = await supabaseServer
      .from('day_slots')
      .select('id, name')
      .order('id')

    if (daySlotsError) {
      throw new Error(`Failed to fetch day slots: ${daySlotsError.message}`)
    }

    // Get booking slots with day_slot_id
    const { data: slotsData, error: slotsError } = await supabaseServer
      .from('booking_slots')
      .select('instructor_id, day_slot_id')

    if (slotsError) {
      throw new Error(`Failed to fetch booking slots: ${slotsError.message}`)
    }

    // Calculate slot type statistics
    const uniqueInstructors = new Set(slotsData?.map(s => s.instructor_id) || [])

    // Count unique slot types per instructor
    const slotTypesByInstructor = new Map<string, Set<number>>()
    const allUsedSlotTypes = new Set<number>()

    slotsData?.forEach(slot => {
      if (!slotTypesByInstructor.has(slot.instructor_id)) {
        slotTypesByInstructor.set(slot.instructor_id, new Set())
      }
      if (slot.day_slot_id) {
        slotTypesByInstructor.get(slot.instructor_id)!.add(slot.day_slot_id)
        allUsedSlotTypes.add(slot.day_slot_id)
      }
    })

    // Calculate average slot types per instructor
    let totalSlotTypes = 0
    slotTypesByInstructor.forEach(types => {
      totalSlotTypes += types.size
    })
    const avgSlotTypes = uniqueInstructors.size > 0 ? totalSlotTypes / uniqueInstructors.size : 0

    // Get names of slot types used
    const slotTypesUsed = daySlots
      ?.filter(ds => allUsedSlotTypes.has(ds.id))
      .map(ds => ds.name) || []

    const data: OverviewData = {
      totalUsers: (instructorCount || 0) + (customerCount || 0),
      totalInstructors: instructorCount || 0,
      totalCustomers: customerCount || 0,
      instructorsWithAvailability: uniqueInstructors.size,
      averageSlotTypesPerInstructor: Math.round(avgSlotTypes * 10) / 10,
      slotTypesUsed
    }

    const response: ApiResponse<OverviewData> = {
      success: true,
      data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics overview error:', error)
    const response: ApiResponse<OverviewData> = {
      success: false,
      error: 'Failed to fetch analytics overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
