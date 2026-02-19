# TradeStock Marketplace - Deployment Guide

## Prerequisites

- Node.js 18+ installed locally
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- Vercel account (https://vercel.com)
- Domain name (tradestock.ie or similar)

---

## Step 1: Supabase Setup

### 1.1 Create New Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: `tradestock-marketplace`
4. Choose region: `Dublin (eu-west-1)` for Irish users
5. Set database password (save securely)
6. Wait for project to be created

### 1.2 Get API Credentials

1. Go to Project Settings → API
2. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Run Migrations

#### Option A: Using Supabase Dashboard (SQL Editor)

1. Go to SQL Editor
2. Create a "New Query"
3. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_seed_data.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 1.4 Configure Auth

1. Go to Authentication → Settings
2. Enable Email provider
3. Configure email templates:
   - Confirm signup: Use custom template
   - Reset password: Use custom template
4. Set Site URL: `https://your-domain.com`
5. Add Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/reset-password`

### 1.5 Configure Storage

1. Go to Storage
2. Create buckets:
   - `dealer-logos` (public)
   - `listing-photos` (public)
3. Set bucket policies (see RLS migration for policies)

---

## Step 2: Stripe Setup

### 2.1 Create Products and Prices

1. Go to https://dashboard.stripe.com
2. Products → Add Product

#### Basic Plan (€50/month)
- Name: "TradeStock Basic"
- Price: €50.00 / month
- Copy Price ID → `STRIPE_PRICE_BASIC`

#### Premium Plan (€100/month)
- Name: "TradeStock Premium"
- Price: €100.00 / month
- Copy Price ID → `STRIPE_PRICE_PREMIUM`

### 2.2 Get API Keys

1. Developers → API Keys
2. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 2.3 Configure Webhook

1. Developers → Webhooks
2. Add endpoint:
   - Endpoint URL: `https://your-domain.com/api/stripe/webhooks`
   - Events to send:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Copy Signing secret → `STRIPE_WEBHOOK_SECRET`

### 2.4 Configure Customer Portal

1. Settings → Billing → Customer Portal
2. Enable:
   - Customer can update payment methods
   - Customer can update subscriptions
   - Customer can cancel subscriptions
3. Set Business name and terms

---

## Step 3: Local Development

### 3.1 Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/tradestock-marketplace.git
cd tradestock-marketplace

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### 3.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PREMIUM=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_LAUNCH_DATE=2026-03-06

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@tradestock.ie

# Monitoring (optional)
SENTRY_DSN=
```

### 3.3 Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Step 4: Vercel Deployment

### 4.1 Create Project

1. Go to https://vercel.com
2. Import GitHub repository
3. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.2 Environment Variables

Add all environment variables from `.env.local` to Vercel:

1. Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development

### 4.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit deployed URL

### 4.4 Custom Domain

1. Project Settings → Domains
2. Add your domain: `tradestock.ie`
3. Follow DNS configuration instructions
4. Wait for SSL certificate to be issued

---

## Step 5: Post-Deployment

### 5.1 Create Admin User

Run in Supabase SQL Editor:

```sql
-- Create admin user (replace with your email)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@tradestock.ie',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'
);
```

### 5.2 Test Stripe Webhook (Local Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### 5.3 Verify Deployment

Checklist:
- [ ] Homepage loads
- [ ] Application form submits
- [ ] Login works
- [ ] Dealer dashboard accessible
- [ ] Stripe checkout works
- [ ] Webhooks receiving events
- [ ] Email notifications sending
- [ ] Image uploads working
- [ ] RLS policies active

---

## Step 6: Monitoring & Maintenance

### 6.1 Set Up Sentry (Optional)

1. Create Sentry account
2. Add project
3. Copy DSN to environment variables
4. Install Sentry SDK:

```bash
npx @sentry/wizard@latest -i nextjs
```

### 6.2 Database Backups

Supabase provides daily backups. To configure:

1. Database → Backups
2. Verify backup schedule
3. Test restore process

### 6.3 Log Monitoring

- Vercel: Functions tab for server logs
- Supabase: Logs & Analytics
- Stripe: Developers → Logs

---

## Troubleshooting

### Common Issues

#### 1. RLS Policy Errors

```sql
-- Check if RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('dealers', 'listings', 'dealer_users');

-- Check policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### 2. Stripe Webhook Failures

- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Check Vercel function logs
- Test webhook delivery in Stripe dashboard

#### 3. Auth Redirect Loops

- Check middleware.ts routing logic
- Verify session is being set correctly
- Check for conflicting redirects

#### 4. Image Upload Failures

- Verify storage buckets exist
- Check bucket policies are correct
- Verify CORS settings

---

## Security Checklist

- [ ] All RLS policies enabled
- [ ] Service role key not exposed to client
- [ ] Stripe webhook secret secured
- [ ] Environment variables in Vercel (not in code)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

---

## Production Checklist

Before going live:

- [ ] Use Stripe live mode (not test)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set `PLATFORM_LAUNCH_DATE` correctly
- [ ] Configure email sending domain
- [ ] Test all user flows
- [ ] Test admin workflows
- [ ] Test payment flows
- [ ] Verify email notifications
- [ ] Load test critical paths
- [ ] Set up monitoring alerts
- [ ] Document support procedures

---

## Support Contacts

- **Technical Issues**: dev@tradestock.ie
- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
