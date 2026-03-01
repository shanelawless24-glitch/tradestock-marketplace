import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationDrawer } from "@/components/layout/navigation-drawer";

export default async function SDRLayout({
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

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile || (profile.role !== "sdr" && profile.role !== "admin")) {
    redirect("/dealer/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationDrawer
        role="sdr"
        userName={profile.full_name || profile.email}
        userEmail={profile.email}
      />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
