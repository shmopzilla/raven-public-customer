import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, dateOfBirth, bio } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password, dateOfBirth' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create auth user with service role (hardcoded type: "customer" — never trust client)
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        type: 'customer',
        first_name: firstName,
        last_name: lastName,
        email,
        is_registration_completed: true,
      },
    })

    if (authError) {
      console.error('Signup: Failed to create auth user:', authError)
      // Map common errors to user-friendly messages
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create account', details: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user. No user returned.' },
        { status: 500 }
      )
    }

    // Insert into customers table (id matches auth user id)
    const { error: customerError } = await supabaseServer
      .from('customers')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        date_of_birth: dateOfBirth,
        bio: bio || null,
      })

    if (customerError) {
      console.error('Signup: Failed to create customer row:', customerError)
      // Clean up: delete the auth user if customer insert fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create customer profile', details: customerError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error('Signup: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
