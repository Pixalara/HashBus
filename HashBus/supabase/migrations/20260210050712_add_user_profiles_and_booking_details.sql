/*
  # Add User Profiles and Booking Details

  1. New Tables
    - `user_profiles` - Store user profile information
      - id, user_id, name, phone, email, gender, timestamps

  2. Modifications to `bookings` table
    - Add booking_reference column (unique identifier)
    - Add passenger details columns (name, phone, email, gender)
    - Add seats (jsonb array)
    - Add pickup and drop points
    - Add payment_status
    - Add booking_date and journey_date
    - Add bus_id reference

  3. Security
    - Enable RLS on user_profiles
    - Users can view, insert, and update their own profile
    - Users can view and create their own bookings
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add new columns to bookings table
DO $$
BEGIN
  -- Add bus_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'bus_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN bus_id uuid REFERENCES buses(id) ON DELETE SET NULL;
  END IF;

  -- Add booking_reference if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_reference text;
  END IF;

  -- Add passenger details columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passenger_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passenger_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passenger_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passenger_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passenger_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passenger_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passenger_gender'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passenger_gender text;
  END IF;

  -- Add seats column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'seats'
  ) THEN
    ALTER TABLE bookings ADD COLUMN seats jsonb DEFAULT '[]';
  END IF;

  -- Add pickup and drop points
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_point'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pickup_point text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'drop_point'
  ) THEN
    ALTER TABLE bookings ADD COLUMN drop_point text;
  END IF;

  -- Add payment_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));
  END IF;

  -- Add booking_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_date timestamptz DEFAULT now();
  END IF;

  -- Add journey_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'journey_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN journey_date date;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_journey_date ON bookings(journey_date);
CREATE INDEX IF NOT EXISTS idx_bookings_bus_id ON bookings(bus_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;