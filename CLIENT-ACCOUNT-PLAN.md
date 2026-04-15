# Client Account Area — Implementation Status & Handover

## Status: IMPLEMENTED ✅ (Branch: `user-profile`)

All code is written, builds cleanly, and has been tested on desktop + mobile (375px). One DB migration pending.

---

## What Was Built

Complete customer authentication and account management system for the Raven ski instructor booking app (Next.js 15, React 19, TypeScript, Supabase).

### Auth Foundation
- **`@supabase/ssr`** installed for proper Next.js 15 App Router cookie-based auth
- **Three-tier Supabase client architecture:**
  - `src/lib/supabase/middleware-client.ts` — Middleware client (anon key, cookie handlers on NextRequest/NextResponse)
  - `src/lib/supabase/server-auth.ts` — Server Component/Route Handler client (anon key, `cookies()` from `next/headers`) — for auth verification only
  - `src/lib/supabase/browser-auth.ts` — Singleton browser client (`createBrowserClient` from `@supabase/ssr`)
- **Existing `supabaseServer`** (`src/lib/supabase/server-client.ts`, service role key) stays untouched for data queries bypassing RLS
- **Auth verification pattern in all API routes:** server-auth client → `getUser()` → get user ID → `supabaseServer` for data query

### Middleware (`src/middleware.ts`)
- Refreshes auth session on every `/raven/` request (REQUIRED by `@supabase/ssr`)
- Keeps existing CORS handling for `/api/` routes (with POST/PATCH/DELETE methods)
- Route protection: `/raven/account/*` → redirects to `/raven/login` if no session
- `/raven/login` and `/raven/signup` → redirect to `/raven/account` if session exists
- Matcher: `['/api/:path*', '/raven/:path*']`
- Wrapped in try/catch to prevent auth errors from breaking the app

### AuthContext (`src/lib/contexts/auth-context.tsx`)
- React context providing `{ user, loading, signOut, refreshUser }`
- Uses `onAuthStateChange` listener for login/logout events
- Pattern matches existing `search-context.tsx`
- Wrapped in root `src/app/layout.tsx` inside `<SearchProvider>`

### Login (`src/app/raven/login/page.tsx`)
- Email + password form
- Uses `createBrowserAuthClient()` for `signInWithPassword()`
- Supports `?redirect=` query param
- Wrapped in `<Suspense>` boundary (required by Next.js for `useSearchParams()` during static generation)
- Error states shown inline, link to signup

### Signup (`src/app/raven/signup/page.tsx`)
- Two-step form:
  - Step 1: first_name, last_name, email, password (min 8 chars), date_of_birth
  - Step 2: bio textarea (optional, 500 char max)
- Calls `POST /api/auth/signup`, then auto-signs in via `signInWithPassword()`
- Name fields stack vertically on mobile (`grid-cols-1 sm:grid-cols-2`)

### Signup API (`src/app/api/auth/signup/route.ts`)
- Uses `supabaseServer` (service role)
- Validates required fields, email format, password length
- `auth.admin.createUser()` with hardcoded `type: 'customer'` (security: never trusts client)
- Inserts `customers` row with matching ID
- On customer insert failure, cleans up by deleting the auth user

### Auth Callback (`src/app/raven/auth/callback/route.ts`)
- Exchanges auth code for session
- Redirects to `/raven/account` or custom redirect param

### Auth-Aware Headers
- **Sticky search header** (`src/components/raven/sticky-search-header.tsx`):
  - Logged in: avatar/initials + name with dropdown (My Account, My Bookings, Sign out)
  - Not logged in: "Sign in" wrapped in `<Link href="/raven/login">`
  - Dropdown with click-outside close
- **Hero header** (`src/components/raven/enhanced-raven-landing.tsx`):
  - Same auth-aware pattern — shows name/avatar linking to `/raven/account` when logged in

### Account Dashboard
- **Layout** (`src/app/raven/account/layout.tsx`):
  - Sticky header with "Raven" logo + "Back to Raven" link
  - Desktop: sidebar nav (`w-[240px]`, glass morphism, 6 sections)
  - Mobile: horizontal scrollable tabs with responsive text sizing
  - Active state: `bg-blue-400/10 text-blue-400`
