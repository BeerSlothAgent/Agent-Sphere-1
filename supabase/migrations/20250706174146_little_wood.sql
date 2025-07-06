/*
  # Add interaction types column to deployed_objects table

  1. Schema Changes
    - Add `interaction_types` column to store array of interaction methods
    - Update existing records with default text_chat interaction

  2. Data Updates
    - Set default interaction types for existing agents
    - Ensure all agents have at least text_chat enabled

  3. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add interaction_types column to deployed_objects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'interaction_types'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN interaction_types TEXT[] DEFAULT ARRAY['text_chat'];
  END IF;
END $$;

-- Update existing records to have default interaction types
UPDATE deployed_objects 
SET interaction_types = ARRAY['text_chat'] 
WHERE interaction_types IS NULL OR array_length(interaction_types, 1) IS NULL;

-- Add index for efficient querying by interaction types
CREATE INDEX IF NOT EXISTS idx_deployed_objects_interaction_types 
ON deployed_objects USING GIN (interaction_types);

-- Add constraint to ensure valid interaction types
ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_types 
CHECK (
  (interaction_types IS NULL) OR 
  (interaction_types <@ ARRAY['text_chat', 'voice_interface', 'video_interface'])
);