// TradeStock Marketplace - Auth Middleware
// ============================================
// DETERMINISTIC ROUTING - All routing decisions happen here
// Priority order:
// 1. Public routes → allow
// 2. Not logged in → login
// 3. Admin → admin area
// 4. Pending application → pending approval page
// 5. Rejected application → rejected page
// 6. Approved but unsubscribed → billing (with exceptions)
// 7. Before launch + restricted → launch countdown
// 8. All checks passed → allow

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isBeforeLaunch } from '@/lib/constants';

// Route definitions
const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/pricing',
  '/apply',
  '/faq',
  '/contact',
  '/terms',
  '/privacy',
  '/api/webhooks',
];

const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

const DEALER_ROUTES = [
  '/dashboard',
  '/listings',
  '/profile',
  '/team',
  '/billing',
  '/security',
  '/pending-approval',
  '/application-rejected',
  '/launch-countdown',
];

const MARKETPLACE_ROUTES = [
  '/browse',
  '/saved-searches',
  '/dealers',
  '/messages',
  '/offers',
  '/notifications',
];

const ADMIN_ROUTES = ['/admin'];

// Helper: Check if path matches any route patterns
function matchesRoutes(path: string, routes: string[]): boolean {
  return routes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

// Helper: Check if route is public
function isPublicRoute(path: string): boolean {
  return matchesRoutes(path, PUBLIC_ROUTES) || 
         matchesRoutes(path, AUTH_ROUTES) ||
         path.startsWith('/_next/') ||
         path.startsWith('/api/auth/') ||
         path.startsWith('/static/') ||
         path.includes('.');
}

// Helper: Check if route is dealer area
function isDealerRoute(path: string): boolean {
  return matchesRoutes(path, DEALER_ROUTES);
}

// Helper: Check if route is marketplace
function isMarketplaceRoute(path: string): boolean {
  return matchesRoutes(path, MARKETPLACE_ROUTES);
}

// Helper: Check if route is admin
function isAdminRoute(path: string): boolean {
  return matchesRoutes(path, ADMIN_ROUTES);
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public routes - always allow
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Not logged in → redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user with role info
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if user is admin
  const isAdmin = user.app_metadata?.role === 'admin';

  // 3. Admin user
  if (isAdmin) {
    // Allow admin routes
    if (isAdminRoute(pathname)) {
      return NextResponse.next();
    }
    // Redirect non-admin routes to admin dashboard
    if (!isAdminRoute(pathname)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Get dealer info for non-admin users
  const { data: dealerUser } = await supabase
    .from('dealer_users')
    .select(`
      dealer_id,
      role,
      dealer:dealers(
        id,
        status,
        subscription_status,
        application:dealer_applications(status, rejection_reason)
      )
    `)
    .eq('user_id', user.id)
    .single();

  const dealer = dealerUser?.dealer as any;
  const applicationStatus = dealer?.application?.status;
  const applicationRejectionReason = dealer?.application?.rejection_reason;

  // 4. No dealer record yet (shouldn't happen for approved users)
  if (!dealerUser || !dealer) {
    // Check if they have a pending application
    const { data: application } = await supabase
      .from('dealer_applications')
      .select('status, rejection_reason')
      .eq('contact_email', user.email)
      .single();

    if (application?.status === 'pending') {
      if (pathname !== '/pending-approval') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      return NextResponse.next();
    }

    if (application?.status === 'rejected') {
      if (pathname !== '/application-rejected') {
        return NextResponse.redirect(new URL('/application-rejected', request.url));
      }
      return NextResponse.next();
    }

    // No application found - redirect to apply
    return NextResponse.redirect(new URL('/apply', request.url));
  }

  // 5. Pending application approval
  if (applicationStatus === 'pending') {
    if (pathname !== '/pending-approval') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.next();
  }

  // 6. Rejected application
  if (applicationStatus === 'rejected') {
    if (pathname !== '/application-rejected') {
      const url = new URL('/application-rejected', request.url);
      if (applicationRejectionReason) {
        url.searchParams.set('reason', applicationRejectionReason);
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 7. Dealer suspended
  if (dealer.status === 'suspended') {
    // Allow access to contact page only
    if (pathname !== '/contact') {
      return NextResponse.redirect(new URL('/contact?suspended=true', request.url));
    }
    return NextResponse.next();
  }

  // 8. Check subscription for marketplace routes
  const hasActiveSubscription = dealer.subscription_status === 'active';
  const isMarketplace = isMarketplaceRoute(pathname);

  if (isMarketplace) {
    // Marketplace requires subscription
    if (!hasActiveSubscription) {
      return NextResponse.redirect(
        new URL('/billing?reason=subscription_required', request.url)
      );
    }

    // Marketplace requires launch date passed
    if (isBeforeLaunch()) {
      return NextResponse.redirect(new URL('/launch-countdown', request.url));
    }
  }

  // 9. All checks passed - allow access
  return NextResponse.next();
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
