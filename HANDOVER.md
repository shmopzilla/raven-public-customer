# Raven — Full Application Handover

> Ski instructor booking platform. Next.js 15 + React 19 + Supabase + Stripe.
> Branch: `user-profile` | Supabase project: `ryuslexclvyohxagztys`

---

## 1. Quick Start

```bash
cd aceternity-design-system
npm install
npm run dev     # localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

**Environment variables** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://ryuslexclvyohxagztys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe_pk>
STRIPE_SECRET_KEY=<stripe_sk>
```

The app degrades gracefully without env vars — uses fallback data from `src/lib/fallback-data.ts`.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.4.10 |
| UI | React + TypeScript | 19.1.0 |
| Styling | Tailwind CSS + tailwindcss-animate | 3.4.17 |
| Animation | motion (Framer Motion successor) | 12.23.12 |
| Database / Auth | Supabase (@supabase/supabase-js + @supabase/ssr) | 2.57.3 / 0.10.2 |
| Payments | Stripe (@stripe/stripe-js + stripe) | 7.8.0 / 18.4.0 |
| State | Zustand (cart) + React Context (auth, search) | 5.0.8 |
| Icons | Lucide React | 0.548.0 |
| Charts | Recharts | 3.6.0 |
| Utilities | clsx + tailwind-merge | via `cn()` in `src/lib/utils.ts` |

**Fonts**: Archivo (body), PP Editorial New (headings/serif), Inter, Playfair Display, Geist Sans/Mono. Loaded in root layout + `/public/fonts/PPEditorialNew-Regular.woff`.

---

## 3. Architecture

### Providers (root `src/app/layout.tsx`)
```
<SearchProvider>        ← Global search criteria, modal state, locations/disciplines
  <AuthProvider>        ← Supabase auth state (user, loading, signOut, refreshUser)
    {children}
  </AuthProvider>
</SearchProvider>
```

### Middleware (`src/middleware.ts`)
- **CORS**: Allows `rfraven.com`, `rfraven.framer.website`, `localhost:3000/3001` for `/api/*` routes. Handles OPTIONS preflight.
- **Auth session refresh**: Calls Supabase middleware client on every `/raven/*` request (required by `@supabase/ssr`).
- **Route protection**: `/raven/account/*` → redirect to `/raven/login` if unauthenticated. `/raven/login` and `/raven/signup` → redirect to `/raven/account` if authenticated.
- **Matcher**: `['/api/:path*', '/raven/:path*']`

### Supabase Client Architecture (4 clients)

| Client | File | Key | Purpose |
|--------|------|-----|---------|
| Browser (legacy) | `src/lib/supabase/client.ts` | Anon | Lazy-init, no auth cookies — used by `database.ts` |
| Browser auth | `src/lib/supabase/browser-auth.ts` | Anon | `createBrowserClient` from `@supabase/ssr` — cookie-based sessions |
| Server auth | `src/lib/supabase/server-auth.ts` | Anon | `createServerClient` with `cookies()` — for `getUser()` in API routes |
| Server data | `src/lib/supabase/server-client.ts` | **Service role** | Bypasses RLS — for all data queries. **NEVER expose to browser.** |
| Middleware | `src/lib/supabase/middleware-client.ts` | Anon | Cookie handlers on NextRequest/NextResponse |

**API route auth pattern** (all `/api/account/*` routes):
```typescript
const supabase = await createServerAuthClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401
// Then use supabaseServer (service role) for data queries
```

---

## 4. User Journeys

### Search → Book Flow
```
/raven (landing)
  → Click "Find Instructors" or use search bar
  → GlobalSearchModal opens (location, dates, participants, sport)
  → Submit → /raven/search?location=X&startDate=Y&endDate=Z
     ← GET /api/search/instructors (paginated, 6 per load, infinite scroll)
  → Click instructor card → /raven/profile/[id]
     ← GET /api/calendar/instructors
     ← GET /api/calendar/bookings (existing bookings)
     ← GET /api/calendar/configured-slots (available slot types)
     ← GET /api/calendar/disciplines
     ← GET /api/calendar/instructor-images
     ← GET /api/calendar/instructor-resorts
     ← GET /api/calendar/offers
  → Select dates on calendar → SlotSelectionModal opens
  → Pick time slots (Full Day, Morning, etc.) → "Add to Cart"
     → Zustand cart store (localStorage persist)
  → /raven/cart → review items → /raven/checkout
     → Fill contact form → Submit
     → TODO: Stripe payment + create booking in Supabase
     → Success modal → redirect to /raven/search
```

