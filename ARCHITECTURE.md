# TradeStock Marketplace - Technical Architecture

## Executive Summary

Production-grade B2B marketplace for Irish motor dealers. Built with Next.js 14 App Router, Supabase (PostgreSQL + Auth), and Stripe Billing. Enterprise security with RLS, deterministic routing, and bulletproof auth flows.

---

## 1. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, file-based routing |
| **Language** | TypeScript 5.x | Type safety, developer experience |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix | Accessible, customizable components |
| **Database** | Supabase PostgreSQL | Primary data store |
| **Auth** | Supabase Auth | JWT-based authentication |
| **Storage** | Supabase Storage | Listing photos, documents |
| **Payments** | Stripe Billing | Subscriptions, invoicing |
| **Email** | Resend / SendGrid | Transactional emails |
| **Monitoring** | Sentry (recommended) | Error tracking |
| **Hosting** | Vercel | Edge deployment |

---

## 2. Folder Structure

```
app/
├── (auth)/                          # Auth route group (no nav)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (public)/                        # Public marketing pages
│   ├── page.tsx                     # Home/Landing
│   ├── how-it-works/page.tsx
│   ├── pricing/page.tsx
│   ├── apply/page.tsx               # Dealer application form
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── terms/page.tsx
│   └── privacy/page.tsx
│
├── (dealer)/                        # Dealer area (with dealer nav)
│   ├── layout.tsx                   # Dealer layout with sidebar
│   ├── dashboard/page.tsx
│   ├── listings/
│   │   ├── page.tsx                 # My Listings
│   │   ├── create/page.tsx          # Create Listing
│   │   └── [id]/page.tsx            # Listing Detail
│   ├── profile/page.tsx             # Dealer Profile
│   ├── team/page.tsx                # Team Members
│   ├── billing/page.tsx             # Subscription management
│   └── security/page.tsx            # Password, 2FA
│
├── (marketplace)/                   # Restricted marketplace
│   ├── layout.tsx                   # Marketplace layout
│   ├── browse/page.tsx              # Browse Vehicles
│   ├── saved-searches/page.tsx
│   ├── dealers/page.tsx             # Dealer Directory
│   ├── dealers/[id]/page.tsx        # Public Dealer Profile
│   ├── messages/page.tsx            # Inbox
│   ├── messages/[threadId]/page.tsx # Chat Thread
│   ├── offers/page.tsx              # Offers management
│   └── notifications/page.tsx       # Notification Center
│
├── (admin)/                         # Admin area (admin only)
│   ├── layout.tsx                   # Admin layout
│   ├── dashboard/page.tsx
│   ├── applications/page.tsx        # Review applications
│   ├── listings/page.tsx            # Moderation queue
│   ├── dealers/page.tsx             # Manage dealers
│   ├── reports/page.tsx             # Activity logs
│   └── settings/page.tsx            # Platform settings
│
├── api/                             # API routes
│   ├── auth/
│   │   └── callback/route.ts
│   ├── stripe/
│   │   ├── checkout/route.ts
│   │   ├── portal/route.ts
│   │   └── webhooks/route.ts
│   ├── listings/
│   │   └── [id]/photos/route.ts
│   └── upload/route.ts
│
├── layout.tsx                       # Root layout
├── globals.css
└── error.tsx

components/
├── ui/                              # shadcn/ui components
├── forms/                           # Form components
├── listings/                        # Listing-specific components
├── marketplace/                     # Marketplace components
├── admin/                           # Admin components
├── layout/                          # Layout components (nav, sidebar)
└── shared/                          # Shared utilities

lib/
├── supabase/                        # Supabase clients
│   ├── client.ts                    # Browser client
│   ├── server.ts                    # Server client
│   └── admin.ts                     # Service role client
├── stripe/                          # Stripe configuration
│   └── index.ts
├── auth/                            # Auth utilities
│   ├── routing.ts                   # Centralized routing logic
│   ├── guards.ts                    # Route guards
│   └── hooks.ts                     # Auth hooks
├── constants.ts                     # App constants (launch date, etc.)
├── types/                           # TypeScript types
│   ├── database.ts                  # DB types
│   ├── api.ts                       # API types
│   └── index.ts
└── utils.ts                         # General utilities

hooks/
├── use-auth.ts
├── use-dealer.ts
├── use-subscription.ts
├── use-launch-date.ts
└── use-marketplace-access.ts

middleware.ts                        # Next.js middleware (auth routing)

supabase/
├── migrations/                      # SQL migrations
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_functions_triggers.sql
│   └── 004_seed_data.sql
└── seed.sql

types/
└── supabase.ts                      # Generated Supabase types

public/
├── images/
└── fonts/

.env.local                           # Environment variables
.env.example
next.config.js
tailwind.config.ts
```

