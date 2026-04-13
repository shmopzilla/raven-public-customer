# Client Account Area — Full Implementation Plan

## Context
The Raven ski instructor booking app needs a full client (customer) account area with authentication, registration, and a dashboard to manage bookings, payments, profile, and notifications. Currently NO auth exists in the Next.js app — Supabase Auth IS active on the backend (83 users: 55 untyped, 17 instructors, 11 customers) but there are zero login/signup pages, no session handling, no middleware protection, and the "Sign in" button in the header is non-functional.

---

## Current State Summary

### Supabase Auth
- **Provider**: Supabase Auth with email + phone providers
- **Users exist** in `auth.users` with `raw_user_meta_data` storing `type` ("customer"/"instructor"), `first_name`, `last_name`, `email`, `is_registration_completed`
- **NO auth packages** in Next.js — only `@supabase/supabase-js` v2.57.3 is installed
- **Need to install**: `@supabase/ssr` for proper Next.js 15 App Router cookie-based auth

### Supabase Client Setup (existing files)
- `src/lib/supabase/client.ts` — Browser client (lazy-init, anon key, NO auth cookie handling)
- `src/lib/supabase/server-client.ts` — Server client with **service role key** (bypasses RLS, server-only)
- `src/lib/supabase/server-database.ts` — Server-side DB query functions using service role
- `src/lib/supabase/database.ts` — Client-side DB queries (limited)

### Existing Middleware (`src/middleware.ts`)
- Only handles CORS for `/api/` routes
- No auth session refresh, no route protection
- Matcher: `/api/:path*` only

### Key Database Tables

**`customers`** (12 rows):
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid (PK, matches auth.users.id) | NO |
| first_name | text | NO |
| last_name | text | NO |
| email | text | YES |
| date_of_birth | date | NO |
| avatar_url | text | YES |
| stripe_customer_id | text | YES |
| created_at | timestamp | NO |
| ⚠️ bio | MISSING — needs migration | — |

**`bookings`** (10 rows):
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| instructor_id | uuid (FK → instructors) | |
| customer_id | uuid (FK → customers) | |
| resort_id | bigint (FK → resorts) | |
| discipline_id | bigint (FK → disciplines) | |
| start_date, end_date | date | |
| price | bigint | |
| status | integer (FK → booking_status) | Default: 1 |
| payment_status | bigint (FK → payment_status) | Default: 1 |
| reference | text | Auto-generated |
| primary_name, primary_email | text | |
| platform_cut | real | |
| is_disputed | boolean | Default: false |
| dispute_* | various | Dispute tracking fields |
| payout_* | various | Payout tracking fields |

**`booking_status`** (reference table):
| ID | Name |
|----|------|
| 1 | requested_by_customer |
| 2 | requested_by_instructor |
| 3 | confirmed |
| 4 | declined |
| 5 | expired |
| 6 | cancelled_by_instructor |
| 7 | cancelled_by_client |
| 8 | completed |
| 9 | active |
| 10 | pending_payment |
| 11 | deposit_paid |

**`payment_status`** (reference table):
| ID | Name |
|----|------|
| 1 | none |
| 2 | pending |
| 3 | paid |
| 4 | void |
| 5 | deposit_paid |
| 6 | refunded |

**`booking_payments`** (10 rows):
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| booking_id | bigint (FK → bookings) | |
| price | bigint | |
| status | bigint (FK → payment_status) | |
| payment_type | enum ('full', etc) | Default: 'full' |
| is_deposit | boolean | Default: false |
| deposit_amount, balance_amount | bigint | |
| balance_due_date | timestamp | |
| stripe_refund_id | text | |
| metadata | jsonb | Default: {} |

**`booking_items`** (38 rows):
| Column | Type |
|--------|------|
| id | bigint (PK) |
| booking_id | bigint (FK → bookings) |
| booking_slot_id | bigint |
| day_slot_id | bigint (1-6) |
| date | date |
| start_time, end_time | time |
| total_minutes | integer |
| hourly_rate | numeric |
| offer_id | bigint |

**`notification_type`**:
| Column | Type |
|--------|------|
| id | bigint (PK) |
| title | text |
| description | text |
| access_type | bigint |
| display_order | bigint |

**`notification_unsubscribed`**:
| Column | Type |
|--------|------|
| id | bigint (PK) |
| user_id | uuid |
| notification_type_id | bigint |
| created_at | timestamp |

### UI Design System
- **Theme**: Dark — `#000000` bg, white text, glass morphism
- **Glass panels**: `bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md`
- **Inputs**: `bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-400`
- **Labels**: `font-['Archivo'] text-sm text-[#d5d5d6] mb-2`
- **Primary button**: `bg-blue-400 text-white hover:bg-blue-500 rounded-xl py-4 font-['Archivo'] font-semibold`
- **Secondary button**: `bg-white/10 text-white hover:bg-white/20 border border-white/20`
- **Headings font**: `font-['PP_Editorial_New']` (serif)
- **Body font**: `font-['Archivo']` (sans-serif)
- **Muted text**: `text-[#d5d5d6]` or `text-[#9696a5]`
- **Toast notifications**: `src/components/raven/toast-notification.tsx` (success/info/error variants)
- **Modals**: `bg-black/80 backdrop-blur-sm` overlay, `bg-[#1a1a1f] border border-white/20 rounded-2xl` card
- **Animations**: `motion/react` (Framer Motion successor) — spring physics, fade/scale/slide transitions

