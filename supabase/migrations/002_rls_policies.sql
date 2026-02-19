-- TradeStock Marketplace - Row Level Security Policies
-- Created: 2024
-- Description: RLS policies for all tables

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data ->> 'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dealer_id for current user
CREATE OR REPLACE FUNCTION get_current_user_dealer_id()
RETURNS UUID AS $$
DECLARE
    dealer_id UUID;
BEGIN
    SELECT du.dealer_id INTO dealer_id
    FROM dealer_users du
    WHERE du.user_id = auth.uid()
    AND du.status = 'active'
    LIMIT 1;
    
    RETURN dealer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user belongs to dealer
CREATE OR REPLACE FUNCTION user_belongs_to_dealer(check_dealer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM dealer_users du
        WHERE du.user_id = auth.uid()
        AND du.dealer_id = check_dealer_id
        AND du.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is dealer owner or admin
CREATE OR REPLACE FUNCTION is_dealer_owner_or_admin(check_dealer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM dealer_users du
        WHERE du.user_id = auth.uid()
        AND du.dealer_id = check_dealer_id
        AND du.role IN ('owner', 'admin')
        AND du.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if platform has launched
CREATE OR REPLACE FUNCTION has_platform_launched()
RETURNS BOOLEAN AS $$
DECLARE
    launch_date DATE;
BEGIN
    SELECT ps.launch_date INTO launch_date FROM platform_settings ps LIMIT 1;
    RETURN CURRENT_DATE >= launch_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. DEALER APPLICATIONS
-- ============================================

ALTER TABLE dealer_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can create application
CREATE POLICY "Allow public to create applications" ON dealer_applications
    FOR INSERT TO public
    WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access on applications" ON dealer_applications
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Applicants can view their own application by email
CREATE POLICY "Applicants can view own application" ON dealer_applications
    FOR SELECT TO authenticated
    USING (
        contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR is_admin()
    );

-- ============================================
-- 2. DEALERS
-- ============================================

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on dealers" ON dealers
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view their own dealer record
CREATE POLICY "Dealers can view own record" ON dealers
    FOR SELECT TO authenticated
    USING (
        user_belongs_to_dealer(id)
        OR is_admin()
    );

-- Dealer owners/admins can update their dealer
CREATE POLICY "Dealer owners can update" ON dealers
    FOR UPDATE TO authenticated
    USING (
        is_dealer_owner_or_admin(id)
        OR is_admin()
    )
    WITH CHECK (
        is_dealer_owner_or_admin(id)
        OR is_admin()
    );

-- ============================================
-- 3. DEALER PROFILES
-- ============================================

ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on profiles" ON dealer_profiles
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view their own profile
CREATE POLICY "Dealers can view own profile" ON dealer_profiles
    FOR SELECT TO authenticated
    USING (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- Dealers can update their own profile
CREATE POLICY "Dealers can update own profile" ON dealer_profiles
    FOR UPDATE TO authenticated
    USING (
        is_dealer_owner_or_admin(dealer_id)
        OR is_admin()
    )
    WITH CHECK (
        is_dealer_owner_or_admin(dealer_id)
        OR is_admin()
    );

-- Public can view approved dealer profiles (after launch)
CREATE POLICY "Public can view approved profiles" ON dealer_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM dealers d
            WHERE d.id = dealer_profiles.dealer_id
            AND d.status = 'active'
        )
        AND has_platform_launched()
    );

-- ============================================
-- 4. DEALER USERS
-- ============================================

ALTER TABLE dealer_users ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on dealer_users" ON dealer_users
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Users can view their own record
CREATE POLICY "Users can view own record" ON dealer_users
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- Dealer owners/admins can manage their team
CREATE POLICY "Dealer owners can manage team" ON dealer_users
    FOR ALL TO authenticated
    USING (
        is_dealer_owner_or_admin(dealer_id)
        OR user_id = auth.uid()
        OR is_admin()
    )
    WITH CHECK (
        is_dealer_owner_or_admin(dealer_id)
        OR is_admin()
    );

-- ============================================
-- 5. SUBSCRIPTIONS
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on subscriptions" ON subscriptions
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view their own subscription
CREATE POLICY "Dealers can view own subscription" ON subscriptions
    FOR SELECT TO authenticated
    USING (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- System can manage subscriptions (via webhook)
CREATE POLICY "System can manage subscriptions" ON subscriptions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 6. LISTINGS
-- ============================================

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on listings" ON listings
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can manage their own listings
CREATE POLICY "Dealers can manage own listings" ON listings
    FOR ALL TO authenticated
    USING (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    )
    WITH CHECK (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- Public can view approved listings (after launch)
CREATE POLICY "Public can view approved listings" ON listings
    FOR SELECT TO authenticated
    USING (
        status = 'approved'
        AND has_platform_launched()
    );

-- ============================================
-- 7. LISTING DETAILS
-- ============================================

ALTER TABLE listing_details ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on listing_details" ON listing_details
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can manage their own listing details
CREATE POLICY "Dealers can manage own listing details" ON listing_details
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_details.listing_id
            AND user_belongs_to_dealer(l.dealer_id)
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_details.listing_id
            AND user_belongs_to_dealer(l.dealer_id)
        )
        OR is_admin()
    );

-- Public can view approved listing details (after launch)
CREATE POLICY "Public can view approved listing details" ON listing_details
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_details.listing_id
            AND l.status = 'approved'
        )
        AND has_platform_launched()
    );