---

## 3. Routing Strategy & Access Control

### 3.1 Route Groups

| Group | Prefix | Access | Layout |
|-------|--------|--------|--------|
| `(public)` | `/` | Anyone | Marketing layout |
| `(auth)` | `/login`, `/signup` | Unauthenticated only | Minimal layout |
| `(dealer)` | `/dashboard`, `/listings` | Approved dealers | Dealer sidebar |
| `(marketplace)` | `/browse`, `/messages` | Subscribed + post-launch | Marketplace nav |
| `(admin)` | `/admin/*` | Admin only | Admin sidebar |

### 3.2 Deterministic Routing Priority

**All routing decisions happen in ONE place: `middleware.ts`**

Priority order (highest to lowest):

```
1. NOT logged in + accessing protected route → /login
2. Admin user → allow /admin/*, redirect /dashboard → /admin/dashboard
3. Dealer with pending application → /pending-approval
4. Dealer approved but unsubscribed → /billing (allow profile/listings)
5. Before launch date + accessing restricted page → /launch-countdown
6. All checks passed → allow requested page
```

### 3.3 Route Classification

**PUBLIC (no auth)**
- `/`, `/how-it-works`, `/pricing`, `/apply`, `/faq`, `/contact`, `/terms`, `/privacy`

**AUTH (unauthenticated only)**
- `/login`, `/signup`, `/forgot-password`, `/reset-password`

**DEALER AREA (approved dealers)**
- `/dashboard` - Overview with subscription status, launch countdown
- `/listings/*` - My listings (create, edit, view)
- `/profile` - Company profile
- `/team` - Team members
- `/billing` - Subscription management
- `/security` - Account security

**MARKETPLACE (subscribed + post-launch)**
- `/browse` - Vehicle search with filters
- `/saved-searches` - Saved filter presets
- `/dealers` - Dealer directory
- `/dealers/[id]` - Public dealer profiles
- `/messages` - Inbox and chat
- `/offers` - Offer management
- `/notifications` - Notification center

**ADMIN (admin only)**
- `/admin/dashboard` - Platform metrics
- `/admin/applications` - Review dealer applications
- `/admin/listings` - Moderation queue
- `/admin/dealers` - Manage dealers
- `/admin/reports` - Activity logs
- `/admin/settings` - Platform configuration

---

## 4. Auth Middleware Strategy

### 4.1 Middleware (`middleware.ts`)

```typescript
// Centralized routing logic - NO redirects elsewhere
export async function middleware(request: NextRequest) {
  const { user, role, dealerStatus, subscriptionStatus } = await getAuthState(request);
  
  const path = request.nextUrl.pathname;
  
  // 1. Public routes - always allow
  if (isPublicRoute(path)) return NextResponse.next();
  
  // 2. Not logged in → login
  if (!user) return redirectTo('/login', request);
  
  // 3. Admin → admin area
  if (role === 'admin') {
    if (path.startsWith('/admin')) return NextResponse.next();
    return redirectTo('/admin/dashboard', request);
  }
  
  // 4. Dealer pending approval
  if (dealerStatus === 'pending') {
    if (path === '/pending-approval') return NextResponse.next();
    return redirectTo('/pending-approval', request);
  }
  
  // 5. Dealer not approved
  if (dealerStatus === 'rejected') {
    return redirectTo('/application-rejected', request);
  }
  
  // 6. Approved dealer - check subscription for marketplace
  if (dealerStatus === 'approved') {
    // Always allow dealer area
    if (isDealerRoute(path)) return NextResponse.next();
    
    // Marketplace requires subscription + launch date
    if (isMarketplaceRoute(path)) {
      if (!subscriptionStatus?.active) {
        return redirectTo('/billing?reason=subscription_required', request);
      }
      if (isBeforeLaunch()) {
        return redirectTo('/launch-countdown', request);
      }
    }
    
    return NextResponse.next();
  }
  
  // Fallback
  return redirectTo('/login', request);
}
```

