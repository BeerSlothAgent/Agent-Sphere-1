/*
  # Add active status tracking for GeoAgents

  1. Schema Changes
    - Add `is_active` column to track if GeoAgent is currently active
    - This allows AR Viewer to filter only active GeoAgents

  2. Data Updates
    - Set all existing GeoAgents to active by default
    - Future deployments will be active by default

  3. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add is_active column to deployed_objects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Set all existing GeoAgents to active
UPDATE deployed_objects 
SET is_active = true 
WHERE is_active IS NULL;

-- Add index for efficient querying by active status
CREATE INDEX IF NOT EXISTS idx_deployed_objects_active 
ON deployed_objects (is_active);

-- Add composite index for AR Viewer queries (active + precise coordinates)
CREATE INDEX IF NOT EXISTS idx_deployed_objects_ar_query 
ON deployed_objects (is_active, preciselatitude, preciselongitude) 
WHERE is_active = true;