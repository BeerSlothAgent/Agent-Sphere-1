/*
  # Add precise coordinate columns to deployed_objects table

  1. Schema Changes
    - Add `preciseLatitude` column (double precision, nullable)
    - Add `preciseLongitude` column (double precision, nullable) 
    - Add `preciseAltitude` column (double precision, nullable)
    - Add `accuracy` column (double precision, nullable)
    - Add `correctionApplied` column (boolean, default false)

  2. Data Migration
    - Copy existing latitude/longitude data to precise columns for backward compatibility
    - Set correctionApplied to false for existing records

  3. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add precise coordinate columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'preciseLatitude'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN preciseLatitude double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'preciseLongitude'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN preciseLongitude double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'preciseAltitude'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN preciseAltitude double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'accuracy'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN accuracy double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'correctionApplied'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN correctionApplied boolean DEFAULT false;
  END IF;
END $$;

-- Migrate existing data to precise columns for backward compatibility
UPDATE deployed_objects 
SET 
  preciseLatitude = latitude,
  preciseLongitude = longitude,
  preciseAltitude = altitude,
  accuracy = 10.0, -- Assume 10m accuracy for existing GPS data
  correctionApplied = false
WHERE preciseLatitude IS NULL OR preciseLongitude IS NULL;

-- Add index for efficient querying by precise coordinates
CREATE INDEX IF NOT EXISTS idx_deployed_objects_precise_coords 
ON deployed_objects (preciseLatitude, preciseLongitude);

-- Add index for querying by correction status
CREATE INDEX IF NOT EXISTS idx_deployed_objects_correction_applied 
ON deployed_objects (correctionApplied);