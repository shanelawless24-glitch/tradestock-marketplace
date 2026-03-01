import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })
  : ({
      webhooks: {
        constructEvent: () => ({ type: "mock" }),
      },
    } as unknown as Stripe);

export function getStripeInstance() {
  return stripe;
}