### Existing Routes
- `/raven/` — Landing page
- `/raven/search` — Search results
- `/raven/profile/[id]` — Instructor profile
- `/raven/cart` — Cart page
- `/raven/checkout` — Checkout form (has good input pattern reference)

### Existing Stores/Contexts
- `src/lib/contexts/search-context.tsx` — Search state (React context)
- `src/lib/stores/cart-store.ts` — Cart state (Zustand with localStorage)

### API Pattern
ALL data fetching uses API routes with `supabaseServer` (service role, bypasses RLS):
```
Client component → fetch('/api/...') → API route uses supabaseServer → Supabase DB
```

---

## Implementation Plan

### Phase 0: Auth Foundation

**Install `@supabase/ssr`:**
```bash
npm install @supabase/ssr
```

**New file: `src/lib/supabase/middleware-client.ts`**
- Creates Supabase client for middleware using `createServerClient` from `@supabase/ssr`
- Cookie get/set handlers reading from `NextRequest` and writing to `NextResponse`
- Uses ANON key (not service role)

**New file: `src/lib/supabase/server-auth.ts`**
- Creates Supabase client for Server Components/Route Handlers
- Uses `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`
- Uses ANON key — this is for auth verification, NOT data queries
- Separate from existing `server-client.ts` (which is service role for data)

**New file: `src/lib/supabase/browser-auth.ts`**
- Creates singleton browser Supabase client using `createBrowserClient` from `@supabase/ssr`
- Proper cookie-based session handling for client components

**Modify: `src/middleware.ts`**
- Call Supabase middleware client to refresh auth session on every request (REQUIRED by @supabase/ssr)
- Keep existing CORS handling for `/api/` routes
- Add route protection: `/raven/account/*` → redirect to `/raven/login` if no session
- Login/signup pages → redirect to `/raven/account` if session exists
- Update matcher to include both `/api/:path*` and `/raven/:path*`
- MUST use `supabase.auth.getUser()` (not `getSession()`) for security

**New file: `src/lib/contexts/auth-context.tsx`**
- Client-side React context exposing `{ user, loading, signOut }`
- On mount: calls browser client `auth.getUser()`
- Listens to `onAuthStateChange` for login/logout events
- Pattern matches existing `search-context.tsx`

**Modify: `src/app/layout.tsx`**
- Wrap children with `<AuthProvider>` inside existing `<SearchProvider>`

### Phase 1: Login & Sign Up

**New: `src/app/raven/login/page.tsx`**
- Email + password form using existing input styling
- Calls `supabase.auth.signInWithPassword()` via browser auth client
- On success: `router.push('/raven/account')`
- Error states shown inline
- Link to signup page

**New: `src/app/raven/signup/page.tsx`**
- Fields: first_name, last_name, email, password, date_of_birth
- Optional: profile picture upload, "about yourself" textarea
- Submit calls `POST /api/auth/signup`

**New: `src/app/api/auth/signup/route.ts`**
- Uses `supabaseServer` (service role) to:
  1. `supabase.auth.admin.createUser()` with `user_metadata: { type: "customer", first_name, last_name, email, is_registration_completed: true }`
  2. Insert row into `customers` table (id = auth user id, first_name, last_name, email, date_of_birth, avatar_url)
  3. Handle avatar upload to Supabase Storage if provided

**New: `src/app/raven/auth/callback/route.ts`**
- Exchanges auth code for session (needed for email confirmation, password reset)
- Redirects to `/raven/account`

**Modify: `src/components/raven/sticky-search-header.tsx`**
- Import `useAuth` from auth context
- If logged in: show avatar/initials + dropdown (Account, Sign out)
- If not logged in: wrap "Sign in" button with `<Link href="/raven/login">`

### Phase 2: Account Dashboard Layout

**New: `src/app/raven/account/layout.tsx`**
- Reuses sticky header (now auth-aware)
- Sidebar navigation (desktop) / top tabs (mobile)
- Sections: Booking Requests, Invoices & Payments, Personal Details, Email & Password, Profile & Photo, Notifications
- Dark glass morphism sidebar: `bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md`

**New: `src/app/raven/account/page.tsx`**
- Redirects to `/raven/account/bookings`

### Phase 3: Account Sections

Each section = page + API route. API routes authenticate by:
1. Create server auth client (anon key) → `getUser()` → get user ID
2. Use `supabaseServer` (service role) for data query filtered by user ID

**3.1 Booking Requests**
- Page: `src/app/raven/account/bookings/page.tsx`
- API: `src/app/api/account/bookings/route.ts`
- GET: Query `bookings` where `customer_id = user.id`, join `instructors`, `resorts`, `disciplines`, `booking_items`
- Display: List of booking cards with instructor name/avatar, resort, dates, status badge (color-coded), price
- Status badge colors: green (confirmed/active/completed), yellow (requested/pending), red (declined/cancelled), blue (deposit_paid)