### Account Flow
```
/raven/login → email/password → signInWithPassword()
  OR /raven/signup → 2-step form → POST /api/auth/signup → auto-sign-in
→ /raven/account (redirects to /bookings)
  → /bookings — booking requests with status badges
  → /payments — invoice history
  → /details — edit name, DOB
  → /security — change email/password
  → /profile — avatar upload + bio
  → /notifications — toggle email preferences
```

---

## 5. Page Map

### Raven App Pages

| Route | File | Purpose | Data Source |
|-------|------|---------|-------------|
| `/` | `src/app/page.tsx` | Landing page (renders EnhancedRavenLanding) | Static + fallback |
| `/raven` | `src/app/raven/page.tsx` | Redirects to `/` | — |
| `/raven/search` | `src/app/raven/search/page.tsx` | Instructor search with infinite scroll | `/api/search/instructors` |
| `/raven/search/demo` | `src/app/raven/search/demo/page.tsx` | Demo search page | Mock data |
| `/raven/profile/[id]` | `src/app/raven/profile/[id]/page.tsx` | Instructor profile + calendar + booking | Multiple calendar APIs |
| `/raven/cart` | `src/app/raven/cart/page.tsx` | Shopping cart | Zustand store |
| `/raven/checkout` | `src/app/raven/checkout/page.tsx` | Checkout form | Zustand store |
| `/raven/login` | `src/app/raven/login/page.tsx` | Email/password login | Supabase Auth |
| `/raven/signup` | `src/app/raven/signup/page.tsx` | 2-step registration | `/api/auth/signup` |
| `/raven/auth/callback` | `src/app/raven/auth/callback/route.ts` | OAuth callback | Supabase Auth |

### Account Pages (all auth-protected via middleware)

| Route | File | Purpose | API |
|-------|------|---------|-----|
| `/raven/account` | `account/page.tsx` | Redirects to `/bookings` | — |
| `/raven/account/bookings` | `account/bookings/page.tsx` | Booking requests + statuses | `GET /api/account/bookings` |
| `/raven/account/payments` | `account/payments/page.tsx` | Payment history | `GET /api/account/payments` |
| `/raven/account/details` | `account/details/page.tsx` | Personal info form | `GET/PATCH /api/account/details` |
| `/raven/account/security` | `account/security/page.tsx` | Email + password change | `POST /api/account/security` |
| `/raven/account/profile` | `account/profile/page.tsx` | Avatar + bio | `GET/PATCH /api/account/profile` |
| `/raven/account/notifications` | `account/notifications/page.tsx` | Notification toggles | `GET/POST /api/account/notifications` |

**Account layout** (`account/layout.tsx`): Sticky header + sidebar nav (desktop `w-[240px]`) / horizontal scroll tabs (mobile).

### Other Pages

| Route | Purpose |
|-------|---------|
| `/pricing` | Pricing cards (Stripe integration) |
| `/showcase` | Aceternity UI component demos |
| `/calendar` | Calendar view (standalone) |
| `/calendar/full` | Full calendar view |
| `/instructor-calendar` | Instructor-specific calendar |
| `/analytics` | Admin analytics dashboard (charts, metrics) |
| `/supabase` | Supabase debug/testing page |

---

## 6. API Routes

### Search & Calendar

| Endpoint | Method | Auth | Tables | Purpose |
|----------|--------|------|--------|---------|
| `/api/search/instructors` | GET | No | instructors, instructor_offers, instructor_offer_disciplines, instructor_offer_resorts, booking_items, user_languages, instructor_images | Main search with location/date/discipline filters, pagination |
| `/api/calendar/instructors` | GET | No | instructors, user_languages, instructor_images | All instructors with languages + images |
| `/api/calendar/bookings` | GET | No | bookings, booking_items | Booking items for instructor + date range |
| `/api/calendar/configured-slots` | GET | No | booking_slots | Distinct day_slot_ids + available dates for instructor |
| `/api/calendar/disciplines` | GET | No | instructor_offers, instructor_offer_disciplines, disciplines | Instructor's disciplines with min price |
| `/api/calendar/instructor-images` | GET | No | instructor_images | Instructor photo gallery |
| `/api/calendar/instructor-resorts` | GET | No | instructor_offers, instructor_offer_resorts, resorts | Resorts where instructor teaches |
| `/api/calendar/offers` | GET | No | instructor_offers | Active offers + min hourly rate |
| `/api/resorts` | GET | No | resorts, countries, instructor_offer_resorts, instructor_offers | All resorts with country + avg price |

