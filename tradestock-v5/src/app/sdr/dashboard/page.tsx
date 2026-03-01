"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/shared/kpi-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/constants";
import {
  Building2,
  CreditCard,
  TrendingUp,
  Euro,
  UserPlus,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface SDRStats {
  totalDealerships: number;
  activeSubscriptions: number;
  monthlyConversions: number;
  totalCommission: number;
  lifetimeCommission: number;
}

export default function SDRDashboardPage() {
  const [stats, setStats] = useState<SDRStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sdrId, setSdrId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get current SDR ID
      const { data: sdr } = await supabase
        .from("sdrs")
        .select("id")
        .single();

      if (sdr) {
        setSdrId(sdr.id);

        // Get dealerships added by this SDR
        const { data: dealerships } = await supabase
          .from("dealers")
          .select("id, source_sdr_id")
          .eq("source_sdr_id", sdr.id)
          .returns<{ id: string; source_sdr_id: string }[]>();

        // Get subscriptions for those dealerships
        const dealerIds = dealerships?.map((d: { id: string }) => d.id) || [];
        
        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("status")
          .in("dealer_id", dealerIds)
          .returns<{ status: string }[]>();

        // Get commission events
        const { data: commissions } = await supabase
          .from("commission_events")
          .select("amount")
          .eq("sdr_id", sdr.id)
          .returns<{ amount: number }[]>();

        const activeSubscriptions =
          subscriptions?.filter(
            (s: { status: string }) => s.status === "active" || s.status === "trialing"
          ).length || 0;

        const totalCommission =
          commissions?.reduce((sum: number, c: { amount: number }) => sum + (c.amount || 0), 0) || 0;

        setStats({
          totalDealerships: dealerships?.length || 0,
          activeSubscriptions,
          monthlyConversions: 0, // TODO: Calculate from current month
          totalCommission,
          lifetimeCommission: totalCommission,
        });
      }
    } catch (error) {
      console.error("Error loading SDR stats:", error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">SDR Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and commissions</p>
        </div>
        <Link href="/sdr/add-dealer">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Dealership
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Dealerships"
            value={stats.totalDealerships}
            icon={Building2}
          />
          <KPICard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={CreditCard}
          />
          <KPICard
            title="This Month"
            value={stats.monthlyConversions}
            icon={TrendingUp}
          />
          <KPICard
            title="Total Commission"
            value={formatCurrency(stats.totalCommission)}
            icon={Euro}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/sdr/add-dealer">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Dealership
              </Button>
            </Link>
            <Link href="/sdr/dealerships">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                View My Dealerships
              </Button>
            </Link>
            <Link href="/sdr/leaderboard">
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Commission Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Standard Activation</span>
              <span className="font-medium">€40</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Lifetime Activation</span>
              <span className="font-medium">€20</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Monthly Bonus (per 100)</span>
              <span className="font-medium">€1,000</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Retention Bonus (90 days)</span>
              <span className="font-medium">€25</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