**3.2 Invoices & Payments**
- Page: `src/app/raven/account/payments/page.tsx`
- API: `src/app/api/account/payments/route.ts`
- GET: Query `booking_payments` joined with `bookings` (filtered by customer_id), `payment_status`
- Display: Payment cards with booking reference, date, amount, status badge, deposit/balance info

**3.3 Personal Details**
- Page: `src/app/raven/account/details/page.tsx`
- API: `src/app/api/account/details/route.ts`
- GET: Fetch `customers` row for user
- PATCH: Update first_name, last_name, date_of_birth in `customers` + sync to `auth.users` metadata via `admin.updateUserById()`

**3.4 Email & Password**
- Page: `src/app/raven/account/security/page.tsx`
- API: `src/app/api/account/security/route.ts`
- Change email: `admin.updateUserById()` with new email
- Change password: Verify current password first via `signInWithPassword`, then `admin.updateUserById()`

**3.5 Profile Picture & About**
- Page: `src/app/raven/account/profile/page.tsx`
- API: `src/app/api/account/profile/route.ts`
- Avatar upload: client-side to Supabase Storage `avatars/{user_id}`, save URL via PATCH
- Bio: textarea field
- **⚠️ REQUIRES MIGRATION**: `ALTER TABLE customers ADD COLUMN bio text;`

**3.6 Email Notifications**
- Page: `src/app/raven/account/notifications/page.tsx`
- API: `src/app/api/account/notifications/route.ts`
- GET: Fetch all `notification_type` rows + user's `notification_unsubscribed` rows → derive toggle state
- POST: Insert/delete from `notification_unsubscribed` to toggle

### Phase 4: Database Migration

```sql
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS bio text;
```

### Phase 5: Sign Out

- Client-side: `supabase.auth.signOut()` → auth context picks up `SIGNED_OUT` event → redirect to `/raven/login`
- Exposed via auth context's `signOut()` function

---

## New File Tree

```
src/
  lib/
    supabase/
      middleware-client.ts          # NEW - Supabase client for middleware
      server-auth.ts                # NEW - Supabase client for server (anon key, auth-aware)
      browser-auth.ts               # NEW - Supabase client for browser (cookie-based auth)
    contexts/
      auth-context.tsx              # NEW - Auth state provider
  app/
    raven/
      login/
        page.tsx                    # NEW - Login page
      signup/
        page.tsx                    # NEW - Sign up page
      auth/
        callback/
          route.ts                  # NEW - Auth callback handler
      account/
        layout.tsx                  # NEW - Account layout + sidebar
        page.tsx                    # NEW - Redirect to /bookings
        bookings/
          page.tsx                  # NEW - Booking requests
        payments/
          page.tsx                  # NEW - Invoices & payments
        details/
          page.tsx                  # NEW - Personal details form
        security/
          page.tsx                  # NEW - Email & password
        profile/
          page.tsx                  # NEW - Avatar & bio
        notifications/
          page.tsx                  # NEW - Notification toggles
    api/
      auth/
        signup/
          route.ts                  # NEW - Sign up handler
      account/
        bookings/
          route.ts                  # NEW - Customer bookings API
        payments/
          route.ts                  # NEW - Customer payments API
        details/
          route.ts                  # NEW - Customer details CRUD
        security/
          route.ts                  # NEW - Email/password change
        profile/
          route.ts                  # NEW - Avatar/bio CRUD
        notifications/
          route.ts                  # NEW - Notification prefs CRUD

Modified files:
  src/middleware.ts                  # Add auth refresh + route protection
  src/components/raven/sticky-search-header.tsx  # Auth-aware sign in button
  src/app/layout.tsx                # Wrap with AuthProvider
```

## Implementation Order

1. Phase 0 — Auth foundation (install, utility files, middleware, context)
2. Phase 1.3 — Login page (test with existing Supabase users)
3. Phase 1.5 — Connect Sign in button
4. Phase 1.1 + 1.2 — Sign up page + API
5. Phase 1.4 — Auth callback route
6. Phase 2 — Account layout with sidebar
7. Phase 3.3 — Personal details (simplest, good end-to-end test)
8. Phase 3.1 — Booking requests (core feature)
9. Phase 3.2 — Invoices/payments
10. Phase 4 — Bio column migration
11. Phase 3.5 — Profile picture & about
12. Phase 3.4 — Email & password
13. Phase 3.6 — Notifications

## Verification
- Sign up creates both auth.users entry AND customers row
- Login sets session cookies, header shows avatar/name
- `/raven/account/*` redirects to login when not authenticated
- `/raven/login` redirects to account when already authenticated
- Booking requests show correct data filtered by customer_id
- Payments show correct data joined from booking_payments
- Personal details update persists to DB
- Email/password change works via Supabase Auth
- Avatar upload saves to Supabase Storage
- Notification toggles persist to notification_unsubscribed table