### Auth

| Endpoint | Method | Auth | Tables | Purpose |
|----------|--------|------|--------|---------|
| `/api/auth/signup` | POST | No | auth.users, customers | Create customer account (hardcoded type='customer') |

### Account (all require auth)

| Endpoint | Method | Tables | Purpose |
|----------|--------|--------|---------|
| `/api/account/bookings` | GET | bookings, instructors, booking_items | Customer's bookings with status |
| `/api/account/payments` | GET | bookings, booking_payments, instructors | Payment history |
| `/api/account/details` | GET, PATCH | customers, auth.users | Read/update personal info |
| `/api/account/security` | POST | customers, auth.users | Change email or password |
| `/api/account/profile` | GET, PATCH | customers, auth.users | Read/update avatar + bio |
| `/api/account/notifications` | GET, POST | notification_type, notification_unsubscribed | Read prefs / toggle subscription |

### Analytics

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/overview` | GET | Total users, instructors, customers, availability stats |
| `/api/analytics/instructors` | GET | Per-instructor slot stats |
| `/api/analytics/instructors/[id]/slots` | GET | Specific instructor's booked slots |
| `/api/analytics/signups` | GET | Daily signup trends |
| `/api/analytics/profile-completeness` | GET | Instructor profile completion % |

### Debug

| Endpoint | Purpose |
|----------|---------|
| `/api/debug/tables` | List all Supabase table names |
| `/api/debug/disciplines` | Debug discipline data |
| `/api/supabase/stats` | Database statistics |

---

## 7. Components

### Raven Components (`src/components/raven/`)

| Component | File | Purpose |
|-----------|------|---------|
| EnhancedRavenLanding | `enhanced-raven-landing.tsx` | Full landing page — hero, toggle switch, how-it-works cards, content sections. Auth-aware header. |
| RavenLanding | `raven-landing.tsx` | Original landing page (superseded by Enhanced) |
| StickySearchHeader | `sticky-search-header.tsx` | Sticky header on scroll — search summary, auth-aware sign-in/avatar dropdown |
| InstructorProfileCard | `instructor-profile-card.tsx` | Search result card — image carousel, nationality flags, languages, tagline, price |
| SlotSelectionModal | `slot-selection-modal.tsx` | Date/time slot picker. Enforces Full Day ↔ individual slot mutual exclusivity. Respects `configuredSlotIds`. |
| CartBadge | `cart-badge.tsx` | Floating badge showing cart item count |
| CartItem | `cart-item.tsx` | Single cart item display (compact/expanded variants) |
| CartPanel | `cart-panel.tsx` | Sliding sidebar cart panel |
| DestinationCard | `destination-card.tsx` | Resort card with image and price |
| FilterChip | `filter-chip.tsx` | Toggle filter button |
| SearchBar | `search-bar.tsx` | Search input with focus states |
| ToastNotification | `toast-notification.tsx` | Success/info/error toast |

### UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| GlobalSearchModal | Multi-step search: location → sport → dates → participants |
| SearchModal | Advanced search with 30+ French ski resorts, debounced (300ms), 4-6 results |
| AnimatedModal | Reusable modal with Provider/Trigger/Body pattern |
| AnimatedTooltip | Hover tooltip with motion animations |
| 3DCard | 3D perspective card (CardContainer, CardBody, CardItem) |
| AuroraBackground | Animated gradient background effect |
| FloatingLabelInput | Input with animated floating label |
| LabelInputContainer | Input + label wrapper |
| LoadingSpinner | Animated loading spinner |

### Calendar Components (`src/components/calendar/`)

| Component | Purpose |
|-----------|---------|
| Calendar | Month grid with keyboard nav, range/single selection, 42-day grid |
| CalendarDay | Single day cell with slot indicators |
| AvailabilitySummary | Hours-per-slot-type summary |
| InstructorCarousel | Horizontal instructor slider with pagination |
| InstructorSwitcher | Dropdown to select instructor |
| InstructorAvatar | Circular avatar with fallback initial |
| SlotIndicator | Visual slot segment (pie chart style) |
| DisciplinesList | Discipline filter list |
| DisciplineInfo | Single discipline badge |
| DataInfoTooltip | Hover tooltip with booking details |
| ActionButton | CTA button (primary/secondary) |

### Other

| Directory | Components |
|-----------|-----------|
| `icons/` | SearchIcon, UserIcon, SkiIcon, SnowboardIcon, TouringIcon, FrenchFlag, ItalianFlag, EnglishFlag, SpanishFlag, GreekFlag, CalendarCheckIcon, TranslateIcon |
| `payment/` | CheckoutForm (Stripe), PricingCard |
| `analytics/` | MetricCard, ChartContainer, DateRangePicker, SignupsChart, InstructorSlotStats, ProfileCompletenessCard, InstructorDropdown |

---

## 8. State Management

### Zustand Cart Store (`src/lib/stores/cart-store.ts`)
```typescript
CartItem {
  id, instructorId, instructorName, instructorAvatar,
  location, discipline,
  selectedSlots: SelectedSlot[],  // date, daySlotId, daySlotName, startTime, endTime, hours, price
  totalHours, totalPrice, pricePerHour, addedAt
}
```
- **Actions**: `addToCart()`, `removeFromCart()`, `clearCart()`, `getCartTotal()`, `getItemCount()`
- **Persistence**: localStorage key `raven-cart-storage`

### Search Context (`src/lib/contexts/search-context.tsx`)
```typescript
SearchCriteria {
  location, startDate, endDate,
  participants: { adults, children },
  sport?
}
```
- **State**: criteria, locations, disciplines, modal open/close
- **Actions**: `setSearchCriteria()`, `openSearchModal()`, `closeSearchModal()`, `initializeFromUrl()`
- Fetches locations from `/api/resorts` on mount, falls back to `fallbackLocations`

### Auth Context (`src/lib/contexts/auth-context.tsx`)
- **State**: `user` (Supabase User object), `loading`
- **Actions**: `signOut()`, `refreshUser()`
- Listens to `onAuthStateChange` for session events

---

## 9. Database Schema

### Core Tables

**`instructors`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches auth.users.id |
| first_name | text | |
| last_name | text | |
| avatar_url | text | |
| banner_url | text | |
| biography | text | |
| years_of_experience | integer | |
| profile_status | integer | 2 = approved (filtered in queries) |
| created_at | timestamp | |

**`customers`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches auth.users.id |
| first_name | text | NOT NULL |
| last_name | text | NOT NULL |
| email | text | |
| date_of_birth | date | NOT NULL |
| avatar_url | text | |
| stripe_customer_id | text | |
| bio | text | **Requires migration** |
| created_at | timestamp | |

**`bookings`**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| reference | text | Auto-generated (e.g. RVNCDMGRL) |
| customer_id | uuid | FK → customers |
| instructor_id | uuid | FK → instructors |
| resort_id | bigint | FK → resorts |
| discipline_id | bigint | FK → disciplines |
| start_date, end_date | date | |
| price | bigint | In EUR |
| status | integer | FK → booking_status (default: 1) |
| payment_status | bigint | FK → payment_status (default: 1) |
| primary_name | text | |
| primary_email | text | |
| platform_cut | real | |
| is_disputed | boolean | Default: false |
| created_at | timestamp | |

**`booking_items`**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| booking_id | bigint | FK → bookings |
| booking_slot_id | bigint | |
| day_slot_id | bigint | 1-6, see day_slots |
| date | date | |
| start_time, end_time | time | |
| total_minutes | integer | |
| hourly_rate | numeric | |
| offer_id | bigint | |

**`booking_slots`** — Instructor availability configuration
| Column | Type | Notes |
|--------|------|-------|
| instructor_id | uuid | FK → instructors |
| day_slot_id | bigint | Which slot type is available |
| date | date | Which date it's available |

**`booking_payments`**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| booking_id | bigint | FK → bookings |
| price | bigint | |
| status | bigint | FK → payment_status |
| payment_type | enum | 'full' (default) |
| is_deposit | boolean | Default: false |
| deposit_amount | bigint | |
| balance_amount | bigint | |
| balance_due_date | timestamp | |
| stripe_refund_id | text | |
| metadata | jsonb | Default: {} |

### Instructor Detail Tables

**`instructor_offers`** — Pricing offers per instructor
| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| instructor_id | uuid | FK → instructors |
| hourly_rate_weekday | numeric | |
| status | text | 'active' = visible |

**`instructor_offer_disciplines`** — M:N join
| Column | Type |
|--------|------|
| offer_id | bigint → instructor_offers |
| discipline_id | bigint → disciplines |

**`instructor_offer_resorts`** — M:N join
| Column | Type |
|--------|------|
| offer_id | bigint → instructor_offers |
| resort_id | bigint → resorts |

**`instructor_images`**
| Column | Type |
|--------|------|
| instructor_id | uuid |
| image_url | text |
| created_at | timestamp |

**`user_languages`**
| Column | Type |
|--------|------|
| user_id | uuid |
| name | text |

### Reference Tables

**`day_slots`** — Time slot definitions
| ID | Name | Default Times |
|----|------|---------------|
| 1 | Full Day | 09:00 - 17:00 (8h) |
| 2 | Morning | 09:00 - 12:00 (3h) |
| 3 | Lunch | 12:00 - 14:00 (2h) |
| 4 | Afternoon | 14:00 - 17:00 (3h) |
| 5 | Evening | 17:00 - 20:00 (3h) |
| 6 | Night | 20:00 - 23:00 (3h) |

**Slot mutual exclusivity**: Full Day (1) covers Morning (2), Lunch (3), Afternoon (4). Defined as `FULL_DAY_COVERS_SLOTS = [2, 3, 4]` in `src/lib/types/cart.ts`. When Full Day is booked, those 3 slots show as unavailable.

**`booking_status`**
| ID | Name | Badge Color |
|----|------|-------------|
| 1 | requested_by_customer | amber |
| 2 | requested_by_instructor | amber |
| 3 | confirmed | green |
| 4 | declined | red |
| 5 | expired | gray |
| 6 | cancelled_by_instructor | red |
| 7 | cancelled_by_client | red |
| 8 | completed | green |
| 9 | active | blue |
| 10 | pending_payment | amber |
| 11 | deposit_paid | blue |

**`payment_status`**
| ID | Name | Badge Color |
|----|------|-------------|
| 1 | none | gray |
| 2 | pending | amber |
| 3 | paid | green |
| 4 | void | gray |
| 5 | deposit_paid | blue |
| 6 | refunded | red |

**`disciplines`** — Skiing, Snowboarding, Ski-Touring, Free-ride, Cross-Country, Free-style, Telemark, Adaptive

**`resorts`** — name, thumbnail_url, country_id (FK → countries), parent_id

**`notification_type`** — id, title, description, display_order

**`notification_unsubscribed`** — user_id, notification_type_id (presence = unsubscribed)

### Key Relationships
```
instructors ←1:M→ instructor_offers ←M:N→ disciplines (via instructor_offer_disciplines)
instructors ←1:M→ instructor_offers ←M:N→ resorts (via instructor_offer_resorts)
instructors ←1:M→ instructor_images
instructors ←1:M→ user_languages
instructors ←1:M→ booking_slots (availability config)
customers ←1:M→ bookings
instructors ←1:M→ bookings
bookings ←1:M→ booking_items (individual sessions)
bookings ←1:M→ booking_payments
auth.users ←1:1→ customers (same id)
auth.users ←1:1→ instructors (same id)
```

### Supabase Storage
- **Bucket**: `avatars`
- **Path**: `{user_id}/avatar.{ext}` (upsert)
- **Used by**: Profile page upload → stores public URL in `customers.avatar_url` + `auth.users.user_metadata.avatar_url`

---

## 10. Design System

### Theme (Dark)
- **Backgrounds**: `#000000` (page), `#0d0d0f` (darkest), `#1a1a1f` (panels/dropdowns)
- **Text**: white (primary), `#d5d5d6` (secondary), `#9696a5` (muted)
- **Accent**: `blue-400` (primary action), `green-400` (success), `red-400` (error), `amber-400` (warning)
- **Borders**: `white/10` (subtle), `white/15` (medium), `white/20` (prominent)

