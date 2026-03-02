"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, PRICING } from "@/lib/constants";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BillingData {
  subscription: any;
  dealer: any;
  promoRemaining: number;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const { data: dealer } = await supabase
        .from("dealers")
        .select("*, subscriptions(*)")
        .single();

      const { data: promoData } = await supabase
        .from("promo_counters")
        .select("*")
        .eq("id", 1)
        .single();

      if (dealer) {
        setData({
          subscription: dealer.subscriptions,
          dealer,
          promoRemaining:
            (promoData?.max_lifetime_activations || 100) -
            (promoData?.lifetime_activation_count || 0),
        });
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (isLifetime: boolean) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: data?.dealer?.id,
          isLifetime,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      toast.error("Failed to start checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: data?.subscription?.stripe_customer_id,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open customer portal");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner text="Loading billing information..." />
      </div>
    );
  }

  const { subscription, dealer, promoRemaining } = data || {};
  const isLifetimeEligible = dealer?.lifetime_discount && (promoRemaining ?? 0) > 0;
  const isActive =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    subscription?.lifetime_active;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment details</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Active Subscription</span>
              </div>
              {subscription?.lifetime_active && (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Lifetime Plan
                </Badge>
              )}
              {subscription?.current_period_end && !subscription?.lifetime_active && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Next payment: {formatDate(subscription.current_period_end)}
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                loading={isProcessing}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">No Active Subscription</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Subscribe now to unlock full access to the platform.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      {!isActive && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Lifetime Promo */}
          {isLifetimeEligible && (
            <Card className="border-2 border-amber-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1">
                LIMITED OFFER
              </div>
              <CardHeader>
                <CardTitle>Lifetime Launch</CardTitle>
                <CardDescription>First 100 dealerships only</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{PRICING.LIFETIME.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Locked price forever. Only {promoRemaining ?? 0} spots remaining!
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Unlimited vehicle listings",
                    "Full platform access",
                    "Priority support",
                    "Price locked for life",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(true)}
                  loading={isProcessing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Claim Lifetime Offer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Standard Plan */}
          <Card className={isLifetimeEligible ? "" : "md:col-span-2"}>
            <CardHeader>
              <CardTitle>Standard Plan</CardTitle>
              <CardDescription>Full access to all features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  €{PRICING.STANDARD.monthlyPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  "Unlimited vehicle listings",
                  "Full platform access",
                  "Priority support",
                  "Cancel anytime",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={isLifetimeEligible ? "outline" : "default"}
                className="w-full"
                onClick={() => handleSubscribe(false)}
                loading={isProcessing}
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
