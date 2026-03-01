import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/set-password"];
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return response;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Get user profile for role-based access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", session.user.id)
    .single();

  if (!profile || !profile.is_active) {
    // Sign out inactive users
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Role-based route protection
  const role = profile.role;

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
  }

  // SDR routes
  if (pathname.startsWith("/sdr") && role !== "sdr" && role !== "admin") {
    return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
  }

  // Dealer routes - check subscription status for certain pages
  if (pathname.startsWith("/dealer") && role === "dealer") {
    // Pages that require active subscription
    const subscriptionRequiredPages = [
      "/dealer/browse",
      "/dealer/dealers",
      "/dealer/messages",
      "/dealer/saved",
    ];

    const requiresSubscription = subscriptionRequiredPages.some((page) =>
      pathname.startsWith(page)
    );

    if (requiresSubscription) {
      // Check subscription status
      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (dealer) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("status, lifetime_active")
          .eq("dealer_id", dealer.id)
          .single();

        const isActive =
          subscription?.status === "active" ||
          subscription?.status === "trialing" ||
          subscription?.lifetime_active;

        if (!isActive) {
          return NextResponse.redirect(new URL("/dealer/billing", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
