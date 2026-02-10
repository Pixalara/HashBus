/*
  # HashBus Complete Database Schema

  ## New Tables
  
  ### 1. `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `phone` (text, unique)
  - `full_name` (text)
  - `email` (text)
  - `role` (enum: customer, agent, admin)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. `buses`
  - `id` (uuid, primary key)
  - `name` (text)
  - `number` (text, unique)
  - `coach_type` (text, default 'Luxury Sleeper')
  - `total_seats` (integer)
  - `amenities` (jsonb)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. `trips`
  - `id` (uuid, primary key)
  - `bus_id` (uuid, references buses)
  - `from_city` (text)
  - `to_city` (text)
  - `departure_time` (time)
  - `arrival_time` (time)
  - `duration` (text)
  - `base_price` (decimal)
  - `journey_date` (date)
  - `status` (enum: scheduled, ongoing, completed, cancelled)
  - `pickup_points` (jsonb)
  - `drop_points` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `seats`
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `seat_number` (text)
  - `position_row` (integer)
  - `position_col` (integer)
  - `price` (decimal)
  - `status` (enum: available, booked, blocked)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 5. `bookings`
  - `id` (uuid, primary key)
  - `booking_number` (text, unique)
  - `user_id` (uuid, references profiles)
  - `trip_id` (uuid, references trips)
  - `pickup_point` (jsonb)
  - `drop_point` (jsonb)
  - `total_amount` (decimal)
  - `discount_amount` (decimal, default 0)
  - `final_amount` (decimal)
  - `promo_code_id` (uuid, nullable, references promo_codes)
  - `payment_status` (enum: pending, completed, failed, refunded)
  - `booking_status` (enum: confirmed, cancelled)
  - `passengers` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 6. `booking_seats`
  - `id` (uuid, primary key)
  - `booking_id` (uuid, references bookings)
  - `seat_id` (uuid, references seats)
  - `passenger_name` (text)
  - `passenger_age` (integer)
  - `passenger_gender` (text)
  - `created_at` (timestamptz)
  
  ### 7. `promo_codes`
  - `id` (uuid, primary key)
  - `code` (text, unique)
  - `description` (text)
  - `discount_type` (enum: flat, percentage)
  - `discount_value` (decimal)
  - `min_booking_amount` (decimal)
  - `max_discount` (decimal, nullable)
  - `valid_from` (timestamptz)
  - `valid_until` (timestamptz)
  - `usage_limit` (integer, nullable)
  - `used_count` (integer, default 0)
  - `is_active` (boolean, default true)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 8. `promo_usage`
  - `id` (uuid, primary key)
  - `promo_code_id` (uuid, references promo_codes)
  - `user_id` (uuid, references profiles)
  - `booking_id` (uuid, references bookings)
  - `discount_amount` (decimal)
  - `used_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users
  - Admin/agent-only policies for management operations
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE seat_status AS ENUM ('available', 'booked', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('flat', 'percentage');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone text UNIQUE,
  full_name text,
  email text,
  role user_role DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text UNIQUE NOT NULL,
  coach_type text DEFAULT 'Luxury Sleeper',
  total_seats integer NOT NULL,
  amenities jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buses"
  ON buses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and agents can manage buses"
  ON buses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  from_city text NOT NULL,
  to_city text NOT NULL,
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  duration text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  journey_date date NOT NULL,
  status trip_status DEFAULT 'scheduled',
  pickup_points jsonb DEFAULT '[]'::jsonb,
  drop_points jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trips"
  ON trips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and agents can manage trips"
  ON trips FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );

-- Create seats table
CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  position_row integer NOT NULL,
  position_col integer NOT NULL,
  price decimal(10,2) NOT NULL,
  status seat_status DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, seat_number)
);

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available seats"
  ON seats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and agents can manage seats"
  ON seats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type discount_type NOT NULL,
  discount_value decimal(10,2) NOT NULL,
  min_booking_amount decimal(10,2) DEFAULT 0,
  max_discount decimal(10,2),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and agents can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id),
  trip_id uuid REFERENCES trips(id),
  pickup_point jsonb,
  drop_point jsonb,
  total_amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  final_amount decimal(10,2) NOT NULL,
  promo_code_id uuid REFERENCES promo_codes(id),
  payment_status payment_status DEFAULT 'pending',
  booking_status booking_status DEFAULT 'confirmed',
  passengers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and agents can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'agent')
    )
  );

-- Create booking_seats table
CREATE TABLE IF NOT EXISTS booking_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id uuid REFERENCES seats(id),
  passenger_name text NOT NULL,
  passenger_age integer NOT NULL,
  passenger_gender text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own booking seats"
  ON booking_seats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_seats.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create booking seats"
  ON booking_seats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_seats.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Create promo_usage table
CREATE TABLE IF NOT EXISTS promo_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES promo_codes(id),
  user_id uuid REFERENCES profiles(id),
  booking_id uuid REFERENCES bookings(id),
  discount_amount decimal(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE promo_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promo usage"
  ON promo_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create promo usage"
  ON promo_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_journey_date ON trips(journey_date);
CREATE INDEX IF NOT EXISTS idx_trips_from_to ON trips(from_city, to_city);
CREATE INDEX IF NOT EXISTS idx_seats_trip_status ON seats(trip_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_usage(user_id, promo_code_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_buses_updated_at') THEN
    CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trips_updated_at') THEN
    CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_seats_updated_at') THEN
    CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON seats
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_promo_codes_updated_at') THEN
    CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
    CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;