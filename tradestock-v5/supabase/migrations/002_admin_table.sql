-- Admin table creation (run this after 001_init.sql)
-- Or run this separately if you already deployed

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  admin_level INTEGER NOT NULL DEFAULT 1,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read own record" ON admins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only service role can manage admins" ON admins
  FOR ALL USING (false);

-- Create index
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed admin user (only works if auth user exists)
-- First, create the admin profile
INSERT INTO profiles (id, role, is_active, email, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  true,
  'shanelawless24@gmail.com',
  'Shane Lawless'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  full_name = 'Shane Lawless';

-- Then, create the admin record
INSERT INTO admins (id, user_id, admin_level, permissions, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-000000000001',
  2,
  '{"all": true}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  admin_level = 2,
  permissions = '{"all": true}'::jsonb,
  is_active = true;