### Component Patterns
```css
/* Glass panel */
bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md

/* Input field */
bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3
font-['Archivo'] placeholder:text-[#9696a5]
focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent

/* Primary button */
bg-blue-400 text-white hover:bg-blue-500 rounded-xl py-3 font-['Archivo'] font-semibold

/* Secondary button */
bg-white/10 text-white hover:bg-white/20 border border-white/20

/* Status badge */
inline-flex px-3 py-1 rounded-full text-xs font-['Archivo'] font-semibold border
/* + color variants: bg-green-400/10 border-green-400/30 text-green-400 */

/* Label */
font-['Archivo'] text-sm text-[#d5d5d6] mb-2

/* Page heading */
font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white
```

### Fonts
- **`font-['PP_Editorial_New']`** — Serif, used for headings, logos, editorial text
- **`font-['Archivo']`** — Sans-serif, used for body text, labels, buttons, inputs
- **`font-inter`** — Alternative sans-serif (some headings)

### Animation Patterns (motion/react)
```typescript
// Fade in + slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Hover scale
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Staggered list items
transition={{ delay: idx * 0.05 }}

// Spring physics
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

### Tailwind Custom Animations (`tailwind.config.ts`)
`aurora`, `shimmer`, `spotlight`, `moveVertical`, `moveInCircle`, `moveHorizontal`, `slide-up`

### Responsive Breakpoints
- Mobile-first approach
- Grids: `grid-cols-1 sm:grid-cols-2`
- Flex: `flex-col sm:flex-row`
- Text: `text-2xl sm:text-3xl` headings, `text-xs sm:text-sm` body
- Padding: `p-4 sm:p-6` or `p-5 sm:p-8`
- Gaps: `gap-3 sm:gap-4`
- Overflow: `min-w-0 flex-1` on text, `flex-shrink-0` on fixed elements
- Mobile nav: horizontal scroll tabs with `overflow-x-auto`
- Desktop nav: sidebar `w-[240px]` hidden below `lg:`

---

## 11. Stripe Integration

**Status**: Partially implemented.

**What exists**:
- `src/lib/stripe/client.ts` — `getStripe()` lazy-loads Stripe.js
- `src/lib/stripe/server.ts` — Server-side Stripe instance
- `src/components/payment/checkout-form.tsx` — Stripe Elements form
- `src/components/payment/pricing-card.tsx` — Plan display cards
- `/pricing` page — Displays pricing cards

**What's TODO**:
- Checkout flow (`/raven/checkout`) currently simulates a 2-second API call and shows a success modal
- No actual Stripe charge or booking creation happens
- Need: Create `POST /api/bookings` to create booking + booking_items + initiate Stripe payment
- Need: Stripe webhook handler for payment confirmation

---

## 12. Static Assets (`/public/`)

```
/assets/
  /logos/        raven-logo.svg, raven-emblem.svg
  /icons/        skiing.png, snowboarding.png, ski-touring.png, free-ride-off-piste.png,
                 free-style-snowpark.png, cross-country.png, telemark.png, adaptive.png,
                 search.svg, checkmark.svg, user.svg, star.svg
  /images/       ski-bg-1 through 6.png, landing-hero-bg.png, content-section-1/2.png,
                 instructor-1/2/3.png, resort photos (courchevel.jpg, meribel.jpg, etc.)
