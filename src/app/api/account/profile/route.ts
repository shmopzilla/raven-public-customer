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
      .select('avatar_url, bio')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
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
    const { avatarUrl, bio } = body

    const updates: Record<string, any> = {}
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl
    if (bio !== undefined) updates.bio = bio

    const { error } = await supabaseServer
      .from('customers')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      )
    }

    // Sync avatar to auth.users metadata
    if (avatarUrl !== undefined) {
      await supabaseServer.auth.admin.updateUserById(user.id, {
        user_metadata: { avatar_url: avatarUrl },
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
