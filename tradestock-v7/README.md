# TradeStock Marketplace v2

Ireland's Premier B2B Motor Trading Platform - A complete dealership management system with three portals (Dealer, SDR, Admin), Stripe subscriptions, real-time messaging, and comprehensive commission tracking.

## Features

### Three Portals
- **Dealer Portal**: Manage stock, browse listings, message other dealers, handle billing
- **SDR Portal**: Add dealerships, track performance, view commissions and leaderboard
- **Admin Portal**: Full platform control, user management, subscriptions, audit logs

### Key Features
- ✅ **Lifetime Launch Promo**: First 100 dealerships get €49.99/month forever
- ✅ **Stripe Subscriptions**: Automated billing with webhook integration
- ✅ **Real-time Updates**: Live dashboards, messaging, and notifications
- ✅ **Commission Tracking**: Automatic €40/€20 commissions, €1000 monthly bonuses, €25 retention bonuses
- ✅ **Launch Gating**: Pre-launch restrictions with countdown timer
- ✅ **Support Tickets**: AI-powered bot with escalation to admin
- ✅ **Dealer Messaging**: Threaded conversations between dealers
- ✅ **32 Irish Counties**: Full coverage including Northern Ireland

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui-style components
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: Stripe (Checkout + Webhooks)
- **Email**: Resend
- **AI**: OpenAI (optional, fallback to rule-based)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Resend account (optional, emails log to console without)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tradestock-marketplace.git
cd tradestock-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_LIFETIME_PRICE_ID=price_...

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tradestock.ie
RESEND_FROM_NAME="TradeStock Marketplace"

# Application
APP_BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# Optional: OpenAI for support bot
OPENAI_API_KEY=sk-...

# Launch Date (Europe/Dublin timezone)
LAUNCH_DATE=2026-03-30T00:00:00+01:00
```

### Database Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the migration file: `supabase/migrations/001_init.sql`
4. This will create all tables, indexes, triggers, RLS policies, and helper functions

### Seed the Database

Create the initial admin user:

```bash
npm run seed
```

This creates an admin user with the credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stripe Webhook Setup

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
4. Copy the webhook signing secret to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

For production, configure the webhook endpoint in your Stripe Dashboard:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy!

### Supabase Realtime

Enable realtime for these tables in your Supabase dashboard:
- `messages`
- `support_messages`
- `listings`
- `commission_events`

## User Flows

### Dealer Onboarding (SDR-Created)
1. SDR adds dealership in SDR portal
2. System creates dealer record + sends activation email
3. Dealer clicks email link → `/auth/set-password?token=...`
4. Dealer sets password → Auto-signed in
5. If lifetime promo available → Offer €49.99/month
6. Dealer subscribes via Stripe Checkout
7. Full platform access granted

### Admin-Created SDR
1. Admin creates SDR in admin portal
2. System sends activation email
3. SDR sets password
4. SDR can immediately add dealerships

## Commission Structure

| Type | Amount | Conditions |
|------|--------|------------|
| Standard Activation | €40 | Dealer subscribes at €99.99/month |
| Lifetime Activation | €20 | Dealer gets lifetime €49.99 offer |
| Monthly Bonus | €1,000 | Every 100 activations in a month |
| Retention Bonus | €25 | Every 90 days per active dealer |

## API Routes

- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Create customer portal session
- `GET /api/invites/validate` - Validate invitation token
- `POST /api/invites/accept` - Accept invitation & create account
- `POST /api/cron/retention` - Process retention bonuses (run daily)

## File Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── set-password/
│   │   ├── (portals)/
│   │   │   ├── dealer/
│   │   │   ├── admin/
│   │   │   └── sdr/
│   │   ├── api/
│   │   │   ├── webhooks/stripe/
│   │   │   ├── stripe/
│   │   │   └── invites/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # shadcn-style components
│   │   ├── layout/       # Navigation, drawers
│   │   ├── shared/       # Reusable components
│   │   ├── dealer/       # Dealer-specific
│   │   ├── admin/        # Admin-specific
│   │   └── sdr/          # SDR-specific
│   ├── lib/
│   │   ├── supabase/     # Client, server, admin clients
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── types/
│   │   └── email/
│   └── hooks/
├── supabase/
│   └── migrations/
│       └── 001_init.sql
├── scripts/
│   └── seed.ts
├── public/
└── package.json
```

## Testing

### Test Credit Card (Stripe)
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Testing Lifetime Promo
1. Set `lifetime_activation_count` to 99 in `promo_counters` table
2. Create a new dealer via SDR portal
3. Activate the dealer account
4. Should see lifetime offer (€49.99)
5. Create one more dealer - should see standard price (€99.99)

### Testing Launch Gate
1. Set `LAUNCH_DATE` to a future date
2. Login as dealer
3. Verify countdown banner appears
4. Verify "Browse Stock" and "Messages" are locked
5. Set date to past - features unlock

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check TypeScript types with `npx tsc --noEmit`

### Database Issues
- Verify RLS policies are correctly set
- Check that triggers are created
- Ensure `promo_counters` has row with `id = 1`

### Stripe Webhook Issues
- Verify webhook secret is correct
- Check Stripe CLI is forwarding correctly
- Review webhook logs in Stripe Dashboard

## License

MIT License - see LICENSE file for details.

## Support

For support, contact support@tradestock.ie or create a ticket in the platform.

---

Built with ❤️ for Irish motor dealers.
