-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'sdr', 'dealer');
CREATE TYPE dealer_status AS ENUM ('pending', 'approved', 'suspended', 'removed');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive');
CREATE TYPE ticket_status AS ENUM ('open', 'bot_handling', 'escalated', 'closed');
CREATE TYPE message_sender_type AS ENUM ('dealer', 'admin', 'bot');
CREATE TYPE commission_type AS ENUM ('standard_activation', 'lifetime_activation', 'monthly_bonus', 'retention_bonus');

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'dealer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Counties reference table
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL
);

-- Insert all 32 Irish counties
INSERT INTO counties (name, province) VALUES
('Antrim', 'Ulster'), ('Armagh', 'Ulster'), ('Carlow', 'Leinster'), 
('Cavan', 'Ulster'), ('Clare', 'Munster'), ('Cork', 'Munster'),
('Derry', 'Ulster'), ('Donegal', 'Ulster'), ('Down', 'Ulster'),
('Dublin', 'Leinster'), ('Fermanagh', 'Ulster'), ('Galway', 'Connacht'),
('Kerry', 'Munster'), ('Kildare', 'Leinster'), ('Kilkenny', 'Leinster'),
('Laois', 'Leinster'), ('Leitrim', 'Connacht'), ('Limerick', 'Munster'),
('Longford', 'Leinster'), ('Louth', 'Leinster'), ('Mayo', 'Connacht'),
('Meath', 'Leinster'), ('Monaghan', 'Ulster'), ('Offaly', 'Leinster'),
('Roscommon', 'Connacht'), ('Sligo', 'Connacht'), ('Tipperary', 'Munster'),
('Tyrone', 'Ulster'), ('Waterford', 'Munster'), ('Westmeath', 'Leinster'),
('Wexford', 'Leinster'), ('Wicklow', 'Leinster');

-- SDRs table
CREATE TABLE sdrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  employee_code TEXT UNIQUE,
  target_monthly INTEGER DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dealers table
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  source_sdr_id UUID REFERENCES sdrs(id) ON DELETE SET NULL,
  
  -- Business Info
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  vat_number TEXT NOT NULL UNIQUE,
  county_id INTEGER REFERENCES counties(id),
  address TEXT NOT NULL,
  
  -- Status
  status dealer_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  
  -- Promo
  lifetime_discount BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL UNIQUE REFERENCES dealers(id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'inactive',
  
  -- Stripe IDs
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  
  -- Lifetime promo
  lifetime_active BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicle listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- Vehicle Details
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  body_type TEXT NOT NULL, -- saloon, hatchback, estate, van, suv, coupe, convertible
  fuel_type TEXT NOT NULL, -- petrol, diesel, hybrid, electric
  transmission TEXT NOT NULL, -- manual, automatic
  engine_size TEXT, -- e.g., "2.0L"
  mileage INTEGER,
  color TEXT,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  vat_included BOOLEAN NOT NULL DEFAULT true,
  
  -- Description
  title TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  
  -- Media
  images TEXT[],
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'withdrawn')),
  
  -- Views/Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  enquiry_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved listings (favourites)
CREATE TABLE saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dealer_id, listing_id)
);

-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role_target user_role NOT NULL,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  sdr_id UUID REFERENCES sdrs(id) ON DELETE SET NULL,
  
  -- Token (hashed)
  token_hash TEXT NOT NULL UNIQUE,
  
  -- Expiry & Usage
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id)
);

-- Message threads (conversations)
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  participant_1_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  status ticket_status NOT NULL DEFAULT 'open',
  subject TEXT NOT NULL,
  category TEXT, -- billing, technical, general
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support messages (ticket replies)
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type message_sender_type NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- For bot responses: confidence, suggested_actions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commission events (immutable log)
CREATE TABLE commission_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type commission_type NOT NULL,
  sdr_id UUID NOT NULL REFERENCES sdrs(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commission summaries (for fast leaderboard queries)
CREATE TABLE commission_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sdr_id UUID NOT NULL REFERENCES sdrs(id) ON DELETE CASCADE,
  period_month DATE NOT NULL, -- First day of month
  total_commission DECIMAL(10, 2) NOT NULL DEFAULT 0,
  activation_count INTEGER NOT NULL DEFAULT 0,
  bonus_count INTEGER NOT NULL DEFAULT 0,
  retention_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(sdr_id, period_month)
);

-- Retention bonuses tracking (for idempotency)
CREATE TABLE retention_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sdr_id UUID NOT NULL REFERENCES sdrs(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  interval_number INTEGER NOT NULL, -- 1 = first 90 days, 2 = 90-180 days, etc.
  amount DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sdr_id, dealer_id, interval_number)
);

