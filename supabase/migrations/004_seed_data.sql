-- TradeStock Marketplace - Seed Data
-- Created: 2024
-- Description: Initial seed data for development and testing

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

INSERT INTO platform_settings (
    id,
    launch_date,
    pre_launch_mode,
    allow_new_applications,
    require_listing_approval,
    basic_plan_price_eur,
    premium_plan_price_eur,
    max_listings_per_dealer,
    max_photos_per_listing,
    max_team_members,
    support_email,
    support_phone
) VALUES (
    1,
    '2026-03-06',
    true,
    true,
    true,
    5000,    -- €50.00
    10000,   -- €100.00
    100,
    20,
    10,
    'support@tradestock.ie',
    '+353 1 234 5678'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE DATA (for development only)
-- ============================================

-- Note: In production, remove or comment out the sample data below

-- Sample Counties (Irish counties)
CREATE TABLE IF NOT EXISTS counties (
    name TEXT PRIMARY KEY,
    province TEXT
);

INSERT INTO counties (name, province) VALUES
    ('Carlow', 'Leinster'),
    ('Cavan', 'Ulster'),
    ('Clare', 'Munster'),
    ('Cork', 'Munster'),
    ('Donegal', 'Ulster'),
    ('Dublin', 'Leinster'),
    ('Galway', 'Connacht'),
    ('Kerry', 'Munster'),
    ('Kildare', 'Leinster'),
    ('Kilkenny', 'Leinster'),
    ('Laois', 'Leinster'),
    ('Leitrim', 'Connacht'),
    ('Limerick', 'Munster'),
    ('Longford', 'Leinster'),
    ('Louth', 'Leinster'),
    ('Mayo', 'Connacht'),
    ('Meath', 'Leinster'),
    ('Monaghan', 'Ulster'),
    ('Offaly', 'Leinster'),
    ('Roscommon', 'Connacht'),
    ('Sligo', 'Connacht'),
    ('Tipperary', 'Munster'),
    ('Waterford', 'Munster'),
    ('Westmeath', 'Leinster'),
    ('Wexford', 'Leinster'),
    ('Wicklow', 'Leinster')
ON CONFLICT (name) DO NOTHING;

-- Sample Vehicle Makes and Models
CREATE TABLE IF NOT EXISTS vehicle_makes (
    name TEXT PRIMARY KEY,
    country TEXT,
    is_popular BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS vehicle_models (
    make TEXT REFERENCES vehicle_makes(name),
    name TEXT,
    body_types TEXT[],
    PRIMARY KEY (make, name)
);

-- Insert makes
INSERT INTO vehicle_makes (name, country, is_popular) VALUES
    ('Audi', 'Germany', true),
    ('BMW', 'Germany', true),
    ('Ford', 'USA', true),
    ('Hyundai', 'South Korea', true),
    ('Kia', 'South Korea', true),
    ('Mercedes-Benz', 'Germany', true),
    ('Nissan', 'Japan', true),
    ('Opel', 'Germany', true),
    ('Peugeot', 'France', false),
    ('Renault', 'France', false),
    ('Skoda', 'Czech Republic', true),
    ('Toyota', 'Japan', true),
    ('Volkswagen', 'Germany', true),
    ('Volvo', 'Sweden', false)
ON CONFLICT (name) DO NOTHING;

-- Insert models
INSERT INTO vehicle_models (make, name, body_types) VALUES
    ('Audi', 'A1', ARRAY['hatchback']),
    ('Audi', 'A3', ARRAY['hatchback', 'saloon']),
    ('Audi', 'A4', ARRAY['saloon', 'estate']),
    ('Audi', 'A6', ARRAY['saloon', 'estate']),
    ('Audi', 'Q3', ARRAY['suv']),
    ('Audi', 'Q5', ARRAY['suv']),
    ('Audi', 'Q7', ARRAY['suv']),
    ('BMW', '1 Series', ARRAY['hatchback']),
    ('BMW', '3 Series', ARRAY['saloon', 'estate']),
    ('BMW', '5 Series', ARRAY['saloon', 'estate']),
    ('BMW', 'X1', ARRAY['suv']),
    ('BMW', 'X3', ARRAY['suv']),
    ('BMW', 'X5', ARRAY['suv']),
    ('Ford', 'Fiesta', ARRAY['hatchback']),
    ('Ford', 'Focus', ARRAY['hatchback', 'estate']),
    ('Ford', 'Kuga', ARRAY['suv']),
    ('Ford', 'Puma', ARRAY['suv']),
    ('Ford', 'Mondeo', ARRAY['saloon', 'estate']),
    ('Hyundai', 'i10', ARRAY['hatchback']),
    ('Hyundai', 'i20', ARRAY['hatchback']),
    ('Hyundai', 'i30', ARRAY['hatchback', 'estate']),
    ('Hyundai', 'Tucson', ARRAY['suv']),
    ('Hyundai', 'Kona', ARRAY['suv']),
    ('Kia', 'Picanto', ARRAY['hatchback']),
    ('Kia', 'Rio', ARRAY['hatchback']),
    ('Kia', 'Ceed', ARRAY['hatchback', 'estate']),
    ('Kia', 'Sportage', ARRAY['suv']),
    ('Kia', 'Sorento', ARRAY['suv']),
    ('Mercedes-Benz', 'A-Class', ARRAY['hatchback', 'saloon']),
    ('Mercedes-Benz', 'C-Class', ARRAY['saloon', 'estate']),
    ('Mercedes-Benz', 'E-Class', ARRAY['saloon', 'estate']),
    ('Mercedes-Benz', 'GLA', ARRAY['suv']),
    ('Mercedes-Benz', 'GLC', ARRAY['suv']),
    ('Nissan', 'Micra', ARRAY['hatchback']),
    ('Nissan', 'Qashqai', ARRAY['suv']),
    ('Nissan', 'Juke', ARRAY['suv']),
    ('Nissan', 'X-Trail', ARRAY['suv']),
    ('Opel', 'Corsa', ARRAY['hatchback']),
    ('Opel', 'Astra', ARRAY['hatchback', 'estate']),
    ('Opel', 'Insignia', ARRAY['saloon', 'estate']),
    ('Opel', 'Crossland', ARRAY['suv']),
    ('Opel', 'Mokka', ARRAY['suv']),
    ('Skoda', 'Fabia', ARRAY['hatchback']),
    ('Skoda', 'Octavia', ARRAY['hatchback', 'estate']),
    ('Skoda', 'Superb', ARRAY['saloon', 'estate']),
    ('Skoda', 'Karoq', ARRAY['suv']),
    ('Skoda', 'Kodiaq', ARRAY['suv']),
    ('Toyota', 'Aygo', ARRAY['hatchback']),
    ('Toyota', 'Yaris', ARRAY['hatchback']),
    ('Toyota', 'Corolla', ARRAY['hatchback', 'estate']),
    ('Toyota', 'C-HR', ARRAY['suv']),
    ('Toyota', 'RAV4', ARRAY['suv']),
    ('Volkswagen', 'Polo', ARRAY['hatchback']),
    ('Volkswagen', 'Golf', ARRAY['hatchback']),
    ('Volkswagen', 'Passat', ARRAY['saloon', 'estate']),
    ('Volkswagen', 'T-Roc', ARRAY['suv']),
    ('Volkswagen', 'Tiguan', ARRAY['suv']),
    ('Volkswagen', 'Touareg', ARRAY['suv'])
ON CONFLICT (make, name) DO NOTHING;

-- ============================================
-- TEST ACCOUNTS (for development only)
-- ============================================

-- Note: These are for local development testing
-- Password for all test accounts: TestPass123!

/*
-- To create test users, run this after setting up auth:

-- Admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@tradestock.ie',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"role": "admin"}'
);

-- Test dealer application and dealer
INSERT INTO dealer_applications (
    id, company_name, vat_number, address_line1, city, county,
    contact_name, contact_email, contact_phone, dealership_type, status
) VALUES (
    '00000000-0000-0000-0000-000000000010',
    'Dublin Motors Ltd',
    'IE1234567A',
    '123 Main Street',
    'Dublin',
    'Dublin',
    'John Smith',
    'john@dublinmotors.ie',
    '+353 1 123 4567',
    'independent',
    'approved'
);

INSERT INTO dealers (id, application_id, status, subscription_status)
VALUES (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000010',
    'active',
    'active'
);

INSERT INTO dealer_profiles (dealer_id, company_name, vat_number, email, phone, county)
VALUES (
    '00000000-0000-0000-0000-000000000020',
    'Dublin Motors Ltd',
    'IE1234567A',
    'info@dublinmotors.ie',
    '+353 1 123 4567',
    'Dublin'
);

-- Test dealer user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'dealer@dublinmotors.ie',
    crypt('TestPass123!', gen_salt('bf')),
    NOW()
);

INSERT INTO dealer_users (user_id, dealer_id, email, role, is_primary_contact, status)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000020',
    'dealer@dublinmotors.ie',
    'owner',
    true,
    'active'
);
*/

-- ============================================
-- FEATURE FLAGS (for gradual rollout)
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    allowed_dealer_ids UUID[] DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO feature_flags (key, name, description, enabled) VALUES
    ('messaging', 'Messaging System', 'Enable dealer-to-dealer messaging', true),
    ('offers', 'Offer System', 'Enable making and receiving offers', true),
    ('saved_searches', 'Saved Searches', 'Enable saved search functionality', true),
    ('notifications', 'Notifications', 'Enable notification system', true),
    ('advanced_filters', 'Advanced Filters', 'Enable advanced search filters', true),
    ('bulk_upload', 'Bulk Upload', 'Enable bulk listing upload', false),
    ('analytics', 'Analytics Dashboard', 'Enable analytics for dealers', false),
    ('api_access', 'API Access', 'Enable API access for dealers', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- EMAIL TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
    key TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    from_name TEXT DEFAULT 'TradeStock Marketplace',
    from_email TEXT DEFAULT 'noreply@tradestock.ie',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO email_templates (key, subject, body_html, body_text) VALUES
    ('application_received', 
     'Your TradeStock Application Has Been Received',
     '<h1>Thank you for applying to TradeStock</h1><p>We have received your application and will review it shortly. You will hear from us within 2 business days.</p>',
     'Thank you for applying to TradeStock. We have received your application and will review it shortly. You will hear from us within 2 business days.'
    ),
    ('application_approved',
     'Your TradeStock Application Has Been Approved',
     '<h1>Congratulations!</h1><p>Your application to join TradeStock Marketplace has been approved. Click the link below to set up your account and start trading.</p><a href="{{signup_url}}">Complete Setup</a>',
     'Congratulations! Your application to join TradeStock Marketplace has been approved. Visit {{signup_url}} to set up your account and start trading.'
    ),
    ('application_rejected',
     'Update on Your TradeStock Application',
     '<h1>Application Update</h1><p>Thank you for your interest in TradeStock. Unfortunately, we are unable to approve your application at this time.</p><p>Reason: {{rejection_reason}}</p>',
     'Thank you for your interest in TradeStock. Unfortunately, we are unable to approve your application at this time. Reason: {{rejection_reason}}'
    ),
    ('listing_approved',
     'Your Vehicle Listing Has Been Approved',
     '<h1>Listing Approved</h1><p>Your vehicle listing ({{reference_number}}) has been approved and is now visible in the marketplace.</p>',
     'Your vehicle listing ({{reference_number}}) has been approved and is now visible in the marketplace.'
    ),
    ('listing_rejected',
     'Your Vehicle Listing Needs Changes',
     '<h1>Listing Needs Changes</h1><p>Your vehicle listing ({{reference_number}}) requires changes before it can be approved.</p><p>Reason: {{rejection_reason}}</p>',
     'Your vehicle listing ({{reference_number}}) requires changes before it can be approved. Reason: {{rejection_reason}}'
    ),
    ('new_message',
     'You Have a New Message on TradeStock',
     '<h1>New Message</h1><p>You have received a new message from {{sender_name}}.</p><a href="{{message_url}}">View Message</a>',
     'You have received a new message from {{sender_name}}. View it at {{message_url}}'
    ),
    ('offer_received',
     'New Offer on Your Vehicle',
     '<h1>New Offer Received</h1><p>You have received an offer of €{{offer_amount}} for your vehicle ({{reference_number}}).</p><a href="{{offer_url}}">View Offer</a>',
     'You have received an offer of €{{offer_amount}} for your vehicle ({{reference_number}}). View it at {{offer_url}}'
    ),
    ('subscription_expiring',
     'Your TradeStock Subscription is Expiring Soon',
     '<h1>Subscription Expiring</h1><p>Your TradeStock subscription will expire on {{expiry_date}}. Renew now to avoid interruption.</p><a href="{{billing_url}}">Manage Subscription</a>',
     'Your TradeStock subscription will expire on {{expiry_date}}. Renew now to avoid interruption. Manage at {{billing_url}}'
    )
ON CONFLICT (key) DO NOTHING;
