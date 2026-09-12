-- 1. Create a default organization if it doesn't exist
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization')
ON CONFLICT (id) DO NOTHING;

-- 2. Backfill profiles for all existing users that lack one
INSERT INTO public.profiles (id, organization_id, full_name, role)
SELECT id, '00000000-0000-0000-0000-000000000000', email, 'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. Create a trigger to automate this for all future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles using a default org
  INSERT INTO public.profiles (id, organization_id, full_name, role)
  VALUES (new.id, '00000000-0000-0000-0000-000000000000', new.email, 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
