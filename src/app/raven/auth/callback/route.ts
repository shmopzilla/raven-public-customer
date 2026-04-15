import { NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/supabase/server-auth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/raven/account'

  if (code) {
    const supabase = await createServerAuthClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(redirect, origin))
}
