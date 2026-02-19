// TradeStock Marketplace - Supabase Database Types
// This file should be generated using: supabase gen types typescript
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      dealer_applications: {
        Row: {
          id: string
          company_name: string
          trading_name: string | null
          vat_number: string | null
          address_line1: string
          address_line2: string | null
          city: string
          county: string
          eircode: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
          dealership_type: string
          brands_sold: string[] | null
          stock_volume_monthly: number | null
          message: string | null
          how_did_you_hear: string | null
          status: string
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          trading_name?: string | null
          vat_number?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          county: string
          eircode?: string | null
          contact_name: string
          contact_email: string
          contact_phone: string
          dealership_type: string
          brands_sold?: string[] | null
          stock_volume_monthly?: number | null
          message?: string | null
          how_did_you_hear?: string | null
          status?: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          trading_name?: string | null
          vat_number?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          county?: string
          eircode?: string | null
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          dealership_type?: string
          brands_sold?: string[] | null
          stock_volume_monthly?: number | null
          message?: string | null
          how_did_you_hear?: string | null
          status?: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dealers: {
        Row: {
          id: string
          application_id: string | null
          status: string
          subscription_status: string
          stripe_customer_id: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id?: string | null
          status?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string | null
          status?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dealer_profiles: {
        Row: {
          dealer_id: string
          company_name: string
          trading_name: string | null
          vat_number: string | null
          company_registration_number: string | null
          logo_url: string | null
          cover_image_url: string | null
          email: string | null
          phone: string | null
          website: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          county: string | null
          eircode: string | null
          latitude: number | null
          longitude: number | null
          description: string | null
          year_established: number | null
          brands_specializing: string[] | null
          services_offered: string[]
          opening_hours: Json
          social_media: Json
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          dealer_id: string
          company_name: string
          trading_name?: string | null
          vat_number?: string | null
          company_registration_number?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          county?: string | null
          eircode?: string | null
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          year_established?: number | null
          brands_specializing?: string[] | null
          services_offered?: string[]
          opening_hours?: Json
          social_media?: Json
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          dealer_id?: string
          company_name?: string
          trading_name?: string | null
          vat_number?: string | null
          company_registration_number?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          county?: string | null
          eircode?: string | null
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          year_established?: number | null
          brands_specializing?: string[] | null
          services_offered?: string[]
          opening_hours?: Json
          social_media?: Json
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      dealer_users: {
        Row: {
          id: string
          user_id: string
          dealer_id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string
          is_primary_contact: boolean
          invited_by: string | null
          invited_at: string | null
          invitation_token: string | null
          status: string
          joined_at: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dealer_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_primary_contact?: boolean
          invited_by?: string | null
          invited_at?: string | null
          invitation_token?: string | null
          status?: string
          joined_at?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dealer_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_primary_contact?: boolean
          invited_by?: string | null
          invited_at?: string | null
          invitation_token?: string | null
          status?: string
          joined_at?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          dealer_id: string
          reference_number: string | null
          status: string
          is_featured: boolean
          featured_until: string | null
          view_count: number
          enquiry_count: number
          offer_count: number
          sold_at: string | null
          sold_to_dealer_id: string | null
          sold_price_eur: number | null
          moderation_notes: string | null
          moderated_by: string | null
          moderated_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealer_id: string
          reference_number?: string | null
          status?: string
          is_featured?: boolean
          featured_until?: string | null
          view_count?: number
          enquiry_count?: number
          offer_count?: number
          sold_at?: string | null
          sold_to_dealer_id?: string | null
          sold_price_eur?: number | null
          moderation_notes?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealer_id?: string
          reference_number?: string | null
          status?: string
          is_featured?: boolean
          featured_until?: string | null
          view_count?: number
          enquiry_count?: number
          offer_count?: number
          sold_at?: string | null
          sold_to_dealer_id?: string | null
          sold_price_eur?: number | null
          moderation_notes?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_details: {
        Row: {
          listing_id: string
          make: string
          model: string
          variant: string | null
          year: number
          registration_number: string | null
          vin_number: string | null
          mileage_km: number
          price_eur: number
          price_type: string
          fuel_type: string
          transmission: string
          body_type: string
          engine_size_cc: number | null
          power_kw: number | null
          power_ps: number | null
          colour: string
          colour_type: string | null
          nct_expiry: string | null
          tax_band: string | null
          annual_tax_eur: number | null
          previous_owners: number
          service_history: string | null
          last_service_date: string | null
          last_service_km: number | null
          condition_description: string | null
          trade_in_suitable: boolean
          needs_prep: boolean
          retail_ready: boolean
          location_county: string
          location_city: string | null
          features: string[]
          warranty_months: number | null
          warranty_description: string | null
          finance_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          listing_id: string
          make: string
          model: string
          variant?: string | null
          year: number
          registration_number?: string | null
          vin_number?: string | null
          mileage_km: number
          price_eur: number
          price_type?: string
          fuel_type: string
          transmission: string
          body_type: string
          engine_size_cc?: number | null
          power_kw?: number | null
          power_ps?: number | null
          colour: string
          colour_type?: string | null
          nct_expiry?: string | null
          tax_band?: string | null
          annual_tax_eur?: number | null
          previous_owners?: number
          service_history?: string | null
          last_service_date?: string | null
          last_service_km?: number | null
          condition_description?: string | null
          trade_in_suitable?: boolean
          needs_prep?: boolean
          retail_ready?: boolean
          location_county: string
          location_city?: string | null
          features?: string[]
          warranty_months?: number | null
          warranty_description?: string | null
          finance_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          listing_id?: string
          make?: string
          model?: string
          variant?: string | null
          year?: number
          registration_number?: string | null
          vin_number?: string | null
          mileage_km?: number
          price_eur?: number
          price_type?: string
          fuel_type?: string
          transmission?: string
          body_type?: string
          engine_size_cc?: number | null
          power_kw?: number | null
          power_ps?: number | null
          colour?: string
          colour_type?: string | null
          nct_expiry?: string | null
          tax_band?: string | null
          annual_tax_eur?: number | null
          previous_owners?: number
          service_history?: string | null
          last_service_date?: string | null
          last_service_km?: number | null
          condition_description?: string | null
          trade_in_suitable?: boolean
          needs_prep?: boolean
          retail_ready?: boolean
          location_county?: string
          location_city?: string | null
          features?: string[]
          warranty_months?: number | null
          warranty_description?: string | null
          finance_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          dealer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          stripe_product_id: string | null
          plan_name: string
          plan_amount_eur: number
          plan_interval: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          stripe_product_id?: string | null
          plan_name: string
          plan_amount_eur: number
          plan_interval?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealer_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          stripe_product_id?: string | null
          plan_name?: string
          plan_amount_eur?: number
          plan_interval?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Additional tables abbreviated for brevity
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
