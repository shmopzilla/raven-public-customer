import { NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/supabase/server-auth'
import { supabaseServer } from '@/lib/supabase/server-client'

export async function GET() {
  try {
    // Verify auth
    const authClient = await createServerAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch bookings for this customer with related data
    const { data, error } = await supabaseServer
      .from('bookings')
      .select(`
        id,
        reference,
        start_date,
        end_date,
        price,
        status,
        payment_status,
        primary_name,
        created_at,
        instructors!inner (id, first_name, last_name, avatar_url),
        booking_items (id, date, day_slot_id, start_time, end_time, hourly_rate, total_minutes)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Account bookings error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Account bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
