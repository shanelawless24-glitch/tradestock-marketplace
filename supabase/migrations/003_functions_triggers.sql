-- TradeStock Marketplace - Functions and Triggers
-- Created: 2024
-- Description: Database functions, triggers, and utilities

-- ============================================
-- NOTIFICATION FUNCTIONS
-- ============================================

-- Create notification for user
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_action_url TEXT DEFAULT NULL,
    p_action_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        action_url,
        action_text
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        p_action_url,
        p_action_text
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify dealer users (all active users in a dealer)
CREATE OR REPLACE FUNCTION notify_dealer_users(
    p_dealer_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_action_url TEXT DEFAULT NULL,
    p_action_text TEXT DEFAULT NULL
)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT create_notification(
        du.user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        p_action_url,
        p_action_text
    )
    FROM dealer_users du
    WHERE du.dealer_id = p_dealer_id
    AND du.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- APPLICATION WORKFLOW
-- ============================================

-- Approve dealer application
CREATE OR REPLACE FUNCTION approve_dealer_application(
    p_application_id UUID,
    p_reviewed_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_dealer_id UUID;
    v_application RECORD;
BEGIN
    -- Get application
    SELECT * INTO v_application
    FROM dealer_applications
    WHERE id = p_application_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or not pending';
    END IF;
    
    -- Update application
    UPDATE dealer_applications
    SET status = 'approved',
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW()
    WHERE id = p_application_id;
    
    -- Create dealer
    INSERT INTO dealers (
        application_id,
        status,
        subscription_status
    ) VALUES (
        p_application_id,
        'active',
        'none'
    )
    RETURNING id INTO v_dealer_id;
    
    -- Create dealer profile
    INSERT INTO dealer_profiles (
        dealer_id,
        company_name,
        trading_name,
        vat_number,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        county,
        eircode
    ) VALUES (
        v_dealer_id,
        v_application.company_name,
        v_application.trading_name,
        v_application.vat_number,
        v_application.contact_email,
        v_application.contact_phone,
        v_application.address_line1,
        v_application.address_line2,
        v_application.city,
        v_application.county,
        v_application.eircode
    );
    
    -- Log action
    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
    VALUES (
        p_reviewed_by,
        'application_approved',
        'dealer_application',
        p_application_id,
        jsonb_build_object('dealer_id', v_dealer_id)
    );
    
    RETURN v_dealer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject dealer application
CREATE OR REPLACE FUNCTION reject_dealer_application(
    p_application_id UUID,
    p_reviewed_by UUID,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE dealer_applications
    SET status = 'rejected',
        rejection_reason = p_reason,
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW()
    WHERE id = p_application_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or not pending';
    END IF;
    
    -- Log action
    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
    VALUES (
        p_reviewed_by,
        'application_rejected',
        'dealer_application',
        p_application_id,
        jsonb_build_object('reason', p_reason)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LISTING WORKFLOW
-- ============================================

-- Submit listing for approval
CREATE OR REPLACE FUNCTION submit_listing_for_approval(p_listing_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE listings
    SET status = 'pending',
        updated_at = NOW()
    WHERE id = p_listing_id
    AND status = 'draft';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found or not in draft status';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve listing
CREATE OR REPLACE FUNCTION approve_listing(
    p_listing_id UUID,
    p_moderated_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_dealer_id UUID;
BEGIN
    UPDATE listings
    SET status = 'approved',
        moderated_by = p_moderated_by,
        moderated_at = NOW(),
        moderation_notes = p_notes,
        updated_at = NOW()
    WHERE id = p_listing_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found or not pending';
    END IF;
    
    -- Get dealer_id for notification
    SELECT dealer_id INTO v_dealer_id
    FROM listings WHERE id = p_listing_id;
    
    -- Notify dealer
    PERFORM notify_dealer_users(
        v_dealer_id,
        'listing_approved',
        'Listing Approved',
        'Your vehicle listing has been approved and is now visible in the marketplace.',
        jsonb_build_object('listing_id', p_listing_id),
        '/listings/' || p_listing_id,
        'View Listing'
    );
    
    -- Log action
    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
    VALUES (
        p_moderated_by,
        'listing_approved',
        'listing',
        p_listing_id,
        '{}'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject listing
CREATE OR REPLACE FUNCTION reject_listing(
    p_listing_id UUID,
    p_moderated_by UUID,
    p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    v_dealer_id UUID;
BEGIN
    UPDATE listings
    SET status = 'rejected',
        moderated_by = p_moderated_by,
        moderated_at = NOW(),
        moderation_notes = p_reason,
        updated_at = NOW()
    WHERE id = p_listing_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found or not pending';
    END IF;
    
    -- Get dealer_id for notification
    SELECT dealer_id INTO v_dealer_id
    FROM listings WHERE id = p_listing_id;
    
    -- Notify dealer
    PERFORM notify_dealer_users(
        v_dealer_id,
        'listing_rejected',
        'Listing Needs Changes',
        'Your vehicle listing requires changes: ' || p_reason,
        jsonb_build_object('listing_id', p_listing_id, 'reason', p_reason),
        '/listings/' || p_listing_id,
        'Edit Listing'
    );
    
    -- Log action
    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
    VALUES (
        p_moderated_by,
        'listing_rejected',
        'listing',
        p_listing_id,
        jsonb_build_object('reason', p_reason)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark listing as sold
CREATE OR REPLACE FUNCTION mark_listing_sold(
    p_listing_id UUID,
    p_sold_to_dealer_id UUID,
    p_sold_price_eur INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_seller_dealer_id UUID;
BEGIN
    SELECT dealer_id INTO v_seller_dealer_id
    FROM listings WHERE id = p_listing_id;
    
    UPDATE listings
    SET status = 'sold',
        sold_at = NOW(),
        sold_to_dealer_id = p_sold_to_dealer_id,
        sold_price_eur = p_sold_price_eur,
        updated_at = NOW()
    WHERE id = p_listing_id
    AND status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found or not approved';
    END IF;
    
    -- Notify seller
    PERFORM notify_dealer_users(
        v_seller_dealer_id,
        'listing_sold',
        'Vehicle Sold!',
        'Your vehicle has been marked as sold.',
        jsonb_build_object('listing_id', p_listing_id, 'price', p_sold_price_eur),
        '/listings/' || p_listing_id,
        'View Details'
    );
    
    -- Notify buyer
    PERFORM notify_dealer_users(
        p_sold_to_dealer_id,
        'purchase_completed',
        'Purchase Completed',
        'You have successfully purchased a vehicle.',
        jsonb_build_object('listing_id', p_listing_id, 'price', p_sold_price_eur),
        '/listings/' || p_listing_id,
        'View Details'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OFFER WORKFLOW
-- ============================================

-- Accept offer
CREATE OR REPLACE FUNCTION accept_offer(
    p_offer_id UUID,
    p_responded_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_listing_id UUID;
    v_buyer_dealer_id UUID;
    v_seller_dealer_id UUID;
    v_amount_eur INTEGER;
BEGIN
    SELECT listing_id, buyer_dealer_id, seller_dealer_id, amount_eur
    INTO v_listing_id, v_buyer_dealer_id, v_seller_dealer_id, v_amount_eur
    FROM offers WHERE id = p_offer_id;
    
    UPDATE offers
    SET status = 'accepted',
        responded_at = NOW(),
        responded_by = p_responded_by,
        updated_at = NOW()
    WHERE id = p_offer_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found or not pending';
    END IF;
    
    -- Notify buyer
    PERFORM notify_dealer_users(
        v_buyer_dealer_id,
        'offer_accepted',
        'Offer Accepted!',
        'Your offer has been accepted.',
        jsonb_build_object('offer_id', p_offer_id, 'amount', v_amount_eur),
        '/offers',
        'View Offers'
    );
    
    -- Auto-mark listing as sold
    PERFORM mark_listing_sold(v_listing_id, v_buyer_dealer_id, v_amount_eur);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Counter offer
CREATE OR REPLACE FUNCTION counter_offer(
    p_offer_id UUID,
    p_responded_by UUID,
    p_counter_amount INTEGER,
    p_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_buyer_dealer_id UUID;
BEGIN
    SELECT buyer_dealer_id INTO v_buyer_dealer_id
    FROM offers WHERE id = p_offer_id;
    
    UPDATE offers
    SET status = 'countered',
        counter_amount_eur = p_counter_amount,
        counter_message = p_message,
        responded_at = NOW(),
        responded_by = p_responded_by,
        updated_at = NOW()
    WHERE id = p_offer_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found or not pending';
    END IF;
    
    -- Notify buyer
    PERFORM notify_dealer_users(
        v_buyer_dealer_id,
        'offer_countered',
        'Counter Offer Received',
        'The seller has made a counter offer.',
        jsonb_build_object('offer_id', p_offer_id, 'counter_amount', p_counter_amount),
        '/offers',
        'Respond'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MESSAGE WORKFLOW
-- ============================================

-- Send message
CREATE OR REPLACE FUNCTION send_message(
    p_thread_id UUID,
    p_sender_user_id UUID,
    p_content TEXT,
    p_attachments JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
    v_recipient_dealer_id UUID;
    v_sender_dealer_id UUID;
BEGIN
    -- Get thread info
    SELECT sender_dealer_id, recipient_dealer_id
    INTO v_sender_dealer_id, v_recipient_dealer_id
    FROM messages WHERE id = p_thread_id;
    
    -- Insert message
    INSERT INTO message_items (thread_id, sender_user_id, content, attachments)
    VALUES (p_thread_id, p_sender_user_id, p_content, p_attachments)
    RETURNING id INTO v_message_id;
    
    -- Update thread
    UPDATE messages
    SET last_message_at = NOW(),
        updated_at = NOW()
    WHERE id = p_thread_id;
    
    -- Notify recipient
    PERFORM notify_dealer_users(
        v_recipient_dealer_id,
        'new_message',
        'New Message',
        'You have received a new message.',
        jsonb_build_object('thread_id', p_thread_id),
        '/messages/' || p_thread_id,
        'View Message'
    );
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new thread and send first message
CREATE OR REPLACE FUNCTION create_message_thread(
    p_sender_dealer_id UUID,
    p_recipient_dealer_id UUID,
    p_listing_id UUID DEFAULT NULL,
    p_subject TEXT DEFAULT NULL,
    p_content TEXT,
    p_sender_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_thread_id UUID;
    v_message_id UUID;
BEGIN
    -- Create thread
    INSERT INTO messages (
        listing_id,
        sender_dealer_id,
        recipient_dealer_id,
        subject
    ) VALUES (
        p_listing_id,
        p_sender_dealer_id,
        p_recipient_dealer_id,
        p_subject
    )
    RETURNING id INTO v_thread_id;
    
    -- Send first message
    INSERT INTO message_items (thread_id, sender_user_id, content)
    VALUES (v_thread_id, p_sender_user_id, p_content);
    
    -- Notify recipient
    PERFORM notify_dealer_users(
        p_recipient_dealer_id,
        'new_message',
        COALESCE(p_subject, 'New Message'),
        'You have received a new message.',
        jsonb_build_object('thread_id', v_thread_id),
        '/messages/' || v_thread_id,
        'View Message'
    );
    
    RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUBSCRIPTION SYNC
-- ============================================

-- Sync subscription from Stripe webhook
CREATE OR REPLACE FUNCTION sync_stripe_subscription(
    p_stripe_subscription_id TEXT,
    p_stripe_customer_id TEXT,
    p_stripe_price_id TEXT,
    p_status TEXT,
    p_current_period_start TIMESTAMPTZ,
    p_current_period_end TIMESTAMPTZ,
    p_cancel_at_period_end BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    v_dealer_id UUID;
    v_plan_name TEXT;
    v_plan_amount INTEGER;
BEGIN
    -- Get dealer_id from customer
    SELECT id INTO v_dealer_id
    FROM dealers
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dealer not found for customer %', p_stripe_customer_id;
    END IF;
    
    -- Determine plan details from price ID
    SELECT 
        CASE 
            WHEN p_stripe_price_id = current_setting('app.settings.stripe_basic_price_id', true) THEN 'Basic'
            WHEN p_stripe_price_id = current_setting('app.settings.stripe_premium_price_id', true) THEN 'Premium'
            ELSE 'Unknown'
        END,
        CASE 
            WHEN p_stripe_price_id = current_setting('app.settings.stripe_basic_price_id', true) THEN 5000
            WHEN p_stripe_price_id = current_setting('app.settings.stripe_premium_price_id', true) THEN 10000
            ELSE 0
        END
    INTO v_plan_name, v_plan_amount;
    
    -- Upsert subscription
    INSERT INTO subscriptions (
        dealer_id,
        stripe_subscription_id,
        stripe_price_id,
        plan_name,
        plan_amount_eur,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end
    ) VALUES (
        v_dealer_id,
        p_stripe_subscription_id,
        p_stripe_price_id,
        v_plan_name,
        v_plan_amount,
        p_status,
        p_current_period_start,
        p_current_period_end,
        p_cancel_at_period_end
    )
    ON CONFLICT (stripe_subscription_id)
    DO UPDATE SET
        stripe_price_id = EXCLUDED.stripe_price_id,
        plan_name = EXCLUDED.plan_name,
        plan_amount_eur = EXCLUDED.plan_amount_eur,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        updated_at = NOW();
    
    -- Update dealer subscription status
    UPDATE dealers
    SET subscription_status = CASE 
            WHEN p_status = 'active' THEN 'active'
            WHEN p_status = 'past_due' THEN 'past_due'
            WHEN p_status = 'cancelled' THEN 'cancelled'
            WHEN p_status = 'unpaid' THEN 'unpaid'
            ELSE 'none'
        END,
        updated_at = NOW()
    WHERE id = v_dealer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STATS AND ANALYTICS
-- ============================================

-- Get dealer stats
CREATE OR REPLACE FUNCTION get_dealer_stats(p_dealer_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COUNT(*),
        'active_listings', COUNT(*) FILTER (WHERE status = 'approved'),
        'pending_listings', COUNT(*) FILTER (WHERE status = 'pending'),
        'sold_listings', COUNT(*) FILTER (WHERE status = 'sold'),
        'total_views', COALESCE(SUM(view_count), 0),
        'total_enquiries', COALESCE(SUM(enquiry_count), 0),
        'total_offers', COALESCE(SUM(offer_count), 0)
    )
    INTO v_stats
    FROM listings
    WHERE dealer_id = p_dealer_id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get platform stats (admin only)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_dealers', (SELECT COUNT(*) FROM dealers WHERE status = 'active'),
        'pending_applications', (SELECT COUNT(*) FROM dealer_applications WHERE status = 'pending'),
        'total_listings', (SELECT COUNT(*) FROM listings),
        'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'approved'),
        'pending_listings', (SELECT COUNT(*) FROM listings WHERE status = 'pending'),
        'sold_this_month', (SELECT COUNT(*) FROM listings WHERE status = 'sold' AND sold_at >= DATE_TRUNC('month', NOW())),
        'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
        'total_messages', (SELECT COUNT(*) FROM message_items WHERE created_at >= DATE_TRUNC('month', NOW())),
        'total_offers', (SELECT COUNT(*) FROM offers WHERE created_at >= DATE_TRUNC('month', NOW()))
    )
    INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Search listings with filters
CREATE OR REPLACE FUNCTION search_listings(
    p_make TEXT DEFAULT NULL,
    p_model TEXT DEFAULT NULL,
    p_min_year INTEGER DEFAULT NULL,
    p_max_year INTEGER DEFAULT NULL,
    p_min_price INTEGER DEFAULT NULL,
    p_max_price INTEGER DEFAULT NULL,
    p_min_mileage INTEGER DEFAULT NULL,
    p_max_mileage INTEGER DEFAULT NULL,
    p_fuel_type TEXT DEFAULT NULL,
    p_transmission TEXT DEFAULT NULL,
    p_body_type TEXT DEFAULT NULL,
    p_county TEXT DEFAULT NULL,
    p_trade_in_suitable BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    listing_id UUID,
    reference_number TEXT,
    dealer_id UUID,
    make TEXT,
    model TEXT,
    year INTEGER,
    mileage_km INTEGER,
    price_eur INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    body_type TEXT,
    colour TEXT,
    location_county TEXT,
    primary_photo_url TEXT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT 
            l.id,
            l.reference_number,
            l.dealer_id,
            ld.make,
            ld.model,
            ld.year,
            ld.mileage_km,
            ld.price_eur,
            ld.fuel_type,
            ld.transmission,
            ld.body_type,
            ld.colour,
            ld.location_county,
            l.created_at
        FROM listings l
        JOIN listing_details ld ON ld.listing_id = l.id
        WHERE l.status = 'approved'
        AND has_platform_launched()
        AND (p_make IS NULL OR ld.make ILIKE p_make)
        AND (p_model IS NULL OR ld.model ILIKE p_model)
        AND (p_min_year IS NULL OR ld.year >= p_min_year)
        AND (p_max_year IS NULL OR ld.year <= p_max_year)
        AND (p_min_price IS NULL OR ld.price_eur >= p_min_price)
        AND (p_max_price IS NULL OR ld.price_eur <= p_max_price)
        AND (p_min_mileage IS NULL OR ld.mileage_km >= p_min_mileage)
        AND (p_max_mileage IS NULL OR ld.mileage_km <= p_max_mileage)
        AND (p_fuel_type IS NULL OR ld.fuel_type = p_fuel_type)
        AND (p_transmission IS NULL OR ld.transmission = p_transmission)
        AND (p_body_type IS NULL OR ld.body_type = p_body_type)
        AND (p_county IS NULL OR ld.location_county = p_county)
        AND (p_trade_in_suitable IS NULL OR ld.trade_in_suitable = p_trade_in_suitable)
    ),
    counted AS (
        SELECT COUNT(*) as total FROM filtered
    )
    SELECT 
        f.id,
        f.reference_number,
        f.dealer_id,
        f.make,
        f.model,
        f.year,
        f.mileage_km,
        f.price_eur,
        f.fuel_type,
        f.transmission,
        f.body_type,
        f.colour,
        f.location_county,
        (SELECT public_url FROM listing_photos WHERE listing_id = f.id AND is_primary = true LIMIT 1),
        f.created_at,
        c.total
    FROM filtered f
    CROSS JOIN counted c
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MAINTENANCE FUNCTIONS
-- ============================================

-- Clean up expired listings
CREATE OR REPLACE FUNCTION cleanup_expired_listings()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE listings
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'approved'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Archive old notifications
CREATE OR REPLACE FUNCTION archive_old_notifications(p_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days
    AND read_at IS NOT NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
