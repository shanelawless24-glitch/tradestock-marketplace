// ============================================
// APPLICATION CONSTANTS
// ============================================

export const APP_NAME = "TradeStock";
export const APP_TAGLINE = "The B2B Dealership Marketplace";

// Launch Date - March 30, 2026 (Europe/Dublin)
export const LAUNCH_DATE = new Date("2026-03-30T00:00:00+01:00");

// Pricing
export const PRICING = {
  STANDARD: {
    name: "Standard",
    monthlyPrice: 99.99,
    description: "Full access to all platform features",
  },
  LIFETIME: {
    name: "Lifetime Launch",
    monthlyPrice: 49.99,
    description: "Limited offer for first 100 dealerships",
    maxActivations: 100,
  },
} as const;

// Commission Structure
export const COMMISSION = {
  STANDARD_ACTIVATION: 40,
  LIFETIME_ACTIVATION: 20,
  MONTHLY_BONUS_THRESHOLD: 100,
  MONTHLY_BONUS_AMOUNT: 1000,
  RETENTION_BONUS: 25,
  RETENTION_INTERVAL_DAYS: 90,
} as const;

// Irish Counties (32 counties)
export const IRISH_COUNTIES = [
  "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork",
  "Derry", "Donegal", "Down", "Dublin", "Fermanagh", "Galway",
  "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick",
  "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly",
  "Roscommon", "Sligo", "Tipperary", "Tyrone", "Waterford", "Westmeath",
  "Wexford", "Wicklow"
] as const;

// Vehicle Body Types (Irish terminology)
export const BODY_TYPES = [
  { value: "saloon", label: "Saloon" },
  { value: "hatchback", label: "Hatchback" },
  { value: "estate", label: "Estate" },
  { value: "van", label: "Van" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
  { value: "pickup", label: "Pickup" },
  { value: "mpv", label: "MPV" },
] as const;

// Fuel Types
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "plugin_hybrid", label: "Plug-in Hybrid" },
  { value: "electric", label: "Electric" },
] as const;

// Transmission Types
export const TRANSMISSION_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "semi_automatic", label: "Semi-Automatic" },
  { value: "cvt", label: "CVT" },
] as const;

// Vehicle Makes (common in Ireland)
export const VEHICLE_MAKES = [
  "Audi", "BMW", "Ford", "Hyundai", "Kia", "Mercedes-Benz",
  "Nissan", "Opel", "Peugeot", "Renault", "Skoda", "Toyota",
  "Volkswagen", "Volvo", "Honda", "Mazda", "SEAT", "Citroen",
  "Fiat", "Jeep", "Land Rover", "Lexus", "Mini", "Porsche",
  "Subaru", "Suzuki", "Tesla", "Vauxhall"
] as const;

// Support Categories
export const SUPPORT_CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "technical", label: "Technical Issue" },
  { value: "listings", label: "Listings & Vehicles" },
  { value: "account", label: "Account Management" },
] as const;

// Ticket Priorities
export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

// Public Navigation Items
export const PUBLIC_NAV_ITEMS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact Us" },
] as const;

// Navigation Items
export const NAV_ITEMS = {
  DEALER: [
    { href: "/dealer/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/dealer/list-vehicle", label: "List Vehicle", icon: "Car" },
    { href: "/dealer/browse", label: "Browse Vehicles", icon: "Search", requiresLaunch: true },
    { href: "/dealer/dealers", label: "Dealerships", icon: "Users", requiresLaunch: true },
    { href: "/dealer/messages", label: "Messages", icon: "MessageSquare", requiresLaunch: true },
    { href: "/dealer/saved", label: "Saved", icon: "Bookmark" },
    { href: "/dealer/billing", label: "Billing", icon: "CreditCard" },
    { href: "/dealer/support", label: "Support", icon: "HelpCircle" },
    { href: "/dealer/account", label: "Account", icon: "Settings" },
  ],
  SDR: [
    { href: "/sdr/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/sdr/add-dealer", label: "Add Dealership", icon: "UserPlus" },
    { href: "/sdr/dealerships", label: "My Dealerships", icon: "Building2" },
    { href: "/sdr/performance", label: "Performance", icon: "TrendingUp" },
    { href: "/sdr/leaderboard", label: "Leaderboard", icon: "Trophy" },
    { href: "/sdr/commission", label: "Commission", icon: "Euro" },
    { href: "/sdr/account", label: "Account", icon: "Settings" },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/admin/launch-control", label: "Launch Control", icon: "Rocket" },
    { href: "/admin/pending-vehicles", label: "Pending Vehicles", icon: "Clock" },
    { href: "/admin/applications", label: "Applications", icon: "FileText" },
    { href: "/admin/dealers", label: "Dealers", icon: "Building2" },
    { href: "/admin/listings", label: "Listings", icon: "Car" },
    { href: "/admin/messages", label: "Messages", icon: "MessageSquare" },
    { href: "/admin/offers", label: "Offers & Deals", icon: "Tag" },
    { href: "/admin/billing", label: "Billing", icon: "CreditCard" },
    { href: "/admin/audit", label: "Audit Log", icon: "Shield" },
  ],
} as const;

// Status Colors
export const STATUS_COLORS = {
  dealer: {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    removed: "bg-gray-100 text-gray-800 border-gray-200",
  },
  subscription: {
    trialing: "bg-blue-100 text-blue-800 border-blue-200",
    active: "bg-green-100 text-green-800 border-green-200",
    past_due: "bg-orange-100 text-orange-800 border-orange-200",
    canceled: "bg-gray-100 text-gray-800 border-gray-200",
    unpaid: "bg-red-100 text-red-800 border-red-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  },
  ticket: {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    bot_handling: "bg-purple-100 text-purple-800 border-purple-200",
    escalated: "bg-orange-100 text-orange-800 border-orange-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  },
} as const;

// Format currency (Euro)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Check if launch has occurred
export function isLaunchPassed(): boolean {
  return new Date() >= LAUNCH_DATE;
}

// Get countdown to launch
export function getLaunchCountdown(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = new Date().getTime();
  const launch = LAUNCH_DATE.getTime();
  const diff = launch - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
  };
}
