/*
  # Add object names to deployed_objects table

  1. Schema Changes
    - Add `name` column to `deployed_objects` table
    - Add `description` column for additional object details
    - Update existing objects with generated names

  2. Data Updates
    - Generate names for existing objects (Cube 1, Cube 2, etc.)
    - Ensure all objects have meaningful names

  3. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add name and description columns to deployed_objects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'name'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'description'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN description text;
  END IF;
END $$;

-- Update existing objects with generated names
DO $$
DECLARE
    cube_count INTEGER := 1;
    sphere_count INTEGER := 1;
    pyramid_count INTEGER := 1;
    obj RECORD;
BEGIN
    -- Loop through existing objects and assign names
    FOR obj IN 
        SELECT id, object_type 
        FROM deployed_objects 
        WHERE name IS NULL 
        ORDER BY created_at ASC
    LOOP
        CASE obj.object_type
            WHEN 'cube' THEN
                UPDATE deployed_objects 
                SET name = 'Cube ' || cube_count,
                    description = 'A 3D cube object deployed in AR space'
                WHERE id = obj.id;
                cube_count := cube_count + 1;
            
            WHEN 'sphere' THEN
                UPDATE deployed_objects 
                SET name = 'Sphere ' || sphere_count,
                    description = 'A 3D spherical object deployed in AR space'
                WHERE id = obj.id;
                sphere_count := sphere_count + 1;
            
            WHEN 'pyramid' THEN
                UPDATE deployed_objects 
                SET name = 'Pyramid ' || pyramid_count,
                    description = 'A 3D pyramid object deployed in AR space'
                WHERE id = obj.id;
                pyramid_count := pyramid_count + 1;
            
            ELSE
                UPDATE deployed_objects 
                SET name = 'Object ' || obj.object_type,
                    description = 'A 3D object deployed in AR space'
                WHERE id = obj.id;
        END CASE;
    END LOOP;
END $$;

-- Set default values for future objects (this will be handled in the application)
-- The application will generate names automatically when creating new objects