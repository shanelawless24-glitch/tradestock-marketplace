// TradeStock Marketplace - Stripe Configuration
// ============================================

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  BASIC: process.env.STRIPE_PRICE_BASIC!,
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM!,
};

export function getPlanFromPriceId(priceId: string): 'basic' | 'premium' | null {
  if (priceId === STRIPE_PRICE_IDS.BASIC) return 'basic';
  if (priceId === STRIPE_PRICE_IDS.PREMIUM) return 'premium';
  return null;
}

export function getPriceIdFromPlan(plan: 'basic' | 'premium'): string {
  return plan === 'basic' ? STRIPE_PRICE_IDS.BASIC : STRIPE_PRICE_IDS.PREMIUM;
}
