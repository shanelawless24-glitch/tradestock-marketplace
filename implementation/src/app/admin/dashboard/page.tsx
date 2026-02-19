// TradeStock Marketplace - Admin Dashboard
// ============================================

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Car, 
  ClipboardList, 
  TrendingUp,
  Euro,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

async function getPlatformStats() {
  const supabase = createClient();
  
  const [
    { count: totalDealers },
    { count: pendingApplications },
    { count: totalListings },
    { count: activeListings },
    { count: pendingListings },
    { count: activeSubscriptions },
  ] = await Promise.all([
    supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('dealer_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalDealers: totalDealers || 0,
    pendingApplications: pendingApplications || 0,
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    pendingListings: pendingListings || 0,
    activeSubscriptions: activeSubscriptions || 0,
  };
}

async function getRecentActivity() {
  const supabase = createClient();
  
  const { data: recentApplications } = await supabase
    .from('dealer_applications')
    .select('id, company_name, contact_name, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentListings } = await supabase
    .from('listings')
    .select('id, reference_number, status, created_at, dealer:dealers(profile:dealer_profiles(company_name))')
    .order('created_at', { ascending: false })
    .limit(5);

  return { recentApplications, recentListings };
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login');
  }

  const stats = await getPlatformStats();
  const { recentApplications, recentListings } = await getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/applications">
              Review Applications
              {stats.pendingApplications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingApplications}
                </Badge>
              )}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/listings">
              Moderate Listings
              {stats.pendingListings > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.pendingListings}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDealers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApplications} pending applications
            </p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">Good</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">
            Recent Applications
            {stats.pendingApplications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingApplications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="listings">
            Recent Listings
            {stats.pendingListings > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pendingListings}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest dealer applications awaiting review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications?.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{app.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.contact_name} • {new Date(app.created_at).toLocaleDateString('en-IE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                        {app.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/applications?id=${app.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {recentApplications?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent applications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Listings</CardTitle>
              <CardDescription>
                Latest vehicle listings awaiting moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentListings?.map((listing: any) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{listing.reference_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.dealer?.profile?.company_name} • {new Date(listing.created_at).toLocaleDateString('en-IE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          listing.status === 'pending' ? 'secondary' :
                          listing.status === 'approved' ? 'default' :
                          'destructive'
                        }
                      >
                        {listing.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/listings?id=${listing.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {recentListings?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent listings
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/applications">
                <ClipboardList className="mr-2 h-4 w-4" />
                Review Applications
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/listings">
                <Car className="mr-2 h-4 w-4" />
                Moderate Listings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dealers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/dealers">
                <Users className="mr-2 h-4 w-4" />
                Manage Dealers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