- **Index** (`src/app/raven/account/page.tsx`): Server component redirecting to `/raven/account/bookings`

### Account Sections (6 pages + 6 API routes)

**Booking Requests** (`bookings/page.tsx` + `api/account/bookings/route.ts`):
- Fetches bookings where `customer_id = user.id` with joins to `instructors` and `booking_items`
- Booking cards: instructor avatar, name, date range, reference, status badge (color-coded), price
- Expandable booking_items showing individual session dates/times
- Status colors: green (confirmed/active/completed), yellow (requested/pending), red (declined/cancelled), blue (deposit_paid)

**Invoices & Payments** (`payments/page.tsx` + `api/account/payments/route.ts`):
- Fetches `booking_payments` by customer's booking IDs, merged with booking info + instructor name
- Payment cards: instructor name, dates, reference, payment type, status badge, price
- Deposit/balance breakdown shown when applicable

**Personal Details** (`details/page.tsx` + `api/account/details/route.ts`):
- GET: Fetch `customers` row
- PATCH: Update `customers` table + sync name to `auth.users` metadata via `admin.updateUserById()`
- Editable: first_name, last_name, date_of_birth
- Email shown read-only with note to change in Security section
- Name fields stack vertically on mobile

**Email & Password** (`security/page.tsx` + `api/account/security/route.ts`):
- Two sections: Change Email + Change Password
- Change email: `admin.updateUserById()` with new email + syncs to customers table
- Change password: verifies current password via `signInWithPassword`, then updates
- Current email shown with `break-all` for long addresses on mobile

**Profile & Photo** (`profile/page.tsx` + `api/account/profile/route.ts`):
- Avatar upload via Supabase Storage (`avatars/{user_id}/avatar.{ext}`, upsert)
- Uses `createBrowserAuthClient()` for storage upload, API route for URL persistence
- Bio textarea (500 char max)
- Avatar + upload button stacks vertically on mobile, side-by-side on desktop
- Calls `refreshUser()` after avatar update to sync header

**Notifications** (`notifications/page.tsx` + `api/account/notifications/route.ts`):
- GET: Fetches all `notification_type` rows + user's `notification_unsubscribed` → derives toggle state
- POST: Insert/delete from `notification_unsubscribed` to toggle
- Toggle switches with `flex-shrink-0` to prevent squishing on mobile

### Other Fixes Applied (from earlier in the session, also on this branch)
- **Slot selection**: Only shows instructor-configured slots (not all 6 hardcoded), Full Day booking blocks Morning/Afternoon
- **Calendar panel**: Fits viewport so CTA button visible without scrolling (`sticky top-4`, `maxHeight: calc(100vh - 32px)`)
- **Configured slots API**: `src/app/api/calendar/configured-slots/route.ts` — queries `booking_slots` for instructor

---

## Pending Items

### ⚠️ DB Migration Required
The `bio` column does not exist on the `customers` table yet. Run this in the Supabase SQL editor:

```sql
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS bio text;
```

Without this, the Profile page will render but bio saves will fail.

### Not Implemented
- Password reset flow (forgot password page)
- Email verification after email change
- Profile picture deletion (only upload/replace)
- Booking cancellation from the account area
- Invoice PDF download

---

## Key Database Tables

**`customers`** (linked to `auth.users` by `id`):
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK, matches auth.users.id) | |
| first_name | text | NOT NULL |
| last_name | text | NOT NULL |
| email | text | |
| date_of_birth | date | NOT NULL |
| avatar_url | text | |
| stripe_customer_id | text | |
| created_at | timestamp | |
| bio | text | ⚠️ NEEDS MIGRATION |

**`bookings`**: customer_id (FK → customers), instructor_id (FK → instructors), start/end dates, price, status (FK → booking_status), payment_status, reference

**`booking_status`**: 1=requested_by_customer, 2=requested_by_instructor, 3=confirmed, 4=declined, 5=expired, 6=cancelled_by_instructor, 7=cancelled_by_client, 8=completed, 9=active, 10=pending_payment, 11=deposit_paid

