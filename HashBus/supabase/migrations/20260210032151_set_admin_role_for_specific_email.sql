/*
  # Auto-assign Admin Role
  
  1. Changes
    - Create trigger function to automatically assign admin role to specific email
    - Assign admin role to dileep.cloudops@gmail.com on profile creation
  
  2. Security
    - Only runs on INSERT to profiles table
    - Checks email match before assigning admin role
*/

-- Create function to auto-assign admin role for specific email
CREATE OR REPLACE FUNCTION auto_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches the admin email
  IF NEW.email = 'dileep.cloudops@gmail.com' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_auto_assign_admin ON profiles;
CREATE TRIGGER trigger_auto_assign_admin
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_role();
