// ============================================
// TYPE DEFINITIONS
// ============================================

import type { Database } from "@/lib/supabase/database.types";

// Re-export database types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Profile types
export type Profile = Tables<"profiles">;
export type UserRole = Enums<"user_role">;

// Dealer types
export type Dealer = Tables<"dealers">;
export type DealerStatus = Enums<"dealer_status">;
export type DealerWithProfile = Dealer & {
  profile: Profile;
  subscription: Subscription | null;
};

// SDR types
export type SDR = Tables<"sdrs">;
export type SDRWithProfile = SDR & {
  profile: Profile;
};

// Subscription types
export type Subscription = Tables<"subscriptions">;
export type SubscriptionStatus = Enums<"subscription_status">;

// Listing types
export type Listing = Tables<"listings">;
export type ListingWithDealer = Listing & {
  dealer: Dealer;
};

// Message types
export type MessageThread = Tables<"message_threads">;
export type Message = Tables<"messages">;
export type MessageWithSender = Message & {
  sender: Dealer;
};

// Support types
export type SupportTicket = Tables<"support_tickets">;
export type SupportTicketStatus = Enums<"ticket_status">;
export type SupportMessage = Tables<"support_messages">;
export type MessageSenderType = Enums<"message_sender_type">;

// Commission types
export type CommissionEvent = Tables<"commission_events">;
export type CommissionType = Enums<"commission_type">;
export type CommissionSummary = Tables<"commission_summaries">;

// Invitation types
export type Invitation = Tables<"invitations">;

// County type
export type County = Tables<"counties">;

// Promo counter
export type PromoCounter = Tables<"promo_counters">;

// Auth context types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
}

// Dashboard stats types
export interface DealerDashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalEnquiries: number;
  savedListings: number;
  unreadMessages: number;
}

export interface SDRDashboardStats {
  totalDealerships: number;
  activeSubscriptions: number;
  monthlyConversions: number;
  totalCommission: number;
  lifetimeCommission: number;
}

export interface AdminDashboardStats {
  totalDealers: number;
  pendingDealers: number;
  approvedDealers: number;
  activeSubscriptions: number;
  totalListings: number;
  mrr: number;
  lifetimePromoRemaining: number;
}

// Form types
export interface DealerApplicationForm {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  vatNumber: string;
  county: string;
  address: string;
}

export interface ListingForm {
  make: string;
  model: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  engineSize?: string;
  mileage?: number;
  color?: string;
  price: number;
  vatIncluded: boolean;
  title: string;
  description?: string;
  features: string[];
  images: string[];
}

export interface SupportTicketForm {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

// API response types
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Realtime event types
export interface RealtimeMessageEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  payload: any;
}
