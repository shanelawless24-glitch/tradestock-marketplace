-- Create admin user: shanelawless24@gmail.com
-- Password: Duggie.3838
-- Run this in Supabase SQL Editor after creating the auth user

-- Step 1: Create the auth user via Supabase Dashboard
-- Go to: Authentication → Users → Add User
-- Email: shanelawless24@gmail.com
-- Password: Duggie.3838
-- Then copy the UUID and replace below

-- Step 2: Create admin profile (replace USER_UUID with actual UUID from auth)
INSERT INTO profiles (id, role, is_active, email, full_name)
VALUES (
  'USER_UUID_HERE',  -- Replace this with the actual UUID from auth.users
  'admin',
  true,
  'shanelawless24@gmail.com',
  'Shane Lawless'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  full_name = 'Shane Lawless';

-- Step 3: Create admin record (replace USER_UUID with actual UUID from auth)
INSERT INTO admins (id, user_id, admin_level, permissions, is_active)
VALUES (
  gen_random_uuid(),
  'USER_UUID_HERE',  -- Replace this with the actual UUID from auth.users
  2,  -- super admin
  '{"all": true}'::jsonb,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  admin_level = 2,
  permissions = '{"all": true}'::jsonb,
  is_active = true;
