"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Car,
  Search,
  Users,
  MessageSquare,
  Bookmark,
  CreditCard,
  HelpCircle,
  Settings,
  UserPlus,
  Building2,
  TrendingUp,
  Trophy,
  Euro,
  FileText,
  Menu,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { isLaunchPassed } from "@/lib/constants";

type UserRole = "admin" | "sdr" | "dealer";

interface NavigationDrawerProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  businessName?: string;
  subscriptionStatus?: string;
  unreadMessages?: number;
  unreadTickets?: number;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Car,
  Search,
  Users,
  MessageSquare,
  Bookmark,
  CreditCard,
  HelpCircle,
  Settings,
  UserPlus,
  Building2,
  TrendingUp,
  Trophy,
  Euro,
  FileText,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  requiresLaunch?: boolean;
  badge?: number;
}

function NavLink({
  item,
  isActive,
  isLocked,
}: {
  item: NavItem;
  isActive: boolean;
  isLocked: boolean;
}) {
  const Icon = iconMap[item.icon];

  return (
    <Link
      href={isLocked ? "#" : item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      ) : null}
      {isLocked && (
        <Badge variant="outline" className="text-xs">
          After Launch
        </Badge>
      )}
    </Link>
  );
}

function NavSection({
  items,
  pathname,
  role,
}: {
  items: NavItem[];
  pathname: string;
  role: UserRole;
}) {
  const launchPassed = isLaunchPassed();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const isLocked = item.requiresLaunch && !launchPassed && role === "dealer";

        return (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive}
            isLocked={isLocked}
          />
        );
      })}
    </div>
  );
}

export function NavigationDrawer({
  role,
  userName,
  userEmail,
  businessName,
  subscriptionStatus,
  unreadMessages = 0,
  unreadTickets = 0,
}: NavigationDrawerProps) {
  const pathname = usePathname();
  const navItems = NAV_ITEMS[role.toUpperCase() as keyof typeof NAV_ITEMS] || [];

  // Add badges to nav items
  const itemsWithBadges = navItems.map((item) => ({
    ...item,
    badge:
      item.href === "/dealer/messages" && unreadMessages > 0
        ? unreadMessages
        : item.href === "/dealer/support" && unreadTickets > 0
        ? unreadTickets
        : undefined,
  }));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-tradestock-500 to-tradestock-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">TradeStock</span>
            <span className="text-xs text-muted-foreground">Marketplace</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <NavSection items={itemsWithBadges} pathname={pathname} role={role} />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {businessName || userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        {subscriptionStatus && (
          <div className="mb-3">
            <Badge
              variant={subscriptionStatus === "active" ? "success" : "warning"}
              className="text-xs"
            >
              {subscriptionStatus === "active" ? "Active" : subscriptionStatus}
            </Badge>
          </div>
        )}
        <Separator className="my-3" />
        <form action="/auth/signout" method="post">
          <Button variant="ghost" className="w-full justify-start" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-tradestock-500 to-tradestock-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span>TradeStock</span>
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
