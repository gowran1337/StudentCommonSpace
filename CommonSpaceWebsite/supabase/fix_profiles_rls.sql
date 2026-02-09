-- ============================================
-- Ta bort ALLA 6 existerande policies explicit
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same flat" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in same flat" ON profiles;
DROP POLICY IF EXISTS "own_profile_all" ON profiles;
DROP POLICY IF EXISTS "same_flat_select" ON profiles;
DROP POLICY IF EXISTS "admin_flat_update" ON profiles;

-- STEG 3: Skapa hjälpfunktioner (SECURITY DEFINER = kör utan RLS)
CREATE OR REPLACE FUNCTION get_my_flat_code()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT flat_code FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION am_i_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) FROM profiles WHERE id = auth.uid();
$$;

-- STEG 4: Aktivera RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEG 5: Skapa nya policies

-- Användare kan göra allt med sin egen profil
CREATE POLICY "own_profile_all"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Användare kan SE profiler med samma flat_code
CREATE POLICY "same_flat_select"
  ON profiles FOR SELECT
  USING (
    flat_code IS NOT NULL
    AND flat_code = get_my_flat_code()
  );

-- Admin kan UPPDATERA profiler i samma lägenhet (t.ex. ta bort medlem)
CREATE POLICY "admin_flat_update"
  ON profiles FOR UPDATE
  USING (
    flat_code IS NOT NULL
    AND flat_code = get_my_flat_code()
    AND am_i_admin()
  )
  WITH CHECK (true);

-- Verifiera resultatet
SELECT policyname, permissive, cmd FROM pg_policies WHERE tablename = 'profiles';
