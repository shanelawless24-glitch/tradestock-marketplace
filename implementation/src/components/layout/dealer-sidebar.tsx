// TradeStock Marketplace - Dealer Sidebar
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isBeforeLaunch } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Car,
  Building2,
  Users,
  CreditCard,
  Lock,
  Store,
  Search,
  Bookmark,
  MessageSquare,
  Handshake,
  Bell,
  Rocket,
} from 'lucide-react';

interface DealerSidebarProps {
  subscriptionStatus: string | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSubscription?: boolean;
  badge?: string;
}

const dealerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Listings', href: '/listings', icon: Car },
  { label: 'Profile', href: '/profile', icon: Building2 },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Security', href: '/security', icon: Lock },
];

const marketplaceNavItems: NavItem[] = [
  { label: 'Browse Vehicles', href: '/browse', icon: Search, requiresSubscription: true },
  { label: 'Saved Searches', href: '/saved-searches', icon: Bookmark, requiresSubscription: true },
  { label: 'Dealer Directory', href: '/dealers', icon: Store, requiresSubscription: true },
  { label: 'Messages', href: '/messages', icon: MessageSquare, requiresSubscription: true },
  { label: 'Offers', href: '/offers', icon: Handshake, requiresSubscription: true },
  { label: 'Notifications', href: '/notifications', icon: Bell, requiresSubscription: true },
];

export function DealerSidebar({ subscriptionStatus }: DealerSidebarProps) {
  const pathname = usePathname();
  const hasActiveSubscription = subscriptionStatus === 'active';
  const beforeLaunch = isBeforeLaunch();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, disabled = false }: { item: NavItem; disabled?: boolean }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const linkContent = (
      <span className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
      )}>
        <Icon className="h-4 w-4" />
        {item.label}
        {item.badge && (
          <Badge variant={active ? 'secondary' : 'default'} className="ml-auto text-xs">
            {item.badge}
          </Badge>
        )}
      </span>
    );

    if (disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">{linkContent}</div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                {!hasActiveSubscription 
                  ? 'Subscription required' 
                  : 'Available after launch'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link href={item.href}>
        {linkContent}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 border-r bg-muted/40 lg:block">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-6">
          {/* Dealer Section */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Dealership
            </h3>
            <nav className="space-y-1">
              {dealerNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {/* Marketplace Section */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Marketplace
            </h3>
            <nav className="space-y-1">
              {marketplaceNavItems.map((item) => {
                const disabled = item.requiresSubscription && (!hasActiveSubscription || beforeLaunch);
                return (
                  <NavLink key={item.href} item={item} disabled={disabled} />
                );
              })}
            </nav>
          </div>

          {/* Launch Countdown (if before launch) */}
          {beforeLaunch && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-medium">Launching Soon</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Marketplace access available at launch
              </p>
              <Button variant="link" size="sm" className="px-0 h-auto mt-2" asChild>
                <Link href="/launch-countdown">View Countdown</Link>
              </Button>
            </div>
          )}

          {/* Subscription CTA (if no subscription) */}
          {!hasActiveSubscription && !beforeLaunch && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Unlock Marketplace</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Subscribe to browse and trade with other dealers
              </p>
              <Button variant="link" size="sm" className="px-0 h-auto mt-2" asChild>
                <Link href="/billing">View Plans</Link>
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
