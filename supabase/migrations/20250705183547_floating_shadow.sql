/*
  # Remove Algorand and Lute integrations

  1. Schema Changes
    - Remove algorand_address column
    - Remove algorand_network column  
    - Remove algorand_app_id column
    - Remove any Lute-related columns
    - Clean up indexes and constraints related to these features

  2. Data Cleanup
    - Remove any existing Algorand data
    - Update object types to remove Algorand-specific types

  3. Security
    - Remove any Algorand-specific policies
    - Maintain existing RLS policies for core functionality
*/

-- Remove Algorand-related columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'algorand_address'
  ) THEN
    ALTER TABLE deployed_objects DROP COLUMN algorand_address;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'algorand_network'
  ) THEN
    ALTER TABLE deployed_objects DROP COLUMN algorand_network;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'algorand_app_id'
  ) THEN
    ALTER TABLE deployed_objects DROP COLUMN algorand_app_id;
  END IF;
END $$;

-- Remove Algorand-related indexes
DROP INDEX IF EXISTS idx_deployed_objects_algorand_address;
DROP INDEX IF EXISTS idx_deployed_objects_algorand_network;

-- Remove Algorand-related constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'deployed_objects' AND constraint_name = 'valid_algorand_address'
  ) THEN
    ALTER TABLE deployed_objects DROP CONSTRAINT valid_algorand_address;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'deployed_objects' AND constraint_name = 'valid_algorand_network'
  ) THEN
    ALTER TABLE deployed_objects DROP CONSTRAINT valid_algorand_network;
  END IF;
END $$;

-- Update object types to remove any Algorand-specific types
UPDATE deployed_objects 
SET object_type = 'ai_agent' 
WHERE object_type LIKE '%algorand%' OR object_type LIKE '%lute%';

-- Update the object type constraint to remove Algorand references
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'deployed_objects' AND constraint_name = 'valid_object_type'
  ) THEN
    ALTER TABLE deployed_objects DROP CONSTRAINT valid_object_type;
  END IF;
END $$;

-- Add updated object type constraint without Algorand/Lute references
ALTER TABLE deployed_objects ADD CONSTRAINT valid_object_type 
CHECK (
  (object_type IS NULL) OR 
  (object_type = ANY (ARRAY[
    'ai_agent'::text, 
    'study_buddy'::text, 
    'tutor'::text, 
    'landmark'::text, 
    'building'::text, 
    'Intelligent Assistant'::text, 
    'Content Creator'::text, 
    'Local Services'::text, 
    'Tutor/Teacher'::text, 
    '3D World Modelling'::text, 
    'Game Agent'::text
  ]))
);

-- Clean up any Lute-related data or configurations
UPDATE deployed_objects 
SET 
  eliza_config = NULL,
  chainlink_config = NULL,
  tokenization_config = NULL
WHERE 
  eliza_config::text LIKE '%lute%' OR 
  chainlink_config::text LIKE '%lute%' OR 
  tokenization_config::text LIKE '%lute%' OR
  eliza_config::text LIKE '%algorand%' OR 
  chainlink_config::text LIKE '%algorand%' OR 
  tokenization_config::text LIKE '%algorand%';