**`payment_status`**: 1=none, 2=pending, 3=paid, 4=void, 5=deposit_paid, 6=refunded

**`booking_payments`**: booking_id, price, status, payment_type ('full'), is_deposit, deposit_amount, balance_amount

**`booking_items`**: booking_id, day_slot_id (1-6), date, start_time, end_time, hourly_rate, total_minutes

**`notification_type`**: id, title, description, display_order

**`notification_unsubscribed`**: user_id, notification_type_id (presence = unsubscribed)

---

## UI Design System

- **Theme**: Dark — `#000000` bg, white text, glass morphism
- **Glass panels**: `bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md`
- **Inputs**: `bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-400`
- **Labels**: `font-['Archivo'] text-sm text-[#d5d5d6] mb-2`
- **Primary button**: `bg-blue-400 text-white hover:bg-blue-500 rounded-xl py-3 font-['Archivo'] font-semibold`
- **Secondary button**: `bg-white/10 text-white hover:bg-white/20 border border-white/20`
- **Headings font**: `font-['PP_Editorial_New']` (serif)
- **Body font**: `font-['Archivo']` (sans-serif)
- **Muted text**: `text-[#d5d5d6]` or `text-[#9696a5]`
- **Animations**: `motion/react` (Framer Motion successor) — spring physics, fade/scale/slide transitions
- **Status badges**: `inline-flex px-3 py-1 rounded-full text-xs font-semibold border` with color variants

### Mobile Responsiveness Patterns Used
- Grids: `grid-cols-1 sm:grid-cols-2` (name fields stack on mobile)
- Flex: `flex-col sm:flex-row` (avatar + controls stack on mobile)
- Text: `text-2xl sm:text-3xl` headings, `text-xs sm:text-sm` body
- Padding: `p-4 sm:p-6` or `p-5 sm:p-8` cards
- Gaps: `gap-3 sm:gap-4` or `gap-4 sm:gap-6`
- Overflow: `min-w-0 flex-1` on text, `flex-shrink-0` on fixed elements
- Tabs: horizontal scroll with `overflow-x-auto`, smaller pills on mobile

---

## File Tree (all new/modified files)

```
NEW FILES:
  src/lib/supabase/middleware-client.ts
  src/lib/supabase/server-auth.ts
  src/lib/supabase/browser-auth.ts
  src/lib/contexts/auth-context.tsx
  src/app/raven/login/page.tsx
  src/app/raven/signup/page.tsx
  src/app/raven/auth/callback/route.ts
  src/app/raven/account/layout.tsx
  src/app/raven/account/page.tsx
  src/app/raven/account/bookings/page.tsx
  src/app/raven/account/payments/page.tsx
  src/app/raven/account/details/page.tsx
  src/app/raven/account/security/page.tsx
  src/app/raven/account/profile/page.tsx
  src/app/raven/account/notifications/page.tsx
  src/app/api/auth/signup/route.ts
  src/app/api/account/bookings/route.ts
  src/app/api/account/payments/route.ts
  src/app/api/account/details/route.ts
  src/app/api/account/security/route.ts
  src/app/api/account/profile/route.ts
  src/app/api/account/notifications/route.ts
  src/app/api/calendar/configured-slots/route.ts

MODIFIED FILES:
  package.json (added @supabase/ssr)
  src/middleware.ts (auth refresh + route protection)
  src/app/layout.tsx (wrapped with AuthProvider)
  src/components/raven/sticky-search-header.tsx (auth-aware header)
  src/components/raven/enhanced-raven-landing.tsx (auth-aware hero header)
  src/components/raven/slot-selection-modal.tsx (configured slots + Full Day blocking)
  src/app/raven/profile/[id]/page.tsx (configured slots + calendar viewport fix)
  src/components/calendar/InstructorAvatar.tsx
  tailwind.config.ts
```

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://ryuslexclvyohxagztys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## API Pattern (all account routes follow this)
```typescript
// 1. Verify auth
const supabase = await createServerAuthClient()
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Query data with service role (bypasses RLS)
const { data, error: dbError } = await supabaseServer
  .from('table')
  .select('*')
  .eq('customer_id', user.id)
```
