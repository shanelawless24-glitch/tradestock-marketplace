// TradeStock Marketplace - Stripe Webhook Handler
// ============================================

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer and subscription info
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Find dealer by customer ID
        const { data: dealer } = await supabase
          .from('dealers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!dealer) {
          console.error('Dealer not found for customer:', customerId);
          return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
        }

        // Upsert subscription
        await supabase.from('subscriptions').upsert({
          dealer_id: dealer.id,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_product_id: subscription.items.data[0].price.product as string,
          plan_name: subscription.items.data[0].price.nickname || 'Unknown',
          plan_amount_eur: subscription.items.data[0].price.unit_amount || 0,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, {
          onConflict: 'stripe_subscription_id'
        });

        // Update dealer subscription status
        await supabase
          .from('dealers')
          .update({ 
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', dealer.id);

        console.log('Subscription created:', subscriptionId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          // Update dealer status
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('dealer_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (sub) {
            await supabase
              .from('dealers')
              .update({ 
                subscription_status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('id', sub.dealer_id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          // Update dealer status
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('dealer_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (sub) {
            await supabase
              .from('dealers')
              .update({ 
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', sub.dealer_id);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update dealer status
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('dealer_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          const dealerStatus = subscription.status === 'active' ? 'active' :
                              subscription.status === 'past_due' ? 'past_due' :
                              subscription.status === 'canceled' ? 'cancelled' :
                              subscription.status === 'unpaid' ? 'unpaid' : 'none';
          
          await supabase
            .from('dealers')
            .update({ 
              subscription_status: dealerStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.dealer_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update dealer status
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('dealer_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase
            .from('dealers')
            .update({ 
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.dealer_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
