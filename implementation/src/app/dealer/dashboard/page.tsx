// TradeStock Marketplace - Dealer Dashboard
// ============================================

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isBeforeLaunch, getLaunchCountdown, formatLaunchDate } from '@/lib/constants';
import { DealerStats } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Rocket,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
};

async function getDealerStats(dealerId: string): Promise<DealerStats> {
  const supabase = createClient();
  
  const { data: listings } = await supabase
    .from('listings')
    .select('status, view_count, enquiry_count, offer_count')
    .eq('dealer_id', dealerId);

  return {
    totalListings: listings?.length || 0,
    activeListings: listings?.filter(l => l.status === 'approved').length || 0,
    pendingListings: listings?.filter(l => l.status === 'pending').length || 0,
    soldListings: listings?.filter(l => l.status === 'sold').length || 0,
    totalViews: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
    totalEnquiries: listings?.reduce((sum, l) => sum + (l.enquiry_count || 0), 0) || 0,
    totalOffers: listings?.reduce((sum, l) => sum + (l.offer_count || 0), 0) || 0,
  };
}

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get dealer info
  const { data: dealerUser } = await supabase
    .from('dealer_users')
    .select(`
      dealer_id,
      role,
      dealer:dealers(
        id,
        status,
        subscription_status,
        onboarding_completed
      )
    `)
    .eq('user_id', user.id)
    .single();

  const dealer = dealerUser?.dealer as any;
  const dealerId = dealerUser?.dealer_id;

  if (!dealerId) {
    redirect('/apply');
  }

  const stats = await getDealerStats(dealerId);
  const hasActiveSubscription = dealer?.subscription_status === 'active';
  const beforeLaunch = isBeforeLaunch();
  const countdown = getLaunchCountdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your dealership.
        </p>
      </div>

      {/* Pre-launch Banner */}
      {beforeLaunch && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Platform Launching Soon
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  TradeStock Marketplace launches on {formatLaunchDate()}. 
                  You can prepare your profile and add listings now. 
                  Marketplace access will be available at launch.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {countdown.days}d {countdown.hours}h {countdown.minutes}m
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/launch-countdown">View Countdown</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      {!hasActiveSubscription && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Subscription Required
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Subscribe to access the marketplace and connect with other dealers.
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/billing">View Plans</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} active, {stats.pendingListings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnquiries}</div>
            <p className="text-xs text-muted-foreground">
              Messages from other dealers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              On your listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your dealership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/listings/create">
                <Car className="mr-2 h-4 w-4" />
                Add New Listing
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/profile">
                <TrendingUp className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/team">
                <MessageSquare className="mr-2 h-4 w-4" />
                Manage Team
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Status</CardTitle>
            <CardDescription>Overview of your listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active</span>
                <Badge variant="default">{stats.activeListings}</Badge>
              </div>
              <Progress value={(stats.activeListings / Math.max(stats.totalListings, 1)) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Pending Approval</span>
                <Badge variant="secondary">{stats.pendingListings}</Badge>
              </div>
              <Progress value={(stats.pendingListings / Math.max(stats.totalListings, 1)) * 100} />
            </div>
            {stats.pendingListings > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>{stats.pendingListings} listing(s) awaiting approval</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