-- ============================================
-- 8. LISTING PHOTOS
-- ============================================

ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on listing_photos" ON listing_photos
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can manage photos for their listings
CREATE POLICY "Dealers can manage own listing photos" ON listing_photos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_photos.listing_id
            AND user_belongs_to_dealer(l.dealer_id)
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_photos.listing_id
            AND user_belongs_to_dealer(l.dealer_id)
        )
        OR is_admin()
    );

-- Public can view photos for approved listings (after launch)
CREATE POLICY "Public can view approved listing photos" ON listing_photos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_photos.listing_id
            AND l.status = 'approved'
        )
        AND has_platform_launched()
    );

-- ============================================
-- 9. MESSAGES
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on messages" ON messages
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view messages they're part of
CREATE POLICY "Dealers can view their messages" ON messages
    FOR SELECT TO authenticated
    USING (
        (user_belongs_to_dealer(sender_dealer_id) OR user_belongs_to_dealer(recipient_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    );

-- Dealers can create messages
CREATE POLICY "Dealers can create messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        user_belongs_to_dealer(sender_dealer_id)
        AND has_platform_launched()
        OR is_admin()
    );

-- Dealers can update (archive) their messages
CREATE POLICY "Dealers can archive messages" ON messages
    FOR UPDATE TO authenticated
    USING (
        (user_belongs_to_dealer(sender_dealer_id) OR user_belongs_to_dealer(recipient_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    )
    WITH CHECK (
        (user_belongs_to_dealer(sender_dealer_id) OR user_belongs_to_dealer(recipient_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    );

-- ============================================
-- 10. MESSAGE ITEMS
-- ============================================

ALTER TABLE message_items ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on message_items" ON message_items
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view messages in their threads
CREATE POLICY "Dealers can view thread messages" ON message_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            WHERE m.id = message_items.thread_id
            AND (user_belongs_to_dealer(m.sender_dealer_id) OR user_belongs_to_dealer(m.recipient_dealer_id))
        )
        AND has_platform_launched()
        OR is_admin()
    );

-- Dealers can send messages to their threads
CREATE POLICY "Dealers can send messages" ON message_items
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM messages m
            WHERE m.id = message_items.thread_id
            AND (user_belongs_to_dealer(m.sender_dealer_id) OR user_belongs_to_dealer(m.recipient_dealer_id))
        )
        AND has_platform_launched()
        OR is_admin()
    );

-- ============================================
-- 11. OFFERS
-- ============================================

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on offers" ON offers
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can view offers they're part of
CREATE POLICY "Dealers can view their offers" ON offers
    FOR SELECT TO authenticated
    USING (
        (user_belongs_to_dealer(buyer_dealer_id) OR user_belongs_to_dealer(seller_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    );

-- Dealers can create offers (buyers)
CREATE POLICY "Dealers can create offers" ON offers
    FOR INSERT TO authenticated
    WITH CHECK (
        user_belongs_to_dealer(buyer_dealer_id)
        AND has_platform_launched()
        OR is_admin()
    );

-- Dealers can respond to offers (both parties)
CREATE POLICY "Dealers can respond to offers" ON offers
    FOR UPDATE TO authenticated
    USING (
        (user_belongs_to_dealer(buyer_dealer_id) OR user_belongs_to_dealer(seller_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    )
    WITH CHECK (
        (user_belongs_to_dealer(buyer_dealer_id) OR user_belongs_to_dealer(seller_dealer_id))
        AND has_platform_launched()
        OR is_admin()
    );

-- ============================================
-- 12. NOTIFICATIONS
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on notifications" ON notifications
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR is_admin()
    );

-- Users can update (mark read) their notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        OR is_admin()
    )
    WITH CHECK (
        user_id = auth.uid()
        OR is_admin()
    );

-- Users can delete their notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE TO authenticated
    USING (
        user_id = auth.uid()
        OR is_admin()
    );

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT TO service_role
    WITH CHECK (true);

-- ============================================
-- 13. SAVED SEARCHES
-- ============================================

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on saved_searches" ON saved_searches
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can manage their saved searches
CREATE POLICY "Dealers can manage saved searches" ON saved_searches
    FOR ALL TO authenticated
    USING (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    )
    WITH CHECK (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- ============================================
-- 14. AUDIT LOGS
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (is_admin());

-- System can create audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Users can view their own audit entries
CREATE POLICY "Users can view own audit entries" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        actor_id = auth.uid()
        OR is_admin()
    );

-- ============================================
-- 15. PLATFORM SETTINGS
-- ============================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on settings" ON platform_settings
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON platform_settings
    FOR SELECT TO authenticated
    USING (true);

-- ============================================
-- 16. FAVOURITES
-- ============================================

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access on favourites" ON favourites
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Dealers can manage their favourites
CREATE POLICY "Dealers can manage favourites" ON favourites
    FOR ALL TO authenticated
    USING (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    )
    WITH CHECK (
        user_belongs_to_dealer(dealer_id)
        OR is_admin()
    );

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Create storage buckets (run in Supabase dashboard or via API)
-- CREATE STORAGE BUCKET dealer_logos;
-- CREATE STORAGE BUCKET listing_photos;
-- CREATE STORAGE BUCKET documents;

-- Listing photos policies (to be applied via Supabase dashboard)
/*
-- Upload: Dealer can upload to their folder
CREATE POLICY "Dealers can upload listing photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'listing_photos'
        AND EXISTS (
            SELECT 1 FROM dealer_users du
            WHERE du.user_id = auth.uid()
            AND du.status = 'active'
        )
    );

-- Select: Public can view approved listing photos
CREATE POLICY "Public can view listing photos" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'listing_photos');

-- Delete: Dealer can delete their own photos
CREATE POLICY "Dealers can delete own photos" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'listing_photos'
        AND EXISTS (
            SELECT 1 FROM dealer_users du
            WHERE du.user_id = auth.uid()
            AND du.status = 'active'
        )
    );
*/

-- ============================================
-- ADDITIONAL SECURITY
-- ============================================

-- Prevent deletion of approved dealers with listings
CREATE OR REPLACE FUNCTION prevent_dealer_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM listings 
        WHERE dealer_id = OLD.id 
        AND status IN ('approved', 'pending')
    ) THEN
        RAISE EXCEPTION 'Cannot delete dealer with active listings';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_dealer_deletion_trigger
    BEFORE DELETE ON dealers
    FOR EACH ROW
    EXECUTE FUNCTION prevent_dealer_deletion();

-- Log all listing status changes
CREATE OR REPLACE FUNCTION log_listing_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
        VALUES (
            auth.uid(),
            'listing_status_changed',
            'listing',
            NEW.id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_listing_status_change_trigger
    AFTER UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION log_listing_status_change();