-- Promo counter (singleton for lifetime activations)
CREATE TABLE promo_counters (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  lifetime_activation_count INTEGER NOT NULL DEFAULT 0,
  max_lifetime_activations INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert singleton row
INSERT INTO promo_counters (id, lifetime_activation_count, max_lifetime_activations) VALUES (1, 0, 100);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_dealers_user_id ON dealers(user_id);
CREATE INDEX idx_dealers_status ON dealers(status);
CREATE INDEX idx_dealers_source_sdr_id ON dealers(source_sdr_id);
CREATE INDEX idx_dealers_county_id ON dealers(county_id);

CREATE INDEX idx_subscriptions_dealer_id ON subscriptions(dealer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

CREATE INDEX idx_listings_dealer_id ON listings(dealer_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_make_model ON listings(make, model);

CREATE INDEX idx_saved_listings_dealer_id ON saved_listings(dealer_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings(listing_id);

CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token_hash ON invitations(token_hash);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

CREATE INDEX idx_message_threads_participant_1 ON message_threads(participant_1_id);
CREATE INDEX idx_message_threads_participant_2 ON message_threads(participant_2_id);
CREATE INDEX idx_message_threads_listing ON message_threads(listing_id);
CREATE INDEX idx_message_threads_last_message ON message_threads(last_message_at DESC);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_support_tickets_dealer_id ON support_tickets(dealer_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);

CREATE INDEX idx_commission_events_sdr_id ON commission_events(sdr_id);
CREATE INDEX idx_commission_events_occurred_at ON commission_events(occurred_at DESC);
CREATE INDEX idx_commission_events_type ON commission_events(type);

CREATE INDEX idx_commission_summaries_sdr_id ON commission_summaries(sdr_id);
CREATE INDEX idx_commission_summaries_period ON commission_summaries(period_month);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$;

-- Check if current user is SDR
CREATE OR REPLACE FUNCTION is_sdr()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN sdrs s ON s.user_id = p.id
    WHERE p.id = auth.uid() 
    AND p.role = 'sdr' 
    AND p.is_active = true
    AND s.is_active = true
  );
END;
$$;

-- Get current dealer ID
CREATE OR REPLACE FUNCTION current_dealer_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dealer_id UUID;
BEGIN
  SELECT d.id INTO dealer_id
  FROM dealers d
  JOIN profiles p ON p.id = d.user_id
  WHERE p.id = auth.uid()
  AND p.role = 'dealer';
  
  RETURN dealer_id;
END;
$$;

-- Check if dealer is approved
CREATE OR REPLACE FUNCTION dealer_is_approved(dealer_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dealers 
    WHERE id = dealer_uuid 
    AND status = 'approved'
  );
END;
$$;

-- Check if dealer has active subscription
CREATE OR REPLACE FUNCTION dealer_has_active_subscription(dealer_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE dealer_id = dealer_uuid 
    AND (status = 'active' OR status = 'trialing' OR lifetime_active = true)
  );
END;
$$;

-- Check if lifetime promo is available
CREATE OR REPLACE FUNCTION promo_lifetime_available()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available BOOLEAN;
BEGIN
  SELECT (lifetime_activation_count < max_lifetime_activations AND is_active)
  INTO available
  FROM promo_counters
  WHERE id = 1;
  
  RETURN COALESCE(available, false);
END;
$$;

-- Consume a lifetime promo slot (atomic)
CREATE OR REPLACE FUNCTION consume_promo_lifetime()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN := false;
BEGIN
  UPDATE promo_counters
  SET lifetime_activation_count = lifetime_activation_count + 1,
      updated_at = NOW()
  WHERE id = 1
    AND lifetime_activation_count < max_lifetime_activations
    AND is_active = true;
  
  IF FOUND THEN
    success := true;
  END IF;
  
  RETURN success;
END;
$$;

-- Get remaining promo slots
CREATE OR REPLACE FUNCTION promo_slots_remaining()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT GREATEST(0, max_lifetime_activations - lifetime_activation_count)
  INTO remaining
  FROM promo_counters
  WHERE id = 1;
  
  RETURN COALESCE(remaining, 0);
END;
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON profiles
  FOR ALL USING (is_admin());

-- Dealers policies
CREATE POLICY "Dealers can read own record" ON dealers
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_admin() 
    OR (is_sdr() AND source_sdr_id IN (SELECT id FROM sdrs WHERE user_id = auth.uid()))
  );

CREATE POLICY "Admin can manage all dealers" ON dealers
  FOR ALL USING (is_admin());

CREATE POLICY "SDR can create dealers" ON dealers
  FOR INSERT WITH CHECK (
    is_sdr() 
    AND source_sdr_id IN (SELECT id FROM sdrs WHERE user_id = auth.uid())
  );

-- SDRs policies
CREATE POLICY "SDRs can read own record" ON sdrs
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admin can manage SDRs" ON sdrs
  FOR ALL USING (is_admin());

-- Subscriptions policies
CREATE POLICY "Dealers can read own subscription" ON subscriptions
  FOR SELECT USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Only service role can update subscriptions" ON subscriptions
  FOR ALL USING (false); -- Only via service role / webhooks

-- Listings policies
CREATE POLICY "Dealers can CRUD own listings" ON listings
  FOR ALL USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Approved dealers with active subscription can browse listings" ON listings
  FOR SELECT USING (
    status = 'active'
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1 FROM dealers d
        JOIN subscriptions s ON s.dealer_id = d.id
        WHERE d.user_id = auth.uid()
        AND d.status = 'approved'
        AND (s.status = 'active' OR s.lifetime_active = true)
      )
    )
  );

