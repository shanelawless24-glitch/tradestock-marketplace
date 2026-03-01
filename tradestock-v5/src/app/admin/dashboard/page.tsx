"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/shared/kpi-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/constants";
import {
  Building2,
  Users,
  CreditCard,
  Car,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface AdminStats {
  totalDealers: number;
  pendingDealers: number;
  approvedDealers: number;
  activeSubscriptions: number;
  totalListings: number;
  mrr: number;
  lifetimePromoRemaining: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get dealer counts
      const { data: dealers } = await supabase.from("dealers").select("status");
      
      // Get subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("status, lifetime_active")
        .returns<{ status: string; lifetime_active: boolean }[]>();
      
      // Get listings count
      const { count: listingsCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true });
      
      // Get promo counter
      const { data: promoCounter } = await supabase
        .from("promo_counters")
        .select("*")
        .eq("id", 1)
        .single();

      if (dealers) {
        const typedDealers = dealers as { status: string }[];
        const pendingDealers = typedDealers.filter((d) => d.status === "pending").length;
        const approvedDealers = typedDealers.filter((d) => d.status === "approved").length;
        
        const activeSubscriptions =
          subscriptions?.filter(
            (s: { status: string; lifetime_active: boolean }) => s.status === "active" || s.status === "trialing" || s.lifetime_active
          ).length || 0;

        const mrr = activeSubscriptions * 99.99;

        setStats({
          totalDealers: dealers.length,
          pendingDealers,
          approvedDealers,
          activeSubscriptions,
          totalListings: listingsCount || 0,
          mrr,
          lifetimePromoRemaining:
            (promoCounter?.max_lifetime_activations || 100) -
            (promoCounter?.lifetime_activation_count || 0),
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Dealers"
            value={stats.totalDealers}
            description={`${stats.pendingDealers} pending approval`}
            icon={Building2}
          />
          <KPICard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={CreditCard}
          />
          <KPICard
            title="Total Listings"
            value={stats.totalListings}
            icon={Car}
          />
          <KPICard
            title="Monthly Revenue"
            value={formatCurrency(stats.mrr)}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Lifetime Promo Status */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Sparkles className="h-5 w-5" />
            Lifetime Launch Offer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-amber-900">
                {stats?.lifetimePromoRemaining || 0}
              </p>
              <p className="text-sm text-amber-700">spots remaining</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-700">
                {100 - (stats?.lifetimePromoRemaining || 0)} / 100 claimed
              </p>
              <div className="w-48 h-2 bg-amber-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{
                    width: `${((100 - (stats?.lifetimePromoRemaining || 0)) / 100) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Manage Dealers</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.pendingDealers || 0} pending approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Manage SDRs</p>
                <p className="text-sm text-muted-foreground">
                  View performance & commissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Subscriptions</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.activeSubscriptions || 0} active subscriptions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
