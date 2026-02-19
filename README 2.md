# TradeStock Marketplace

## Ireland's Premier B2B Motor Dealer Platform

TradeStock Marketplace is a private, verified B2B platform for Irish motor dealers to move stock fast by listing to other verified dealers, messaging directly, and making offers.

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Type** | B2B SaaS Marketplace |
| **Target Market** | Irish Motor Dealerships |
| **Revenue Model** | Monthly Subscriptions (€50/€100) |
| **Launch Date** | March 6, 2026 |
| **Tech Stack** | Next.js 14, Supabase, Stripe |

---

## Deliverables

This repository contains:

### 1. Technical Architecture
- **File**: `ARCHITECTURE.md`
- Comprehensive architecture document covering:
  - Folder structure
  - Routing strategy
  - Auth middleware design
  - Supabase schema overview
  - Security architecture
  - Performance considerations

### 2. Database Schema
- **Location**: `supabase/migrations/`
- Four migration files:
  - `001_initial_schema.sql` - All tables, indexes, constraints
  - `002_rls_policies.sql` - Row Level Security policies
  - `003_functions_triggers.sql` - Database functions and triggers
  - `004_seed_data.sql` - Reference data and sample data

### 3. Next.js Implementation
- **Location**: `implementation/`
- Complete application code including:
  - Auth system (login, signup, password reset)
  - Dealer dashboard and management
  - Listing creation and management
  - Admin workflows
  - Stripe integration
  - Marketplace features
  - Messaging system
  - Offer system

### 4. Deployment Guide
- **File**: `DEPLOYMENT.md`
- Step-by-step deployment instructions for:
  - Supabase setup
  - Stripe configuration
  - Vercel deployment
  - Post-deployment verification

### 5. QA Test Plan
- **File**: `QA_TEST_PLAN.md`
- Comprehensive testing documentation:
  - Acceptance criteria
  - Test cases by feature
  - Test accounts
  - Regression test suite

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Vercel account (optional, for deployment)

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/tradestock-marketplace.git
cd tradestock-marketplace/implementation

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit http://localhost:3000

### Database Setup

1. Create Supabase project
2. Run migrations in order:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or via SQL Editor in dashboard
   # Copy and execute each migration file
   ```

---

## Project Structure

```
tradestock-marketplace/
├── ARCHITECTURE.md           # Technical architecture
├── DEPLOYMENT.md             # Deployment guide
├── QA_TEST_PLAN.md           # Testing documentation
├── README.md                 # This file
├── supabase/
│   └── migrations/           # SQL migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_functions_triggers.sql
│       └── 004_seed_data.sql
└── implementation/           # Next.js application
    ├── src/
    │   ├── app/              # Next.js App Router
    │   ├── components/       # React components
    │   ├── hooks/            # Custom hooks
    │   └── lib/              # Utilities and config
    ├── package.json
    └── .env.example
```

---

## Key Features

### For Dealers

- **Profile Management**: Complete company profile with logo, contact info, brands
- **Listing Management**: Create, edit, and manage vehicle listings
- **Photo Upload**: Up to 20 photos per listing
- **Subscription Management**: Subscribe, upgrade, cancel via Stripe
- **Marketplace Access**: Browse vehicles with advanced filters
- **Messaging**: Direct communication with other dealers
- **Offers**: Make, receive, counter, and accept offers
- **Saved Searches**: Save filter presets for quick access

### For Admins

- **Dashboard**: Platform metrics and overview
- **Application Review**: Approve/reject dealer applications
- **Listing Moderation**: Review and approve listings
- **Dealer Management**: View and manage all dealers
- **Reports**: Activity logs and analytics
- **Settings**: Platform configuration

---

## Security Features

- **Row Level Security (RLS)**: All tables protected
- **Role-Based Access Control**: Admin, Owner, Admin, Member roles
- **IDOR Protection**: Users can only access their own data
- **Input Validation**: Server-side validation on all inputs
- **Rate Limiting**: Protection against brute force
- **Secure File Uploads**: Image validation and safe storage
- **Audit Logging**: All actions tracked

---

## Launch Date Gating

The platform has a configurable launch date (March 6, 2026):

**Before Launch:**
- Dealers can sign up and complete profile
- Dealers can create listings
- Dealers CANNOT browse marketplace
- Dealers CANNOT message other dealers
- Dealers CANNOT make offers

**After Launch:**
- Full marketplace access for subscribed dealers

---

## Irish Terminology

The platform uses Irish/UK terminology:

| Irish/UK | US |
|----------|-----|
| Saloon | Sedan |
| Estate | Wagon |
| Petrol | Gas |
| Manual/Automatic | Stick/Auto |
| NCT | MOT/Inspection |
| Eircode | ZIP Code |
| VAT | Sales Tax |

---

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Basic** | €50/month | Up to 50 listings, basic filters, messaging |
| **Premium** | €100/month | Unlimited listings, advanced filters, analytics |

---

## API Endpoints

### Stripe Webhooks
- `POST /api/stripe/webhooks` - Stripe event handling

### Stripe Checkout
- `POST /api/stripe/checkout` - Create checkout session

### Stripe Portal
- `POST /api/stripe/portal` - Create billing portal session

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC=
STRIPE_PRICE_PREMIUM=

# App
NEXT_PUBLIC_APP_URL=
PLATFORM_LAUNCH_DATE=2026-03-06

# Email
RESEND_API_KEY=
EMAIL_FROM=

# Monitoring
SENTRY_DSN=
```

---

## Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

See `QA_TEST_PLAN.md` for comprehensive testing documentation.

---

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## Support

- **Technical Issues**: dev@tradestock.ie
- **General Inquiries**: support@tradestock.ie

---

## License

Proprietary - All rights reserved.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

*TradeStock Marketplace © 2024*