-- Saved listings policies
CREATE POLICY "Dealers can manage own saved listings" ON saved_listings
  FOR ALL USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

-- Invitations policies
CREATE POLICY "Admin and SDR can read invitations they created" ON invitations
  FOR SELECT USING (
    is_admin() 
    OR created_by = auth.uid()
  );

CREATE POLICY "Admin and SDR can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    is_admin() 
    OR is_sdr()
  );

CREATE POLICY "Admin can update invitations" ON invitations
  FOR UPDATE USING (is_admin());

-- Message threads policies
CREATE POLICY "Participants can read their threads" ON message_threads
  FOR SELECT USING (
    participant_1_id = current_dealer_id()
    OR participant_2_id = current_dealer_id()
    OR is_admin()
  );

CREATE POLICY "Dealers can create threads" ON message_threads
  FOR INSERT WITH CHECK (
    participant_1_id = current_dealer_id()
    AND dealer_has_active_subscription(participant_1_id)
    AND dealer_has_active_subscription(participant_2_id)
  );

-- Messages policies
CREATE POLICY "Thread participants can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
      AND (t.participant_1_id = current_dealer_id() OR t.participant_2_id = current_dealer_id())
    )
    OR is_admin()
  );

CREATE POLICY "Dealers can send messages to their threads" ON messages
  FOR INSERT WITH CHECK (
    sender_dealer_id = current_dealer_id()
    AND EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
      AND (t.participant_1_id = current_dealer_id() OR t.participant_2_id = current_dealer_id())
    )
  );

-- Support tickets policies
CREATE POLICY "Dealers can read own tickets" ON support_tickets
  FOR SELECT USING (
    dealer_id = current_dealer_id()
    OR is_admin()
  );

CREATE POLICY "Dealers can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (
    dealer_id = current_dealer_id()
  );

CREATE POLICY "Admin can manage all tickets" ON support_tickets
  FOR ALL USING (is_admin());

-- Support messages policies
CREATE POLICY "Ticket participants can read messages" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_messages.ticket_id
      AND (t.dealer_id = current_dealer_id() OR is_admin())
    )
  );

CREATE POLICY "Dealers can reply to own tickets" ON support_messages
  FOR INSERT WITH CHECK (
    sender_type = 'dealer'
    AND EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_messages.ticket_id
      AND t.dealer_id = current_dealer_id()
    )
  );

CREATE POLICY "Admin and bot can reply to any ticket" ON support_messages
  FOR INSERT WITH CHECK (
    sender_type IN ('admin', 'bot')
    AND is_admin()
  );

