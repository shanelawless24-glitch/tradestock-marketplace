import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationDrawer } from "@/components/layout/navigation-drawer";
import { CountdownBanner } from "@/components/shared/countdown-banner";

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Get user profile and dealer info
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "dealer") {
    redirect("/auth/login");
  }

  const { data: dealer } = await supabase
    .from("dealers")
    .select("*, subscriptions(*)")
    .eq("user_id", session.user.id)
    .single();

  // Count unread messages
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read_at", null)
    .neq("sender_dealer_id", dealer?.id);

  // Count open tickets
  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("dealer_id", dealer?.id)
    .in("status", ["open", "bot_handling", "escalated"]);

  return (
    <div className="min-h-screen bg-background">
      <CountdownBanner />
      
      <div className="flex">
        <NavigationDrawer
          role="dealer"
          userName={profile.full_name || dealer?.contact_name || profile.email}
          userEmail={profile.email}
          businessName={dealer?.business_name}
          subscriptionStatus={dealer?.subscriptions?.status}
          unreadMessages={unreadMessages || 0}
          unreadTickets={openTickets || 0}
        />
        
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
