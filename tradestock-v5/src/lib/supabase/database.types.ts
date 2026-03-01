export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "sdr" | "dealer";
          is_active: boolean;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "sdr" | "dealer";
          is_active?: boolean;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "sdr" | "dealer";
          is_active?: boolean;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      counties: {
        Row: {
          id: number;
          name: string;
          province: string;
        };
        Insert: {
          id?: number;
          name: string;
          province: string;
        };
        Update: {
          id?: number;
          name?: string;
          province?: string;
        };
      };
      sdrs: {
        Row: {
          id: string;
          user_id: string;
          employee_code: string | null;
          target_monthly: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_code?: string | null;
          target_monthly?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          employee_code?: string | null;
          target_monthly?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      dealers: {
        Row: {
          id: string;
          user_id: string;
          source_sdr_id: string | null;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string;
          vat_number: string;
          county_id: number | null;
          address: string;
          status: "pending" | "approved" | "suspended" | "removed";
          approved_at: string | null;
          approved_by: string | null;
          lifetime_discount: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_sdr_id?: string | null;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string;
          vat_number: string;
          county_id?: number | null;
          address: string;
          status?: "pending" | "approved" | "suspended" | "removed";
          approved_at?: string | null;
          approved_by?: string | null;
          lifetime_discount?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_sdr_id?: string | null;
          business_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string;
          vat_number?: string;
          county_id?: number | null;
          address?: string;
          status?: "pending" | "approved" | "suspended" | "removed";
          approved_at?: string | null;
          approved_by?: string | null;
          lifetime_discount?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          dealer_id: string;
          status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "inactive";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          lifetime_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealer_id: string;
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "inactive";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          lifetime_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealer_id?: string;
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "inactive";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          lifetime_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          dealer_id: string;
          make: string;
          model: string;
          year: number;
          body_type: string;
          fuel_type: string;
          transmission: string;
          engine_size: string | null;
          mileage: number | null;
          color: string | null;
          price: number;
          vat_included: boolean;
          title: string;
          description: string | null;
          features: string[];
          images: string[];
          status: "active" | "reserved" | "sold" | "withdrawn";
          view_count: number;
          enquiry_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealer_id: string;
          make: string;
          model: string;
          year: number;
          body_type: string;
          fuel_type: string;
          transmission: string;
          engine_size?: string | null;
          mileage?: number | null;
          color?: string | null;
          price: number;
          vat_included?: boolean;
          title: string;
          description?: string | null;
          features?: string[];
          images?: string[];
          status?: "active" | "reserved" | "sold" | "withdrawn";
          view_count?: number;
          enquiry_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealer_id?: string;
          make?: string;
          model?: string;
          year?: number;
          body_type?: string;
          fuel_type?: string;
          transmission?: string;
          engine_size?: string | null;
          mileage?: number | null;
          color?: string | null;
          price?: number;
          vat_included?: boolean;
          title?: string;
          description?: string | null;
          features?: string[];
          images?: string[];
          status?: "active" | "reserved" | "sold" | "withdrawn";
          view_count?: number;
          enquiry_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_listings: {
        Row: {
          id: string;
          dealer_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealer_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealer_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          role_target: "admin" | "sdr" | "dealer";
          dealer_id: string | null;
          sdr_id: string | null;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          email: string;
          role_target: "admin" | "sdr" | "dealer";
          dealer_id?: string | null;
          sdr_id?: string | null;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          used_by?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          email?: string;
          role_target?: "admin" | "sdr" | "dealer";
          dealer_id?: string | null;
          sdr_id?: string | null;
          token_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      message_threads: {
        Row: {
          id: string;
          listing_id: string | null;
          participant_1_id: string;
          participant_2_id: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          participant_1_id: string;
          participant_2_id: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          participant_1_id?: string;
          participant_2_id?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_dealer_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_dealer_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_dealer_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          dealer_id: string;
          status: "open" | "bot_handling" | "escalated" | "closed";
          subject: string;
          category: string | null;
          priority: string;
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealer_id: string;
          status?: "open" | "bot_handling" | "escalated" | "closed";
          subject: string;
          category?: string | null;
          priority?: string;
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealer_id?: string;
          status?: "open" | "bot_handling" | "escalated" | "closed";
          subject?: string;
          category?: string | null;
          priority?: string;
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_type: "dealer" | "admin" | "bot";
          sender_id: string | null;
          body: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_type: "dealer" | "admin" | "bot";
          sender_id?: string | null;
          body: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_type?: "dealer" | "admin" | "bot";
          sender_id?: string | null;
          body?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      commission_events: {
        Row: {
          id: string;
          type: "standard_activation" | "lifetime_activation" | "monthly_bonus" | "retention_bonus";
          sdr_id: string;
          dealer_id: string | null;
          amount: number;
          description: string | null;
          metadata: Json;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          type: "standard_activation" | "lifetime_activation" | "monthly_bonus" | "retention_bonus";
          sdr_id: string;
          dealer_id?: string | null;
          amount: number;
          description?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        Update: {
          id?: string;
          type?: "standard_activation" | "lifetime_activation" | "monthly_bonus" | "retention_bonus";
          sdr_id?: string;
          dealer_id?: string | null;
          amount?: number;
          description?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
      };
      commission_summaries: {
        Row: {
          id: string;
          sdr_id: string;
          period_month: string;
          total_commission: number;
          activation_count: number;
          bonus_count: number;
          retention_count: number;
        };
        Insert: {
          id?: string;
          sdr_id: string;
          period_month: string;
          total_commission?: number;
          activation_count?: number;
          bonus_count?: number;
          retention_count?: number;
        };
        Update: {
          id?: string;
          sdr_id?: string;
          period_month?: string;
          total_commission?: number;
          activation_count?: number;
          bonus_count?: number;
          retention_count?: number;
        };
      };
      retention_bonuses: {
        Row: {
          id: string;
          sdr_id: string;
          dealer_id: string;
          interval_number: number;
          amount: number;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          sdr_id: string;
          dealer_id: string;
          interval_number: number;
          amount?: number;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          sdr_id?: string;
          dealer_id?: string;
          interval_number?: number;
          amount?: number;
          awarded_at?: string;
        };
      };
      promo_counters: {
        Row: {
          id: number;
          lifetime_activation_count: number;
          max_lifetime_activations: number;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          lifetime_activation_count?: number;
          max_lifetime_activations?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          lifetime_activation_count?: number;
          max_lifetime_activations?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: unknown | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: unknown | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: unknown | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_sdr: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_dealer_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      dealer_is_approved: {
        Args: {
          dealer_uuid: string;
        };
        Returns: boolean;
      };
      dealer_has_active_subscription: {
        Args: {
          dealer_uuid: string;
        };
        Returns: boolean;
      };
      promo_lifetime_available: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      consume_promo_lifetime: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      promo_slots_remaining: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      user_role: "admin" | "sdr" | "dealer";
      dealer_status: "pending" | "approved" | "suspended" | "removed";
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "inactive";
      ticket_status: "open" | "bot_handling" | "escalated" | "closed";
      message_sender_type: "dealer" | "admin" | "bot";
      commission_type: "standard_activation" | "lifetime_activation" | "monthly_bonus" | "retention_bonus";
    };
  };
}
