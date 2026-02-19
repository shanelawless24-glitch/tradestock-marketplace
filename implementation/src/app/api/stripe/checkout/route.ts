// TradeStock Marketplace - Stripe Checkout Session
// ============================================

import { NextResponse } from 'next/server';
import { stripe, getPriceIdFromPlan } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { plan } = await req.json();
    
    if (!plan || !['basic', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get dealer info
    const { data: dealerUser } = await supabase
      .from('dealer_users')
      .select('dealer_id, dealer:dealers(id, stripe_customer_id)')
      .eq('user_id', user.id)
      .single();

    const dealer = dealerUser?.dealer as any;
    
    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      );
    }

    let customerId = dealer.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const { data: profile } = await supabase
        .from('dealer_profiles')
        .select('company_name, email')
        .eq('dealer_id', dealer.id)
        .single();

      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.company_name,
        metadata: {
          dealer_id: dealer.id,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('dealers')
        .update({ stripe_customer_id: customerId })
        .eq('id', dealer.id);
    }

    // Create checkout session
    const priceId = getPriceIdFromPlan(plan);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      subscription_data: {
        metadata: {
          dealer_id: dealer.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
