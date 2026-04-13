import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware-client';

// Allowed origins for CORS (Framer sites and development)
const allowedOrigins = [
  'https://www.rfraven.com',
  'https://rfraven.com',
  'https://rfraven.framer.website',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Routes that require authentication
const protectedRoutes = ['/raven/account'];
// Routes that should redirect to account if already authenticated
const authRoutes = ['/raven/login', '/raven/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- CORS handling for API routes (unchanged) ---
  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin');
      const isAllowedOrigin = origin && allowedOrigins.includes(origin);

      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();
    const origin = request.headers.get('origin');

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  }

  // --- Auth session refresh + route protection for /raven/ routes ---
  if (pathname.startsWith('/raven/')) {
    try {
      const { supabase, response } = createMiddlewareClient(request);

      // Refresh the auth session (REQUIRED by @supabase/ssr to keep sessions alive)
      const { data: { user } } = await supabase.auth.getUser();

      // Protected routes: redirect to login if not authenticated
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      if (isProtectedRoute && !user) {
        const loginUrl = new URL('/raven/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Auth routes: redirect to account if already authenticated
      const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
      if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/raven/account', request.url));
      }

      return response;
    } catch {
      // If auth refresh fails, don't break the app — just continue
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/raven/:path*'],
};
