-- TradeStock Marketplace - Initial Schema Migration
-- Created: 2024
-- Description: Core tables for B2B motor dealer marketplace

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. DEALER APPLICATIONS
-- ============================================

CREATE TABLE dealer_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Company Information
    company_name TEXT NOT NULL,
    trading_name TEXT,
    vat_number TEXT UNIQUE,
    
    -- Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    county TEXT NOT NULL,
    eircode TEXT,
    
    -- Contact Information
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    
    -- Business Details
    dealership_type TEXT NOT NULL CHECK (dealership_type IN ('franchise', 'independent', 'multi_franchise', 'wholesaler')),
    brands_sold TEXT[],
    stock_volume_monthly INTEGER CHECK (stock_volume_monthly >= 0),
    
    -- Application
    message TEXT,
    how_did_you_hear TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    
    -- Review
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_applications_status ON dealer_applications(status);
CREATE INDEX idx_applications_email ON dealer_applications(contact_email);
CREATE INDEX idx_applications_vat ON dealer_applications(vat_number);
CREATE INDEX idx_applications_created ON dealer_applications(created_at DESC);

-- ============================================
-- 2. DEALERS
-- ============================================

CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID UNIQUE REFERENCES dealer_applications(id),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    subscription_status TEXT NOT NULL DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled', 'unpaid')),
    
    -- Stripe
    stripe_customer_id TEXT UNIQUE,
    
    -- Onboarding
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dealers_status ON dealers(status);
CREATE INDEX idx_dealers_subscription ON dealers(subscription_status);
CREATE INDEX idx_dealers_stripe ON dealers(stripe_customer_id);

-- ============================================
-- 3. DEALER PROFILES
-- ============================================

CREATE TABLE dealer_profiles (
    dealer_id UUID PRIMARY KEY REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Company Information
    company_name TEXT NOT NULL,
    trading_name TEXT,
    vat_number TEXT UNIQUE,
    company_registration_number TEXT,
    
    -- Logo & Media
    logo_url TEXT,
    cover_image_url TEXT,
    
    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    county TEXT,
    eircode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Business Details
    description TEXT,
    year_established INTEGER,
    brands_specializing TEXT[],
    services_offered TEXT[] DEFAULT '{}',
    
    -- Opening Hours (JSON structure)
    opening_hours JSONB DEFAULT '{}',
    
    -- Social Media
    social_media JSONB DEFAULT '{}',
    
    -- Settings
    notification_preferences JSONB DEFAULT '{"email_listings": true, "email_messages": true, "email_offers": true}',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_county ON dealer_profiles(county);
CREATE INDEX idx_profiles_brands ON dealer_profiles USING GIN(brands_specializing);

-- ============================================
-- 4. DEALER USERS (Auth Users linked to Dealers)
-- ============================================

CREATE TABLE dealer_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Profile
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Role
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    
    -- Contact
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Invitation
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    invitation_token TEXT UNIQUE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    joined_at TIMESTAMPTZ,
    
    -- Metadata
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, dealer_id)
);

-- Indexes
CREATE INDEX idx_dealer_users_user ON dealer_users(user_id);
CREATE INDEX idx_dealer_users_dealer ON dealer_users(dealer_id);
CREATE INDEX idx_dealer_users_role ON dealer_users(role);
CREATE INDEX idx_dealer_users_invitation ON dealer_users(invitation_token);

