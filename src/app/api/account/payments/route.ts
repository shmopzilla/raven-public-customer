import { NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/supabase/server-auth'
import { supabaseServer } from '@/lib/supabase/server-client'

export async function GET() {
  try {
    const authClient = await createServerAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get bookings for this customer, then their payments
    const { data: bookings, error: bookingsError } = await supabaseServer
      .from('bookings')
      .select('id, reference, start_date, end_date, price, payment_status, instructors!inner (first_name, last_name)')
      .eq('customer_id', user.id)

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: bookingsError.message },
        { status: 500 }
      )
    }

    const bookingIds = (bookings || []).map(b => b.id)

    if (bookingIds.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { data: payments, error: paymentsError } = await supabaseServer
      .from('booking_payments')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: paymentsError.message },
        { status: 500 }
      )
    }

    // Merge payment data with booking info
    const enrichedPayments = (payments || []).map(payment => {
      const booking = bookings?.find(b => b.id === payment.booking_id)
      return {
        ...payment,
        booking: booking ? {
          reference: booking.reference,
          start_date: booking.start_date,
          end_date: booking.end_date,
          price: booking.price,
          instructor_name: `${booking.instructors?.first_name || ''} ${booking.instructors?.last_name || ''}`.trim(),
        } : null,
      }
    })

    return NextResponse.json({ success: true, data: enrichedPayments })
  } catch (error: any) {
    console.error('Account payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
