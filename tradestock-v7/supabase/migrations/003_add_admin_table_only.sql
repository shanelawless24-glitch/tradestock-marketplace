-- Add admins table only (run this after 001_init.sql is already applied)
-- This migration is safe to run multiple times

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  admin_level INTEGER NOT NULL DEFAULT 1,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'admins' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "Admins can read own record" ON admins;
DROP POLICY IF EXISTS "Only service role can manage admins" ON admins;

CREATE POLICY "Admins can read own record" ON admins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only service role can manage admins" ON admins
  FOR ALL USING (false);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_admins_updated_at();
