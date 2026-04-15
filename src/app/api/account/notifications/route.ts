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

    // Fetch all notification types
    const { data: types, error: typesError } = await supabaseServer
      .from('notification_type')
      .select('id, title, description, display_order')
      .order('display_order')

    if (typesError) {
      return NextResponse.json(
        { error: 'Failed to fetch notification types', details: typesError.message },
        { status: 500 }
      )
    }

    // Fetch user's unsubscribed notifications
    const { data: unsubscribed, error: unsubError } = await supabaseServer
      .from('notification_unsubscribed')
      .select('notification_type_id')
      .eq('user_id', user.id)

    if (unsubError) {
      return NextResponse.json(
        { error: 'Failed to fetch preferences', details: unsubError.message },
        { status: 500 }
      )
    }

    const unsubIds = new Set((unsubscribed || []).map(u => u.notification_type_id))

    const notifications = (types || []).map(type => ({
      ...type,
      subscribed: !unsubIds.has(type.id),
    }))

    return NextResponse.json({ success: true, data: notifications })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authClient = await createServerAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationTypeId, subscribed } = body

    if (!notificationTypeId || subscribed === undefined) {
      return NextResponse.json(
        { error: 'notificationTypeId and subscribed are required' },
        { status: 400 }
      )
    }

    if (subscribed) {
      // Remove from unsubscribed (re-subscribe)
      await supabaseServer
        .from('notification_unsubscribed')
        .delete()
        .eq('user_id', user.id)
        .eq('notification_type_id', notificationTypeId)
    } else {
      // Add to unsubscribed
      await supabaseServer
        .from('notification_unsubscribed')
        .upsert({
          user_id: user.id,
          notification_type_id: notificationTypeId,
        }, { onConflict: 'user_id,notification_type_id' })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
