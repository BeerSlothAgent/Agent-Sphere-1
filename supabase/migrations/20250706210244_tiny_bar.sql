/*
  # Add notification system support to deployed_objects table

  1. Schema Changes
    - Add `enable_proximity_notifications` column for notification preferences
    - Add `show_on_map` column for map visibility control
    - Add `notification_priority` column for notification importance
    - Add `map_marker_style` column for map marker appearance

  2. Data Updates
    - Set default values for existing agents
    - Enable notifications and map visibility by default

  3. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add notification system columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'enable_proximity_notifications'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN enable_proximity_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'show_on_map'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN show_on_map BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'notification_priority'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN notification_priority VARCHAR(10) DEFAULT 'normal';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'map_marker_style'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN map_marker_style VARCHAR(20) DEFAULT 'standard';
  END IF;
END $$;

-- Update existing records with default notification settings
UPDATE deployed_objects 
SET 
  enable_proximity_notifications = true,
  show_on_map = true,
  notification_priority = 'normal',
  map_marker_style = 'standard'
WHERE 
  enable_proximity_notifications IS NULL 
  OR show_on_map IS NULL 
  OR notification_priority IS NULL 
  OR map_marker_style IS NULL;

-- Add constraints for valid values
ALTER TABLE deployed_objects ADD CONSTRAINT valid_notification_priority 
CHECK (
  (notification_priority IS NULL) OR 
  (notification_priority = ANY (ARRAY['low', 'normal', 'high']))
);

ALTER TABLE deployed_objects ADD CONSTRAINT valid_map_marker_style 
CHECK (
  (map_marker_style IS NULL) OR 
  (map_marker_style = ANY (ARRAY['standard', 'prominent', 'minimal']))
);

-- Add indexes for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_notifications 
ON deployed_objects (enable_proximity_notifications, show_on_map) 
WHERE enable_proximity_notifications = true AND show_on_map = true;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_notification_priority 
ON deployed_objects (notification_priority);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_map_style 
ON deployed_objects (map_marker_style);