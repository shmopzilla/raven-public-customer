import { NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/supabase/server-auth'
import { supabaseServer } from '@/lib/supabase/server-client'

export async function POST(request: Request) {
  try {
    const authClient = await createServerAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'change-email') {
      const { newEmail } = body
      if (!newEmail) {
        return NextResponse.json({ error: 'New email is required' }, { status: 400 })
      }

      const { error } = await supabaseServer.auth.admin.updateUserById(user.id, {
        email: newEmail,
      })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update email', details: error.message },
          { status: 500 }
        )
      }

      // Also update customers table
      await supabaseServer
        .from('customers')
        .update({ email: newEmail })
        .eq('id', user.id)

      return NextResponse.json({ success: true, message: 'Email updated' })
    }

    if (action === 'change-password') {
      const { currentPassword, newPassword } = body

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current and new passwords are required' },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters' },
          { status: 400 }
        )
      }

      // Verify current password
      const { error: verifyError } = await supabaseServer.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (verifyError) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Update password
      const { error } = await supabaseServer.auth.admin.updateUserById(user.id, {
        password: newPassword,
      })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update password', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Password updated' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
