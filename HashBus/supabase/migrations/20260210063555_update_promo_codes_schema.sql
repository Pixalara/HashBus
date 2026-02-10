/*
  # Update Promo Codes Schema
  
  1. Changes
    - Add is_active boolean column (defaults to true)
    - Add valid_from timestamp column
    - Add valid_until timestamp column
    - Add used_count integer column (defaults to 0)
    - Rename min_amount to min_booking_amount
    - Migrate expires_at data to valid_until
    - Drop expires_at column after migration
  
  2. Notes
    - Existing promo codes will have:
      - is_active set to true
      - valid_from set to created_at
      - valid_until set to expires_at value
      - used_count set to 0
*/

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'valid_from'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN valid_from timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN valid_until timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'used_count'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN used_count integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Migrate data from expires_at to valid_until and set valid_from to created_at
UPDATE promo_codes
SET 
  valid_from = COALESCE(valid_from, created_at),
  valid_until = COALESCE(valid_until, expires_at)
WHERE valid_from IS NULL OR valid_until IS NULL;

-- Rename min_amount to min_booking_amount
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'min_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'min_booking_amount'
  ) THEN
    ALTER TABLE promo_codes RENAME COLUMN min_amount TO min_booking_amount;
  END IF;
END $$;

-- Drop expires_at column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE promo_codes DROP COLUMN expires_at;
  END IF;
END $$;

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' AND column_name = 'description'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN description text;
  END IF;
END $$;