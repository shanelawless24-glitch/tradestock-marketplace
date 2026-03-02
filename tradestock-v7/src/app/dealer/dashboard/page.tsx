"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/shared/kpi-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, isLaunchPassed, LAUNCH_DATE } from "@/lib/constants";
import {
  Car,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalEnquiries: number;
  savedListings: number;
  unreadMessages: number;
}

interface RecentListing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number;
  created_at: string;
}

export default function DealerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealer, setDealer] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current dealer
      const { data: dealerData } = await supabase
        .from("dealers")
        .select("*, subscriptions(*)")
        .single();

      if (dealerData) {
        setDealer(dealerData);
        setSubscription(dealerData.subscriptions);

        // Get listings stats
        const { data: listings } = await supabase
          .from("listings")
          .select("*")
          .eq("dealer_id", dealerData.id)
          .order("created_at", { ascending: false })
          .returns<RecentListing[]>();

        if (listings) {
          const totalViews = listings.reduce((sum: number, l: RecentListing) => sum + (l.view_count || 0), 0);
          const totalEnquiries = listings.reduce((sum: number, l: RecentListing) => sum + (l.enquiry_count || 0), 0);

          setStats({
            totalListings: listings.length,
            activeListings: listings.filter((l) => l.status === "active").length,
            totalViews,
            totalEnquiries,
            savedListings: 0, // TODO: Implement saved listings count
            unreadMessages: 0, // TODO: Implement unread messages count
          });

          setRecentListings(listings.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
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

  const launchPassed = isLaunchPassed();
  const isSubscriptionActive =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    subscription?.lifetime_active;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {dealer?.business_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge type="dealer" status={dealer?.status} />
          {subscription && (
            <StatusBadge type="subscription" status={subscription.status} />
          )}
        </div>
      </div>

      {/* Pre-launch notice */}
      {!launchPassed && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Pre-Launch Mode</h3>
                <p className="text-sm text-amber-800 mt-1">
                  The platform launches on {formatDate(LAUNCH_DATE)}. You can manage your stock now, 
                  but browsing other dealers and messaging will be available after launch.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription notice */}
      {dealer?.status === "approved" && !isSubscriptionActive && (
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Subscription Required</h3>
                <p className="text-sm text-red-800 mt-1">
                  Your account is approved but you need an active subscription to access all features.
                </p>
                <Link href="/dealer/billing">
                  <Button variant="destructive" size="sm" className="mt-3">
                    Set Up Billing
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Listings"
            value={stats.totalListings}
            description={`${stats.activeListings} active`}
            icon={Car}
          />
          <KPICard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={Eye}
          />
          <KPICard
            title="Enquiries"
            value={stats.totalEnquiries}
            icon={MessageSquare}
          />
          <KPICard
            title="Saved by Others"
            value={stats.savedListings}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dealer/stock/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vehicle
              </Button>
            </Link>
            <Link href="/dealer/stock">
              <Button variant="outline" className="w-full justify-start">
                <Car className="h-4 w-4 mr-2" />
                Manage My Stock
              </Button>
            </Link>
            <Link href={launchPassed ? "/dealer/browse" : "#"}>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!launchPassed || !isSubscriptionActive}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Browse Market
                {!launchPassed && <Lock className="h-3 w-3 ml-auto" />}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge type="dealer" status={dealer?.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subscription</span>
              {subscription ? (
                <StatusBadge type="subscription" status={subscription.status} />
              ) : (
                <Badge variant="secondary">Not Set Up</Badge>
              )}
            </div>
            {subscription?.lifetime_active && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Lifetime
                </Badge>
              </div>
            )}
            {subscription?.current_period_end && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Payment</span>
                <span className="text-sm">{formatDate(subscription.current_period_end)}</span>
              </div>
            )}
            <Link href="/dealer/billing">
              <Button variant="outline" size="sm" className="w-full mt-2">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Listings</CardTitle>
          <Link href="/dealer/stock">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentListings.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No listings yet"
              description="Add your first vehicle to start selling"
              action={{
                label: "Add Vehicle",
                onClick: () => (window.location.href = "/dealer/stock/new"),
              }}
            />
          ) : (
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(listing.price)} • Added {formatDate(listing.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{listing.view_count} views</p>
                    </div>
                    <StatusBadge type="dealer" status={listing.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