### 4.2 Auth State Helper

```typescript
// lib/auth/routing.ts
export async function getAuthState(request: NextRequest): Promise<AuthState> {
  const supabase = createMiddlewareClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { user: null };
  
  // Single query for all user metadata
  const { data: dealerUser } = await supabase
    .from('dealer_users')
    .select('role, dealer:dealers(status, subscription:subscriptions(status))')
    .eq('user_id', user.id)
    .single();
  
  return {
    user,
    role: user.app_metadata.role || dealerUser?.role || 'dealer',
    dealerStatus: dealerUser?.dealer?.status,
    subscriptionStatus: dealerUser?.dealer?.subscription
  };
}
```

---

## 5. Supabase Schema Overview

### 5.1 Core Tables

```
dealer_applications          # Initial dealer applications
├── id (uuid, PK)
├── company_name (text)
├── vat_number (text, unique)
├── address_line1, address_line2, city, county, eircode
├── contact_name, contact_email, contact_phone
├── dealership_type (franchise/independent/multi)
├── brands_sold (text[])
├── stock_volume_monthly (int)
├── message (text)
├── status (pending/approved/rejected)
├── rejection_reason (text)
├── reviewed_by (uuid)
├── reviewed_at (timestamptz)
├── created_at, updated_at

dealers                      # Approved dealers
├── id (uuid, PK)
├── application_id (uuid, FK)
├── status (active/suspended/inactive)
├── subscription_status (none/active/past_due/cancelled)
├── stripe_customer_id (text)
├── created_at, updated_at

dealer_profiles              # Extended dealer info
├── dealer_id (uuid, PK, FK)
├── company_name (text)
├── trading_name (text)
├── vat_number (text)
├── logo_url (text)
├── website (text)
├── phone, email
├── address_line1, address_line2, city, county, eircode
├── description (text)
├── brands_specializing (text[])
├── services_offered (text[])
├── opening_hours (jsonb)
├── social_media (jsonb)
├── created_at, updated_at

dealer_users                 # Auth users linked to dealers
├── id (uuid, PK)
├── user_id (uuid, FK auth.users)
├── dealer_id (uuid, FK dealers)
├── email (text)
├── role (owner/admin/member)
├── is_primary_contact (boolean)
├── invited_by (uuid)
├── invited_at (timestamptz)
├── joined_at (timestamptz)
├── created_at, updated_at

subscriptions                # Stripe subscriptions
├── id (uuid, PK)
├── dealer_id (uuid, FK)
├── stripe_subscription_id (text)
├── stripe_price_id (text)
├── plan_name (text)
├── status (active/past_due/cancelled/unpaid)
├── current_period_start (timestamptz)
├── current_period_end (timestamptz)
├── cancel_at_period_end (boolean)
├── created_at, updated_at

listings                     # Vehicle listings
├── id (uuid, PK)
├── dealer_id (uuid, FK)
├── reference_number (text, unique)
├── status (draft/pending/approved/rejected/sold/withdrawn)
├── moderation_notes (text)
├── moderated_by (uuid)
├── moderated_at (timestamptz)
├── created_at, updated_at

listing_details              # Vehicle specifications
├── listing_id (uuid, PK, FK)
├── make (text)
├── model (text)
├── variant (text)
├── year (int)
├── mileage_km (int)
├── price_eur (int)
├── fuel_type (petrol/diesel/hybrid/plugin_hybrid/electric)
├── transmission (manual/automatic)
├── body_type (hatchback/saloon/estate/suv/coupe/convertible/van/pickup)
├── engine_size_cc (int)
├── colour (text)
├── nct_expiry (date)
├── tax_band (text)
├── previous_owners (int)
├── service_history (full/part/none)
├── condition_description (text)
├── trade_in_suitable (boolean)
├── needs_prep (boolean)
├── retail_ready (boolean)
├── location_county (text)
├── features (text[])

listing_photos               # Vehicle photos
├── id (uuid, PK)
├── listing_id (uuid, FK)
├── storage_path (text)
├── public_url (text)
├── sort_order (int)
├── is_primary (boolean)
├── uploaded_at (timestamptz)

messages                     # Chat threads
├── id (uuid, PK)
├── listing_id (uuid, FK, nullable)
├── sender_dealer_id (uuid, FK)
├── recipient_dealer_id (uuid, FK)
├── subject (text)
├── created_at, updated_at

message_items                # Individual messages
├── id (uuid, PK)
├── thread_id (uuid, FK messages)
├── sender_user_id (uuid, FK auth.users)
├── content (text)
├── attachments (jsonb)
├── read_at (timestamptz)
├── created_at

offers                       # Offers on listings
├── id (uuid, PK)
├── listing_id (uuid, FK)
├── buyer_dealer_id (uuid, FK)
├── seller_dealer_id (uuid, FK)
├── amount_eur (int)
├── status (pending/accepted/rejected/countered/withdrawn)
├── message (text)
├── counter_amount_eur (int)
├── responded_at (timestamptz)
├── created_at, updated_at

notifications                # User notifications
├── id (uuid, PK)
├── user_id (uuid, FK auth.users)
├── type (text)
├── title (text)
├── message (text)
├── data (jsonb)
├── read_at (timestamptz)
├── created_at

saved_searches               # Dealer saved filters
├── id (uuid, PK)
├── dealer_id (uuid, FK)
├── name (text)
├── filters (jsonb)
├── notify_new_matches (boolean)
├── last_notified_at (timestamptz)
├── created_at, updated_at

audit_logs                   # Activity tracking
├── id (uuid, PK)
├── actor_id (uuid, FK auth.users)
├── actor_type (user/admin/system)
├── action (text)
├── resource_type (text)
├── resource_id (uuid)
├── metadata (jsonb)
├── ip_address (inet)
├── user_agent (text)
├── created_at
```

