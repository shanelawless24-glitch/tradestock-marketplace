// TradeStock Marketplace - TypeScript Types
// ============================================

import { Database } from '@/types/supabase';

// Supabase Table Types
export type Tables = Database['public']['Tables'];

export type DealerApplication = Tables['dealer_applications']['Row'];
export type DealerApplicationInsert = Tables['dealer_applications']['Insert'];
export type DealerApplicationUpdate = Tables['dealer_applications']['Update'];

export type Dealer = Tables['dealers']['Row'];
export type DealerInsert = Tables['dealers']['Insert'];
export type DealerUpdate = Tables['dealers']['Update'];

export type DealerProfile = Tables['dealer_profiles']['Row'];
export type DealerProfileInsert = Tables['dealer_profiles']['Insert'];
export type DealerProfileUpdate = Tables['dealer_profiles']['Update'];

export type DealerUser = Tables['dealer_users']['Row'];
export type DealerUserInsert = Tables['dealer_users']['Insert'];
export type DealerUserUpdate = Tables['dealer_users']['Update'];

export type Subscription = Tables['subscriptions']['Row'];
export type SubscriptionInsert = Tables['subscriptions']['Insert'];
export type SubscriptionUpdate = Tables['subscriptions']['Update'];

export type Listing = Tables['listings']['Row'];
export type ListingInsert = Tables['listings']['Insert'];
export type ListingUpdate = Tables['listings']['Update'];

export type ListingDetails = Tables['listing_details']['Row'];
export type ListingDetailsInsert = Tables['listing_details']['Insert'];
export type ListingDetailsUpdate = Tables['listing_details']['Update'];

export type ListingPhoto = Tables['listing_photos']['Row'];
export type ListingPhotoInsert = Tables['listing_photos']['Insert'];
export type ListingPhotoUpdate = Tables['listing_photos']['Update'];

export type Message = Tables['messages']['Row'];
export type MessageItem = Tables['message_items']['Row'];

export type Offer = Tables['offers']['Row'];
export type OfferInsert = Tables['offers']['Insert'];
export type OfferUpdate = Tables['offers']['Update'];

export type Notification = Tables['notifications']['Row'];
export type SavedSearch = Tables['saved_searches']['Row'];

// Extended Types with Relations
export type ListingWithDetails = Listing & {
  details: ListingDetails | null;
  photos: ListingPhoto[];
  dealer: {
    id: string;
    profile: Pick<DealerProfile, 'company_name' | 'county' | 'logo_url'>;
  } | null;
};

export type DealerWithProfile = Dealer & {
  profile: DealerProfile | null;
  user_count?: number;
  listing_count?: number;
};

export type MessageWithDetails = Message & {
  sender_dealer: {
    profile: Pick<DealerProfile, 'company_name' | 'logo_url'>;
  } | null;
  recipient_dealer: {
    profile: Pick<DealerProfile, 'company_name' | 'logo_url'>;
  } | null;
  listing: Pick<Listing, 'id' | 'reference_number'> | null;
  unread_count: number;
};

export type OfferWithDetails = Offer & {
  listing: ListingWithDetails | null;
  buyer_dealer: {
    profile: Pick<DealerProfile, 'company_name' | 'logo_url'>;
  } | null;
  seller_dealer: {
    profile: Pick<DealerProfile, 'company_name' | 'logo_url'>;
  } | null;
};

// Auth Types
export interface AuthState {
  user: User | null;
  role: 'admin' | 'owner' | 'admin_dealer' | 'member' | null;
  dealerId: string | null;
  dealerStatus: 'active' | 'suspended' | 'inactive' | null;
  subscriptionStatus: 'none' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | null;
  isLoading: boolean;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    role?: string;
  };
}

// Form Types
export interface DealerApplicationFormData {
  companyName: string;
  tradingName?: string;
  vatNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county: string;
  eircode?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealershipType: 'franchise' | 'independent' | 'multi_franchise' | 'wholesaler';
  brandsSold?: string[];
  stockVolumeMonthly?: number;
  message?: string;
  howDidYouHear?: string;
}

export interface ListingFormData {
  make: string;
  model: string;
  variant?: string;
  year: number;
  mileageKm: number;
  priceEur: number;
  priceType: 'fixed' | 'negotiable' | 'poa';
  fuelType: string;
  transmission: string;
  bodyType: string;
  engineSizeCc?: number;
  colour: string;
  colourType?: string;
  nctExpiry?: string;
  taxBand?: string;
  previousOwners?: number;
  serviceHistory?: string;
  conditionDescription?: string;
  tradeInSuitable: boolean;
  needsPrep: boolean;
  retailReady: boolean;
  locationCounty: string;
  features?: string[];
  warrantyMonths?: number;
}

export interface DealerProfileFormData {
  companyName: string;
  tradingName?: string;
  vatNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  eircode?: string;
  description?: string;
  yearEstablished?: number;
  brandsSpecializing?: string[];
  servicesOffered?: string[];
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// Filter Types
export interface ListingFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  county?: string;
  tradeInSuitable?: boolean;
  needsPrep?: boolean;
  retailReady?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc';
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Component Props Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  requiresSubscription?: boolean;
  adminOnly?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Stats Types
export interface DealerStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalViews: number;
  totalEnquiries: number;
  totalOffers: number;
}

export interface PlatformStats {
  totalDealers: number;
  pendingApplications: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldThisMonth: number;
  activeSubscriptions: number;
  totalMessages: number;
  totalOffers: number;
}

// Notification Types
export type NotificationType = 
  | 'listing_approved'
  | 'listing_rejected'
  | 'new_message'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_countered'
  | 'subscription_expiring'
  | 'application_approved'
  | 'application_rejected';

export interface NotificationData {
  listingId?: string;
  offerId?: string;
  threadId?: string;
  amount?: number;
  reason?: string;
}