/fonts/          PPEditorialNew-Regular.woff
/images/
  /disciplines/  skiing.png, snowboarding.png, telemark.png, mountain-guide.png
```

---

## 13. Key Patterns & Logic

### Fallback Data System
`src/lib/fallback-data.ts` provides static data when Supabase is unavailable:
- `fallbackLocations` — 30 French/Swiss ski resorts with prices
- `fallbackSportOptions` — 4 sport types (Skiing, Snowboarding, Ski Touring, All Sports)
- `fallbackSportDisciplines` — 8 disciplines with icon URLs

Components check `if (error || !data)` and fall back to these arrays.

### Search Logic (`src/lib/supabase/server-database.ts` → `searchInstructorsServer()`)
1. Fetch all instructors with `profile_status = 2` (approved)
2. Get their active `instructor_offers`
3. Filter by location (resort name partial match via `instructor_offer_resorts`)
4. Filter by disciplines via `instructor_offer_disciplines`
5. Filter by date availability (check `booking_items` for conflicts)
6. Attach `user_languages` and `instructor_images`
7. Calculate `minPrice` per instructor
8. Paginate with limit/offset

### Slot Selection Logic (`src/components/raven/slot-selection-modal.tsx`)
- Receives `configuredSlotIds` (which slot types the instructor actually offers)
- Filters displayed slots to only configured ones
- Full Day (ID 1) covers Morning (2), Lunch (3), Afternoon (4)
- Selecting Full Day removes individual covered slots from selection
- Selecting a covered slot removes Full Day from selection
- Already-booked slots are disabled

### Configured Slots (`src/app/api/calendar/configured-slots/route.ts`)
- Queries `booking_slots` table for instructor
- Returns distinct `day_slot_id` values = which slot types the instructor has configured
- Also returns `availableDates` = specific dates with availability

---

## 14. File Tree (key files)

```
src/
  app/
    layout.tsx                          # Root layout — fonts, providers
    page.tsx                            # Landing page
    raven/
      page.tsx                          # Redirect to /
      search/page.tsx                   # Search results (infinite scroll)
      profile/[id]/page.tsx             # Instructor profile + calendar
      cart/page.tsx                     # Shopping cart
      checkout/page.tsx                 # Checkout form
      login/page.tsx                    # Login (Suspense wrapped)
      signup/page.tsx                   # 2-step signup
      auth/callback/route.ts            # OAuth callback
      account/
        layout.tsx                      # Sidebar + tabs layout
        page.tsx                        # Redirect to /bookings
        bookings/page.tsx
        payments/page.tsx
        details/page.tsx
        security/page.tsx
        profile/page.tsx
        notifications/page.tsx
    api/
      auth/signup/route.ts
      account/{bookings,payments,details,security,profile,notifications}/route.ts
      calendar/{instructors,bookings,configured-slots,disciplines,instructor-images,instructor-resorts,offers}/route.ts
      search/instructors/route.ts
      resorts/route.ts
      analytics/{overview,signups,instructors,profile-completeness}/route.ts
      debug/{tables,disciplines}/route.ts
      supabase/stats/route.ts
  components/
    raven/                              # App-specific components
    ui/                                 # Reusable UI (modals, search, inputs)
    calendar/                           # Calendar + slot components
    payment/                            # Stripe components
    icons/                              # SVG icon components
    analytics/                          # Dashboard chart components
  lib/
    supabase/
      client.ts                         # Browser client (legacy)
      browser-auth.ts                   # Browser auth client (@supabase/ssr)
      server-auth.ts                    # Server auth client
      server-client.ts                  # Service role client (data queries)
      middleware-client.ts              # Middleware auth client
      database.ts                       # Client-side DB functions
      server-database.ts                # Server-side DB functions (main queries)
      types.ts                          # Database type definitions
    contexts/
      auth-context.tsx                  # AuthProvider + useAuth()
      search-context.tsx                # SearchProvider + useSearch()
    stores/
      cart-store.ts                     # Zustand cart (localStorage)
    types/
      cart.ts                           # CartItem, SelectedSlot, DAY_SLOT_NAMES, FULL_DAY_COVERS_SLOTS
    mock-data/
      instructors.ts                    # 25 generated mock instructors
    stripe/
      client.ts                         # Stripe.js loader
      server.ts                         # Server Stripe instance
      utils.ts                          # Helpers
    fallback-data.ts                    # Static fallback (locations, sports, disciplines)
    utils.ts                            # cn() utility (clsx + tailwind-merge)
    calendar/
      types.ts                          # BookingItem, CalendarProps, DaySlot
      utils.ts                          # Calendar date utilities
  designs/
    types.ts                            # Figma node types
    utils.ts                            # Design token extraction
    mappings/component-map.ts           # Figma → Aceternity component mapping
  middleware.ts                         # CORS + auth + route protection
```

---

## 15. Pending / TODO

### Required
- **DB Migration**: `ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS bio text;` — Profile bio saves will fail without this

### Not Yet Implemented
- **Stripe checkout**: `/raven/checkout` simulates payment — needs real Stripe charge + booking creation
- **Password reset**: No "forgot password" flow
- **Email verification**: No verification after email change
- **Avatar deletion**: Can only upload/replace, not remove
- **Booking cancellation**: No cancel button in account area
- **Invoice PDF download**: No PDF generation
- **Push notifications**: Only email notification preferences exist
- **Instructor onboarding**: No instructor signup/registration flow in this app (done elsewhere)

### Known Issues
- `next.config.ts` has `typescript.ignoreBuildErrors = true`
- Root page title is still "Create Next App"
- `SearchContext` fetch errors in console (non-blocking, uses fallback data)
- Some `@typescript-eslint/no-explicit-any` warnings in database/server files
