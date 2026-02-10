/*
  # Add Bus Number and Trip Pickup/Drop Points
  
  1. Changes to `buses` table
    - Add `bus_number` column (text, unique) for bus registration number
    
  2. Changes to `trips` table
    - Add `pickup_points` column (jsonb) for storing array of pickup locations
    - Add `drop_points` column (jsonb) for storing array of drop locations
    
  3. Notes
    - Bus numbers will be displayed alongside bus names
    - Pickup and drop points store location data including name, time, and address
    - Existing trips will have empty arrays for pickup/drop points
*/

-- Add bus_number column to buses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'buses' AND column_name = 'bus_number'
  ) THEN
    ALTER TABLE buses ADD COLUMN bus_number text UNIQUE;
  END IF;
END $$;

-- Add pickup_points and drop_points to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'pickup_points'
  ) THEN
    ALTER TABLE trips ADD COLUMN pickup_points jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'drop_points'
  ) THEN
    ALTER TABLE trips ADD COLUMN drop_points jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;