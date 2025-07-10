/*
  # Add IPFS and Filecoin storage columns

  1. New Columns
    - `ipfs_hash` (text, nullable) - IPFS hash for agent card storage
    - `filecoin_cid` (text, nullable) - Filecoin Content Identifier for agent card storage

  2. Purpose
    - Enable storage of agent cards on IPFS for distributed access
    - Provide Filecoin CID for long-term data preservation
    - Support the deployment workflow that stores agent metadata on decentralized storage

  3. Notes
    - Both columns are nullable to maintain compatibility with existing records
    - IPFS hash follows standard QmHash format
    - Filecoin CID follows bafybeih format for content addressing
*/

-- Add IPFS hash column for agent card storage
ALTER TABLE public.deployed_objects 
ADD COLUMN IF NOT EXISTS ipfs_hash TEXT;

-- Add Filecoin CID column for agent card storage  
ALTER TABLE public.deployed_objects 
ADD COLUMN IF NOT EXISTS filecoin_cid TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN public.deployed_objects.ipfs_hash IS 'IPFS hash for agent card storage and distributed access';
COMMENT ON COLUMN public.deployed_objects.filecoin_cid IS 'Filecoin Content Identifier for agent card storage and long-term preservation';