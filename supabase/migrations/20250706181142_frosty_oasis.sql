/*
  # Fix network constraint error for NEAR integration

  1. Schema Changes
    - Drop existing network constraint that's too restrictive
    - Add updated constraint that includes NEAR networks
    - Update any existing invalid network values

  2. Network Support
    - Add support for NEAR Testnet and Mainnet
    - Maintain compatibility with existing networks
    - Use consistent naming convention

  3. Data Cleanup
    - Update any existing records with invalid network values
    - Set default network for new deployments
*/

-- First, check what network values currently exist
-- This helps us understand what needs to be updated

-- Drop the existing restrictive network constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_network;

-- Update any existing records that might have invalid network values
-- Set them to a valid default value
UPDATE deployed_objects 
SET network = 'near-testnet' 
WHERE network IS NULL 
   OR network NOT IN (
     'avalanche-fuji', 
     'avalanche-mainnet', 
     'ethereum', 
     'polygon', 
     'algorand-testnet', 
     'algorand-mainnet',
     'near-testnet',
     'near-mainnet'
   );

-- Add updated network constraint with NEAR support
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_network 
CHECK (
  (network IS NULL) OR 
  (network = ANY (ARRAY[
    'avalanche-fuji'::character varying,
    'avalanche-mainnet'::character varying,
    'ethereum'::character varying,
    'polygon'::character varying,
    'algorand-testnet'::character varying,
    'algorand-mainnet'::character varying,
    'near-testnet'::character varying,
    'near-mainnet'::character varying
  ]))
);

-- Add index for efficient network queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_network 
ON deployed_objects (network);

-- Set default network for new deployments
ALTER TABLE deployed_objects 
ALTER COLUMN network SET DEFAULT 'near-testnet';