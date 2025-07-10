/*
  # Add filecoin_cid column to deployed_objects table

  1. Changes
    - Add `filecoin_cid` column to `deployed_objects` table
    - Column type: TEXT (nullable)
    - Used to store Filecoin Content Identifier for agent card storage

  2. Purpose
    - Enables storage of Filecoin CID references for deployed agents
    - Supports the dual IPFS/Filecoin storage architecture
    - Resolves "Could not find the 'filecoin_cid' column" error
*/

-- Add the missing filecoin_cid column
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS filecoin_cid TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN deployed_objects.filecoin_cid IS 'Filecoin Content Identifier for agent card storage';