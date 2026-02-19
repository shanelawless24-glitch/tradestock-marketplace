// TradeStock Marketplace - Dealer Layout
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DealerSidebar } from '@/components/layout/dealer-sidebar';
import { DealerHeader } from '@/components/layout/dealer-header';

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check if admin
  const isAdmin = user.app_metadata?.role === 'admin';
  
  if (isAdmin) {
    redirect('/admin/dashboard');
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
        profile:dealer_profiles(company_name, logo_url)
      )
    `)
    .eq('user_id', user.id)
    .single();

  const dealer = dealerUser?.dealer as any;

  // If no dealer record, redirect to apply
  if (!dealerUser || !dealer) {
    redirect('/apply');
  }

  // Check application status
  const { data: application } = await supabase
    .from('dealer_applications')
    .select('status')
    .eq('id', dealer.application_id)
    .single();

  if (application?.status === 'pending') {
    redirect('/pending-approval');
  }

  if (application?.status === 'rejected') {
    redirect('/application-rejected');
  }

  return (
    <div className="min-h-screen bg-background">
      <DealerHeader 
        dealerName={dealer?.profile?.company_name || 'Your Dealership'}
        logoUrl={dealer?.profile?.logo_url}
        userEmail={user.email}
      />
      <div className="flex">
        <DealerSidebar 
          subscriptionStatus={dealer?.subscription_status}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
