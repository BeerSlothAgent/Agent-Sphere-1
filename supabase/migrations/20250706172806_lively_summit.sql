/*
  # Add NEAR integration fields to deployed_objects table

  1. Schema Changes
    - Add `interaction_fee_usdfc` column for USDFC interaction fees
    - Add `agent_wallet_address` column for agent's blockchain wallet
    - Add `agent_wallet_type` column for wallet type (mynearwallet, evm_wallet, etc.)
    - Add `altitude_rtk` column for RTK-enhanced altitude data
    - Add `currency_type` column to track currency (USDFC vs legacy AURAS)

  2. Data Migration
    - Update existing records to use USDFC currency
    - Set default interaction fees for existing agents

  3. Indexes
    - Add indexes for efficient querying by wallet type and currency
*/

-- Add new columns for NEAR integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'interaction_fee_usdfc'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN interaction_fee_usdfc DECIMAL(10,2) DEFAULT 0.50;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'agent_wallet_address'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN agent_wallet_address VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'agent_wallet_type'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN agent_wallet_type VARCHAR(50);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'altitude_rtk'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN altitude_rtk DOUBLE PRECISION;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'currency_type'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN currency_type VARCHAR(10) DEFAULT 'USDFC';
  END IF;
END $$;

-- Update existing records to use USDFC currency
UPDATE deployed_objects 
SET currency_type = 'USDFC' 
WHERE currency_type IS NULL OR currency_type = 'AURAS';

-- Set default interaction fees for existing agents
UPDATE deployed_objects 
SET interaction_fee_usdfc = 0.50 
WHERE interaction_fee_usdfc IS NULL;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_deployed_objects_wallet_type 
ON deployed_objects (agent_wallet_type) 
WHERE agent_wallet_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_currency 
ON deployed_objects (currency_type);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_interaction_fee 
ON deployed_objects (interaction_fee_usdfc);

-- Add constraint for valid wallet types
ALTER TABLE deployed_objects ADD CONSTRAINT valid_agent_wallet_type 
CHECK (
  (agent_wallet_type IS NULL) OR 
  (agent_wallet_type = ANY (ARRAY[
    'mynearwallet'::text, 
    'evm_wallet'::text, 
    'solana'::text, 
    'flow_wallet'::text
  ]))
);

-- Add constraint for valid currency types
ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type 
CHECK (
  (currency_type IS NULL) OR 
  (currency_type = ANY (ARRAY['USDFC'::text, 'AURAS'::text]))
);

-- Add constraint for valid interaction fees
ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_fee_usdfc 
CHECK (
  (interaction_fee_usdfc IS NULL) OR 
  (interaction_fee_usdfc >= 0)
);