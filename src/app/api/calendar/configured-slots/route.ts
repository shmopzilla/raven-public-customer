import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'instructorId is required' },
        { status: 400 }
      )
    }

    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabaseServer
      .from('booking_slots')
      .select('day_slot_id, date')
      .eq('instructor_id', instructorId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query

    if (error) {
      console.error('API: Failed to fetch configured slots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch configured slots', details: error.message },
        { status: 500 }
      )
    }

    // Extract distinct day_slot_ids
    const configuredSlotIds = [...new Set(
      (data || []).map(row => row.day_slot_id).filter(Boolean)
    )].sort((a, b) => a - b)

    // Extract distinct available dates
    const availableDates = [...new Set(
      (data || []).map(row => row.date).filter(Boolean)
    )].sort()

    return NextResponse.json({
      success: true,
      data: configuredSlotIds,
      availableDates
    })

  } catch (error: any) {
    console.error('API: Error in configured-slots endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
