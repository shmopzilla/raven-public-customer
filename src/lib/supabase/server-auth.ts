import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Auth-aware Supabase client for Server Components and Route Handlers.
 * Uses the ANON key (not service role) — for auth verification only.
 * For data queries that bypass RLS, use `supabaseServer` from `server-client.ts`.
 */
export async function createServerAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can fail in Server Components (read-only cookies).
            // This is fine — the middleware handles session refresh.
          }
        },
      },
    }
  )
}
