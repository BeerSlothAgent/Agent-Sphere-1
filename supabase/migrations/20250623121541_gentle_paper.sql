/*
  # Create deployed_objects table

  1. New Tables
    - `deployed_objects`
      - `id` (uuid, primary key)
      - `user_id` (text, not null) - stores wallet address
      - `object_type` (text, not null) - stores object type (cube, sphere, etc.)
      - `latitude` (double precision, not null) - object latitude
      - `longitude` (double precision, not null) - object longitude
      - `altitude` (double precision, nullable) - object altitude
      - `created_at` (timestamptz, not null) - creation timestamp

  2. Security
    - Enable RLS on `deployed_objects` table
    - Add policy for users to read all deployed objects
    - Add policy for users to insert their own objects
    - Add policy for users to update their own objects
    - Add policy for users to delete their own objects
*/

CREATE TABLE IF NOT EXISTS deployed_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  object_type text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  altitude double precision,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;

-- Allow all users to read deployed objects (for map visualization)
CREATE POLICY "Anyone can read deployed objects"
  ON deployed_objects
  FOR SELECT
  TO public
  USING (true);

-- Allow users to insert objects with their own user_id
CREATE POLICY "Users can insert their own objects"
  ON deployed_objects
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to update their own objects
CREATE POLICY "Users can update their own objects"
  ON deployed_objects
  FOR UPDATE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own objects
CREATE POLICY "Users can delete their own objects"
  ON deployed_objects
  FOR DELETE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');