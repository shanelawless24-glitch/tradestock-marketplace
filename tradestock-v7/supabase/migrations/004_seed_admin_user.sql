-- Seed admin user
-- IMPORTANT: Only run this AFTER creating the auth user in Supabase Dashboard!
-- Replace the UUID with your actual auth user's UUID

-- First, create/update the admin profile
INSERT INTO profiles (id, role, is_active, email, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Replace with your actual auth user UUID
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
  '00000000-0000-0000-0000-000000000001',  -- Replace with your actual auth user UUID
  2,  -- super admin level
  '{"all": true}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  admin_level = 2,
  permissions = '{"all": true}'::jsonb,
  is_active = true;
