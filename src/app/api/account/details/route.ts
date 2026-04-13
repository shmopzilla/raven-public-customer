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

    const { data, error } = await supabaseServer
      .from('customers')
      .select('id, first_name, last_name, email, date_of_birth, avatar_url, created_at')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch details', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const authClient = await createServerAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, dateOfBirth } = body

    // Update customers table
    const updates: Record<string, any> = {}
    if (firstName) updates.first_name = firstName
    if (lastName) updates.last_name = lastName
    if (dateOfBirth) updates.date_of_birth = dateOfBirth

    const { error: updateError } = await supabaseServer
      .from('customers')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update details', details: updateError.message },
        { status: 500 }
      )
    }

    // Sync name to auth.users metadata
    if (firstName || lastName) {
      const metaUpdates: Record<string, any> = {}
      if (firstName) metaUpdates.first_name = firstName
      if (lastName) metaUpdates.last_name = lastName

      await supabaseServer.auth.admin.updateUserById(user.id, {
        user_metadata: metaUpdates,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