-- ============================================
-- 5. SUBSCRIPTIONS (Stripe)
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Stripe
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    stripe_product_id TEXT,
    
    -- Plan
    plan_name TEXT NOT NULL,
    plan_amount_eur INTEGER NOT NULL,
    plan_interval TEXT NOT NULL DEFAULT 'month',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'active', 'past_due', 'cancelled', 'unpaid', 'paused')),
    
    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Cancellation
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_dealer ON subscriptions(dealer_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================
-- 6. LISTINGS
-- ============================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Reference
    reference_number TEXT UNIQUE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'sold', 'withdrawn', 'expired')),
    
    -- Visibility
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    
    -- Views & Engagement
    view_count INTEGER NOT NULL DEFAULT 0,
    enquiry_count INTEGER NOT NULL DEFAULT 0,
    offer_count INTEGER NOT NULL DEFAULT 0,
    
    -- Sale
    sold_at TIMESTAMPTZ,
    sold_to_dealer_id UUID REFERENCES dealers(id),
    sold_price_eur INTEGER,
    
    -- Moderation
    moderation_notes TEXT,
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_dealer ON listings(dealer_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_dealer_status ON listings(dealer_id, status);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_featured ON listings(is_featured, featured_until);

-- ============================================
-- 7. LISTING DETAILS (Vehicle Specifications)
-- ============================================

CREATE TABLE listing_details (
    listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Vehicle Identification
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    
    -- Registration
    registration_number TEXT,
    vin_number TEXT,
    
    -- Specifications
    mileage_km INTEGER NOT NULL CHECK (mileage_km >= 0),
    price_eur INTEGER NOT NULL CHECK (price_eur >= 0),
    price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable', 'poa')),
    
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg')),
    transmission TEXT NOT NULL CHECK (transmission IN ('manual', 'automatic', 'semi_automatic', 'cvt')),
    body_type TEXT NOT NULL CHECK (body_type IN ('hatchback', 'saloon', 'estate', 'suv', 'coupe', 'convertible', 'van', 'pickup', 'mpv', 'jeep')),
    
    engine_size_cc INTEGER,
    power_kw INTEGER,
    power_ps INTEGER,
    
    colour TEXT NOT NULL,
    colour_type TEXT CHECK (colour_type IN ('solid', 'metallic', 'pearlescent', 'matte')),
    
    -- Irish Specific
    nct_expiry DATE,
    tax_band TEXT,
    annual_tax_eur INTEGER,
    
    -- History
    previous_owners INTEGER DEFAULT 0,
    service_history TEXT CHECK (service_history IN ('full', 'part', 'none')),
    last_service_date DATE,
    last_service_km INTEGER,
    
    -- Condition
    condition_description TEXT,
    trade_in_suitable BOOLEAN NOT NULL DEFAULT TRUE,
    needs_prep BOOLEAN NOT NULL DEFAULT FALSE,
    retail_ready BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Location
    location_county TEXT NOT NULL,
    location_city TEXT,
    
    -- Features
    features TEXT[] DEFAULT '{}',
    
    -- Additional
    warranty_months INTEGER,
    warranty_description TEXT,
    finance_available BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search/filtering
CREATE INDEX idx_details_make ON listing_details(make);
CREATE INDEX idx_details_model ON listing_details(model);
CREATE INDEX idx_details_make_model ON listing_details(make, model);
CREATE INDEX idx_details_year ON listing_details(year);
CREATE INDEX idx_details_price ON listing_details(price_eur);
CREATE INDEX idx_details_mileage ON listing_details(mileage_km);
CREATE INDEX idx_details_fuel ON listing_details(fuel_type);
CREATE INDEX idx_details_transmission ON listing_details(transmission);
CREATE INDEX idx_details_body ON listing_details(body_type);
CREATE INDEX idx_details_location ON listing_details(location_county);
CREATE INDEX idx_details_nct ON listing_details(nct_expiry);
CREATE INDEX idx_details_trade_in ON listing_details(trade_in_suitable);

-- Full-text search
CREATE INDEX idx_details_search ON listing_details 
    USING gin(to_tsvector('english', make || ' ' || model || ' ' || COALESCE(variant, '')));

-- ============================================
-- 8. LISTING PHOTOS
-- ============================================

CREATE TABLE listing_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Storage
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    
    -- Display
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Metadata
    file_name TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    width_pixels INTEGER,
    height_pixels INTEGER,
    
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_photos_listing ON listing_photos(listing_id);
CREATE INDEX idx_photos_primary ON listing_photos(listing_id, is_primary);
CREATE INDEX idx_photos_order ON listing_photos(listing_id, sort_order);

-- ============================================
-- 9. MESSAGES (Chat Threads)
-- ============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Related to listing (optional - can be direct message)
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    
    -- Participants
    sender_dealer_id UUID NOT NULL REFERENCES dealers(id),
    recipient_dealer_id UUID NOT NULL REFERENCES dealers(id),
    
    -- Thread info
    subject TEXT,
    
    -- Status
    sender_archived BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_archived BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sender_last_read_at TIMESTAMPTZ,
    recipient_last_read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint
    CHECK (sender_dealer_id != recipient_dealer_id)
);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_dealer_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_dealer_id);
CREATE INDEX idx_messages_listing ON messages(listing_id);
CREATE INDEX idx_messages_last_message ON messages(last_message_at DESC);

-- ============================================
-- 10. MESSAGE ITEMS (Individual Messages)
-- ============================================

CREATE TABLE message_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Sender
    sender_user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Content
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    -- Status
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_message_items_thread ON message_items(thread_id);
CREATE INDEX idx_message_items_created ON message_items(created_at);
CREATE INDEX idx_message_items_thread_created ON message_items(thread_id, created_at DESC);

