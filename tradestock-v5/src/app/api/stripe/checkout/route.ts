import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Please set up Stripe first." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const { dealerId, isLifetime } = await request.json();

    if (!dealerId) {
      return NextResponse.json(
        { error: "Dealer ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get dealer info
    const { data: dealer } = await supabase
      .from("dealers")
      .select("email, business_name, lifetime_discount")
      .eq("id", dealerId)
      .single();

    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer not found" },
        { status: 404 }
      );
    }

    // Determine price ID
    let priceId: string;
    if (isLifetime && dealer.lifetime_discount) {
      priceId = process.env.STRIPE_LIFETIME_PRICE_ID!;
    } else {
      priceId = process.env.STRIPE_STANDARD_PRICE_ID!;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: dealer.email,
      client_reference_id: dealerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dealer/billing?success=true`,
      cancel_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dealer/billing?canceled=true`,
      subscription_data: {
        metadata: {
          dealer_id: dealerId,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
