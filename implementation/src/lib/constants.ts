// TradeStock Marketplace - Constants
// ============================================

export const PLATFORM_CONFIG = {
  LAUNCH_DATE: '2026-03-06T00:00:00+00:00',
  TIMEZONE: 'Europe/Dublin',
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€',
} as const;

export function isBeforeLaunch(): boolean {
  const now = new Date();
  const launch = new Date(PLATFORM_CONFIG.LAUNCH_DATE);
  return now < launch;
}

export function getLaunchCountdown(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const launch = new Date(PLATFORM_CONFIG.LAUNCH_DATE);
  const diff = Math.max(0, launch.getTime() - now.getTime());
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function formatLaunchDate(): string {
  const launch = new Date(PLATFORM_CONFIG.LAUNCH_DATE);
  return launch.toLocaleDateString('en-IE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 50,
    priceCents: 5000,
    description: 'Perfect for small dealerships',
    features: [
      'Up to 50 active listings',
      'Basic search & filters',
      'Direct messaging',
      'Offer management',
      'Email support',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 100,
    priceCents: 10000,
    description: 'For growing dealerships',
    features: [
      'Unlimited listings',
      'Advanced search & filters',
      'Priority placement',
      'Saved searches',
      'Analytics dashboard',
      'Priority support',
    ],
  },
} as const;

// Vehicle Constants (Irish Terminology)
export const VEHICLE_CONSTANTS = {
  FUEL_TYPES: [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
    { value: 'electric', label: 'Electric' },
    { value: 'lpg', label: 'LPG' },
  ],
  
  TRANSMISSIONS: [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
    { value: 'semi_automatic', label: 'Semi-Automatic' },
    { value: 'cvt', label: 'CVT' },
  ],
  
  BODY_TYPES: [
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'saloon', label: 'Saloon' },
    { value: 'estate', label: 'Estate' },
    { value: 'suv', label: 'SUV' },
    { value: 'coupe', label: 'Coupe' },
    { value: 'convertible', label: 'Convertible' },
    { value: 'van', label: 'Van' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'mpv', label: 'MPV' },
    { value: 'jeep', label: 'Jeep' },
  ],
  
  COLOURS: [
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'silver', label: 'Silver' },
    { value: 'grey', label: 'Grey' },
    { value: 'blue', label: 'Blue' },
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'brown', label: 'Brown' },
    { value: 'beige', label: 'Beige' },
    { value: 'gold', label: 'Gold' },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'other', label: 'Other' },
  ],
  
  SERVICE_HISTORY: [
    { value: 'full', label: 'Full Service History' },
    { value: 'part', label: 'Part Service History' },
    { value: 'none', label: 'No Service History' },
  ],
  
  COLOUR_TYPES: [
    { value: 'solid', label: 'Solid' },
    { value: 'metallic', label: 'Metallic' },
    { value: 'pearlescent', label: 'Pearlescent' },
    { value: 'matte', label: 'Matte' },
  ],
} as const;

// Irish Counties
export const IRISH_COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin',
  'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim',
  'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan',
  'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford',
  'Westmeath', 'Wexford', 'Wicklow'
] as const;

// Dealership Types
export const DEALERSHIP_TYPES = [
  { value: 'franchise', label: 'Franchise Dealer' },
  { value: 'independent', label: 'Independent Dealer' },
  { value: 'multi_franchise', label: 'Multi-Franchise' },
  { value: 'wholesaler', label: 'Wholesaler' },
] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  ADMIN_DEALER: 'admin',
  MEMBER: 'member',
} as const;

// Listing Status
export const LISTING_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SOLD: 'sold',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
} as const;

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Offer Status
export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  NONE: 'none',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  UNPAID: 'unpaid',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Limits
export const LIMITS = {
  MAX_PHOTOS_PER_LISTING: 20,
  MAX_FILE_SIZE_MB: 10,
  MAX_LISTINGS_FREE: 5,
  MAX_TEAM_MEMBERS: 10,
} as const;

// Validation
export const VALIDATION = {
  VAT_REGEX: /^IE[0-9]{7}[A-Z]$/i,
  EIRCODE_REGEX: /^[A-Z]{1}[0-9]{2}\s?[A-Z0-9]{4}$/i,
  PHONE_REGEX: /^\+353[\s]?[1-9][0-9]{7,8}$/,
} as const;