-- Commission policies
CREATE POLICY "SDRs can read own commissions" ON commission_events
  FOR SELECT USING (
    sdr_id IN (SELECT id FROM sdrs WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Only service role can create commission events" ON commission_events
  FOR INSERT WITH CHECK (false);

CREATE POLICY "SDRs can read own summaries" ON commission_summaries
  FOR SELECT USING (
    sdr_id IN (SELECT id FROM sdrs WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Promo counters policies (read-only for all, update only via functions)
CREATE POLICY "Anyone can read promo counter" ON promo_counters
  FOR SELECT USING (true);

CREATE POLICY "Only functions can update promo counter" ON promo_counters
  FOR ALL USING (false);

-- Audit logs policies
CREATE POLICY "Admin can read audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Service role can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sdrs_updated_at
  BEFORE UPDATE ON sdrs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_counters_updated_at
  BEFORE UPDATE ON promo_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update message_threads last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_thread_last_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_last_message();

-- ============================================
-- COMMISSION TRIGGER (on subscription activation)
-- ============================================

CREATE OR REPLACE FUNCTION handle_subscription_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  dealer_sdr_id UUID;
  is_first_activation BOOLEAN;
  commission_amount DECIMAL(10, 2);
  is_lifetime BOOLEAN;
BEGIN
  -- Only process when status changes to active
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    
    -- Get the dealer's SDR
    SELECT source_sdr_id INTO dealer_sdr_id
    FROM dealers
    WHERE id = NEW.dealer_id;
    
    -- Check if this is the first time this dealer became active
    SELECT NOT EXISTS (
      SELECT 1 FROM commission_events
      WHERE dealer_id = NEW.dealer_id
      AND type IN ('standard_activation', 'lifetime_activation')
    ) INTO is_first_activation;
    
    IF is_first_activation AND dealer_sdr_id IS NOT NULL THEN
      -- Determine if lifetime promo
      is_lifetime := NEW.lifetime_active;
      
      -- Set commission amount
      IF is_lifetime THEN
        commission_amount := 20.00;
      ELSE
        commission_amount := 40.00;
      END IF;
      
      -- Create commission event
      INSERT INTO commission_events (
        type,
        sdr_id,
        dealer_id,
        amount,
        description,
        metadata
      ) VALUES (
        CASE WHEN is_lifetime THEN 'lifetime_activation'::commission_type ELSE 'standard_activation'::commission_type END,
        dealer_sdr_id,
        NEW.dealer_id,
        commission_amount,
        CASE WHEN is_lifetime THEN 'Lifetime launch activation commission' ELSE 'Standard activation commission' END,
        jsonb_build_object('subscription_id', NEW.id, 'stripe_subscription_id', NEW.stripe_subscription_id)
      );
      
      -- Update commission summary for current month
      INSERT INTO commission_summaries (sdr_id, period_month, total_commission, activation_count)
      VALUES (dealer_sdr_id, DATE_TRUNC('month', NOW()), commission_amount, 1)
      ON CONFLICT (sdr_id, period_month)
      DO UPDATE SET
        total_commission = commission_summaries.total_commission + commission_amount,
        activation_count = commission_summaries.activation_count + 1;
      
      -- Check for monthly bonus (every 100 activations)
      PERFORM check_monthly_bonus(dealer_sdr_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscription_activation_commission
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_subscription_activation();

-- Monthly bonus check function
CREATE OR REPLACE FUNCTION check_monthly_bonus(sdr_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_month_activations INTEGER;
  bonus_threshold INTEGER := 100;
  current_threshold INTEGER;
  bonuses_already_awarded INTEGER;
BEGIN
  -- Count activations this month for this SDR
  SELECT COUNT(*) INTO current_month_activations
  FROM commission_events
  WHERE sdr_id = sdr_uuid
  AND type IN ('standard_activation', 'lifetime_activation')
  AND occurred_at >= DATE_TRUNC('month', NOW());
  
  -- Count how many bonuses already awarded this month
  SELECT COUNT(*) INTO bonuses_already_awarded
  FROM commission_events
  WHERE sdr_id = sdr_uuid
  AND type = 'monthly_bonus'
  AND occurred_at >= DATE_TRUNC('month', NOW());
  
  -- Calculate which threshold we're at
  current_threshold := (current_month_activations / bonus_threshold) * bonus_threshold;
  
  -- Award bonus if we've crossed a new 100 threshold
  WHILE bonuses_already_awarded < (current_threshold / bonus_threshold) LOOP
    bonuses_already_awarded := bonuses_already_awarded + 1;
    
    INSERT INTO commission_events (
      type,
      sdr_id,
      amount,
      description,
      metadata
    ) VALUES (
      'monthly_bonus',
      sdr_uuid,
      1000.00,
      'Monthly bonus for ' || (bonuses_already_awarded * bonus_threshold) || ' activations',
      jsonb_build_object('threshold', bonuses_already_awarded * bonus_threshold)
    );
    
    -- Update summary
    INSERT INTO commission_summaries (sdr_id, period_month, total_commission, bonus_count)
    VALUES (sdr_uuid, DATE_TRUNC('month', NOW()), 1000.00, 1)
    ON CONFLICT (sdr_id, period_month)
    DO UPDATE SET
      total_commission = commission_summaries.total_commission + 1000.00,
      bonus_count = commission_summaries.bonus_count + 1;
  END LOOP;
END;
$$;

-- ============================================
-- REALTIME SETUP
-- ============================================

-- Enable realtime for relevant tables
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE commission_events REPLICA IDENTITY FULL;
ALTER TABLE listings REPLICA IDENTITY FULL;

-- Add tables to realtime publication (run this in Supabase dashboard SQL editor if needed)
-- publication supabase_realtime;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE listings;
