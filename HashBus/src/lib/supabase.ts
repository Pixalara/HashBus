import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          full_name: string | null;
          email: string | null;
          role: 'customer' | 'agent' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: 'customer' | 'agent' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: 'customer' | 'agent' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      buses: {
        Row: {
          id: string;
          name: string;
          number: string;
          coach_type: string;
          total_seats: number;
          amenities: any;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      trips: {
        Row: {
          id: string;
          bus_id: string;
          from_city: string;
          to_city: string;
          departure_time: string;
          arrival_time: string;
          duration: string;
          base_price: number;
          journey_date: string;
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          pickup_points: any;
          drop_points: any;
          created_at: string;
          updated_at: string;
        };
      };
      seats: {
        Row: {
          id: string;
          trip_id: string;
          seat_number: string;
          position_row: number;
          position_col: number;
          price: number;
          status: 'available' | 'booked' | 'blocked';
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          user_id: string;
          trip_id: string;
          pickup_point: any;
          drop_point: any;
          total_amount: number;
          discount_amount: number;
          final_amount: number;
          promo_code_id: string | null;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          booking_status: 'confirmed' | 'cancelled';
          passengers: any;
          created_at: string;
          updated_at: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'flat' | 'percentage';
          discount_value: number;
          min_booking_amount: number;
          max_discount: number | null;
          valid_from: string;
          valid_until: string;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      promo_usage: {
        Row: {
          id: string;
          promo_code_id: string;
          user_id: string;
          booking_id: string;
          discount_amount: number;
          used_at: string;
        };
      };
    };
  };
};