-- ============================================
-- 11. OFFERS
-- ============================================

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Related entities
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_dealer_id UUID NOT NULL REFERENCES dealers(id),
    seller_dealer_id UUID NOT NULL REFERENCES dealers(id),
    
    -- Offer details
    amount_eur INTEGER NOT NULL CHECK (amount_eur > 0),
    message TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired')),
    
    -- Counter offer
    counter_amount_eur INTEGER,
    counter_message TEXT,
    
    -- Response
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES auth.users(id),
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_dealer_id);
CREATE INDEX idx_offers_seller ON offers(seller_dealer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created ON offers(created_at DESC);

-- ============================================
-- 12. NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Action
    action_url TEXT,
    action_text TEXT,
    
    -- Status
    read_at TIMESTAMPTZ,
    
    -- Delivery
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- 13. SAVED SEARCHES
-- ============================================

CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Search details
    name TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    
    -- Notifications
    notify_new_matches BOOLEAN NOT NULL DEFAULT FALSE,
    last_notified_at TIMESTAMPTZ,
    
    -- Results count (cached)
    last_result_count INTEGER,
    last_checked_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_searches_dealer ON saved_searches(dealer_id);
CREATE INDEX idx_saved_searches_notify ON saved_searches(notify_new_matches, last_notified_at);

-- ============================================
-- 14. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    actor_id UUID REFERENCES auth.users(id),
    actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'admin', 'system')),
    
    -- Action
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    -- Details
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partitioning for audit logs (optional, for high volume)
-- CREATE TABLE audit_logs_2024 PARTITION OF audit_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- ============================================
-- 15. PLATFORM SETTINGS
-- ============================================

CREATE TABLE platform_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton table
    
    -- Launch
    launch_date DATE NOT NULL DEFAULT '2026-03-06',
    pre_launch_mode BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Features
    allow_new_applications BOOLEAN NOT NULL DEFAULT TRUE,
    require_listing_approval BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Pricing
    basic_plan_price_eur INTEGER DEFAULT 5000, -- cents
    premium_plan_price_eur INTEGER DEFAULT 10000,
    
    -- Limits
    max_listings_per_dealer INTEGER DEFAULT 100,
    max_photos_per_listing INTEGER DEFAULT 20,
    max_team_members INTEGER DEFAULT 10,
    
    -- Contact
    support_email TEXT DEFAULT 'support@tradestock.ie',
    support_phone TEXT,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO platform_settings (id, launch_date) VALUES (1, '2026-03-06');

-- ============================================
-- 16. FAVOURITES
-- ============================================

CREATE TABLE favourites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(dealer_id, listing_id)
);

-- Indexes
CREATE INDEX idx_favourites_dealer ON favourites(dealer_id);
CREATE INDEX idx_favourites_listing ON favourites(listing_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_dealer_applications_updated_at BEFORE UPDATE ON dealer_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_profiles_updated_at BEFORE UPDATE ON dealer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_users_updated_at BEFORE UPDATE ON dealer_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listing_details_updated_at BEFORE UPDATE ON listing_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REFERENCE NUMBER GENERATOR
-- ============================================

CREATE OR REPLACE FUNCTION generate_listing_reference()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    random_suffix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YY');
    random_suffix := upper(substring(md5(random()::text) from 1 for 6));
    NEW.reference_number := 'TS' || year_prefix || '-' || random_suffix;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_listing_reference BEFORE INSERT ON listings
    FOR EACH ROW WHEN (NEW.reference_number IS NULL)
    EXECUTE FUNCTION generate_listing_reference();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE dealer_applications IS 'Initial dealer applications before approval';
COMMENT ON TABLE dealers IS 'Approved dealers with subscription status';
COMMENT ON TABLE dealer_profiles IS 'Extended company information for dealers';
COMMENT ON TABLE dealer_users IS 'Links auth users to dealers with roles';
COMMENT ON TABLE subscriptions IS 'Stripe subscription records synced via webhooks';
COMMENT ON TABLE listings IS 'Vehicle listings with moderation status';
COMMENT ON TABLE listing_details IS 'Vehicle specifications and details';
COMMENT ON TABLE listing_photos IS 'Photos for vehicle listings';
COMMENT ON TABLE messages IS 'Chat threads between dealers';
COMMENT ON TABLE message_items IS 'Individual messages in threads';
COMMENT ON TABLE offers IS 'Offers made on listings';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE saved_searches IS 'Dealer saved filter presets';
COMMENT ON TABLE audit_logs IS 'Activity tracking for compliance';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration (singleton)';
COMMENT ON TABLE favourites IS 'Dealer saved/favourite listings';