### 5.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_listings_dealer_status ON listings(dealer_id, status);
CREATE INDEX idx_listings_status_created ON listings(status, created_at);
CREATE INDEX idx_listings_make_model ON listing_details(make, model);
CREATE INDEX idx_listings_price ON listing_details(price_eur);
CREATE INDEX idx_listings_location ON listing_details(location_county);
CREATE INDEX idx_messages_thread ON message_items(thread_id, created_at);
CREATE INDEX idx_offers_listing ON offers(listing_id, status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at, created_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## 6. Stripe Integration Plan

### 6.1 Subscription Flow

```
1. Dealer clicks "Subscribe" → /api/stripe/checkout
2. Create Stripe Checkout Session with:
   - customer (create if new)
   - price_id (from env)
   - success_url: /billing?success=true
   - cancel_url: /billing?canceled=true
3. Dealer completes payment on Stripe
4. Stripe redirects back to success_url
5. Webhook `checkout.session.completed` updates DB
6. Webhook `invoice.payment_succeeded` extends subscription
7. Webhook `customer.subscription.updated` syncs status
```

### 6.2 Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription record |
| `invoice.payment_succeeded` | Update period end, set active |
| `invoice.payment_failed` | Set past_due, notify dealer |
| `customer.subscription.updated` | Sync status, plan changes |
| `customer.subscription.deleted` | Set cancelled, update access |

### 6.3 Database Sync Strategy

- **Source of truth**: Stripe for payment state
- **Cached state**: `subscriptions` table for fast access checks
- **Sync method**: Webhooks update DB within seconds
- **Fallback**: Daily sync job (optional)

---

## 7. Launch Date Gating

### 7.1 Configuration

```typescript
// lib/constants.ts
export const PLATFORM_CONFIG = {
  LAUNCH_DATE: '2026-03-06T00:00:00+00:00', // March 6th, 2026
  TIMEZONE: 'Europe/Dublin',
} as const;

export function isBeforeLaunch(): boolean {
  const now = new Date();
  const launch = new Date(PLATFORM_CONFIG.LAUNCH_DATE);
  return now < launch;
}

export function getLaunchCountdown(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const launch = new Date(PLATFORM_CONFIG.LAUNCH_DATE);
  const diff = launch.getTime() - now.getTime();
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
}
```

### 7.2 Access Matrix

| Feature | Before Launch | After Launch |
|---------|---------------|--------------|
| Login/Signup | ✅ | ✅ |
| Complete Profile | ✅ | ✅ |
| Add Team Members | ✅ | ✅ |
| Create Listings | ✅ | ✅ |
| View Own Listings | ✅ | ✅ |
| Subscribe to Plan | ✅ | ✅ |
| Browse Marketplace | ❌ | ✅ (with subscription) |
| View Other Dealers | ❌ | ✅ (with subscription) |
| Send Messages | ❌ | ✅ (with subscription) |
| Make Offers | ❌ | ✅ (with subscription) |

---

## 8. Security Architecture

### 8.1 Row Level Security (RLS) Principles

1. **Enable RLS on all tables** (except audit_logs)
2. **Default deny** - no access without explicit policy
3. **Role-based policies** - admin, dealer_owner, dealer_member
4. **Dealer isolation** - dealers can only see their own data
5. **Resource ownership** - verify ownership on every access

### 8.2 RLS Policy Patterns

```sql
-- Admin: full access
CREATE POLICY "Admin full access" ON table_name
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer: own data only
CREATE POLICY "Dealer own data" ON table_name
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dealer_users du
      WHERE du.user_id = auth.uid()
      AND du.dealer_id = table_name.dealer_id
    )
  );

-- Public read: approved listings only
CREATE POLICY "Public approved listings" ON listings
  FOR SELECT TO authenticated
  USING (status = 'approved');
```

### 8.3 IDOR Protection

- All queries include `dealer_id` filter
- Verify ownership before update/delete
- Use database functions for complex authorization
- Never trust client-provided IDs without verification

---

## 9. Performance Considerations

### 9.1 Query Optimization

- Use selective column queries (avoid `SELECT *`)
- Implement cursor-based pagination
- Cache subscription status in JWT claims
- Use database functions for complex aggregations

### 9.2 Image Handling

- Upload: Client → Supabase Storage (signed URLs)
- Transform: Supabase Image Transformations
- CDN: Automatic via Supabase
- Limits: 20 photos per listing, 10MB max each

### 9.3 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10/minute |
| `/api/apply` | 5/hour per IP |
| `/api/listings` | 100/minute |
| `/api/messages` | 60/minute |

---

## 10. Error Handling Strategy

### 10.1 Error Categories

| Category | Handling |
|----------|----------|
| Auth errors | Redirect to login with message |
| Validation errors | Return 400 with field errors |
| Not found | Return 404, show error page |
| Server errors | Log to Sentry, return 500 |
| Stripe errors | Return error message, retry logic |

### 10.2 User Feedback

- Toast notifications for async actions
- Inline validation for forms
- Error boundaries for React errors
- Fallback UI for loading states

---

## 11. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC=price_xxx  # €50/mo
STRIPE_PRICE_PREMIUM=price_xxx # €100/mo

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_LAUNCH_DATE=2026-03-06

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@tradestock.ie

# Monitoring (Sentry)
SENTRY_DSN=
```

---

## 12. Deployment Architecture

```
┌─────────────────┐
│   Vercel Edge   │  Next.js App Router
│   (Next.js)     │  - SSR/SSG
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │  JWT Authentication
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase PostgreSQL │  Primary Database
│   (RLS enabled) │  - All business data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Storage│  Listing photos
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     Stripe      │  Payments & Billing
│   (Webhooks)    │
└─────────────────┘
```

---

## Next Steps

1. ✅ **Phase 1**: Architecture (this document)
2. **Phase 2**: Database migrations and RLS policies
3. **Phase 3**: Core auth and routing implementation
4. **Phase 4**: Baseline UI shell
5. **Phase 5+**: Feature implementation

---

*Document Version: 1.0*
*Last Updated: 2024*
*Author: Senior Lead Engineer*
