-- Migration to add flat_code support for multi-tenancy
-- This allows students from different flats to only see their own data

-- 1. Add flat_code column to profiles table (if it doesn't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flat_code TEXT;

-- 2. Add flat_code to all data tables
ALTER TABLE cleaning_tasks ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE cleaning_schedule ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE bulletin_postits ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE bulletin_drawings ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE bulletin_text ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS flat_code TEXT;
ALTER TABLE settlements ADD COLUMN IF NOT EXISTS flat_code TEXT;

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_flat_code ON cleaning_tasks(flat_code);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedule_flat_code ON cleaning_schedule(flat_code);
CREATE INDEX IF NOT EXISTS idx_shopping_list_flat_code ON shopping_list(flat_code);
CREATE INDEX IF NOT EXISTS idx_bulletin_postits_flat_code ON bulletin_postits(flat_code);
CREATE INDEX IF NOT EXISTS idx_bulletin_drawings_flat_code ON bulletin_drawings(flat_code);
CREATE INDEX IF NOT EXISTS idx_bulletin_text_flat_code ON bulletin_text(flat_code);
CREATE INDEX IF NOT EXISTS idx_expenses_flat_code ON expenses(flat_code);
CREATE INDEX IF NOT EXISTS idx_settlements_flat_code ON settlements(flat_code);
CREATE INDEX IF NOT EXISTS idx_profiles_flat_code ON profiles(flat_code);

-- 4. Add Row Level Security (RLS) policies to ensure users only see their flat's data
-- Enable RLS on all tables
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_postits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Create policies for cleaning_tasks
DROP POLICY IF EXISTS "Users can view tasks from their flat" ON cleaning_tasks;
CREATE POLICY "Users can view tasks from their flat" ON cleaning_tasks
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert tasks for their flat" ON cleaning_tasks;
CREATE POLICY "Users can insert tasks for their flat" ON cleaning_tasks
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update tasks from their flat" ON cleaning_tasks;
CREATE POLICY "Users can update tasks from their flat" ON cleaning_tasks
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete tasks from their flat" ON cleaning_tasks;
CREATE POLICY "Users can delete tasks from their flat" ON cleaning_tasks
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Create similar policies for other tables
-- Cleaning Schedule
DROP POLICY IF EXISTS "Users can view schedule from their flat" ON cleaning_schedule;
CREATE POLICY "Users can view schedule from their flat" ON cleaning_schedule
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert schedule for their flat" ON cleaning_schedule;
CREATE POLICY "Users can insert schedule for their flat" ON cleaning_schedule
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update schedule from their flat" ON cleaning_schedule;
CREATE POLICY "Users can update schedule from their flat" ON cleaning_schedule
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete schedule from their flat" ON cleaning_schedule;
CREATE POLICY "Users can delete schedule from their flat" ON cleaning_schedule
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Shopping List
DROP POLICY IF EXISTS "Users can view shopping from their flat" ON shopping_list;
CREATE POLICY "Users can view shopping from their flat" ON shopping_list
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert shopping for their flat" ON shopping_list;
CREATE POLICY "Users can insert shopping for their flat" ON shopping_list
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update shopping from their flat" ON shopping_list;
CREATE POLICY "Users can update shopping from their flat" ON shopping_list
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete shopping from their flat" ON shopping_list;
CREATE POLICY "Users can delete shopping from their flat" ON shopping_list
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Bulletin Post-its
DROP POLICY IF EXISTS "Users can view postits from their flat" ON bulletin_postits;
CREATE POLICY "Users can view postits from their flat" ON bulletin_postits
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert postits for their flat" ON bulletin_postits;
CREATE POLICY "Users can insert postits for their flat" ON bulletin_postits
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update postits from their flat" ON bulletin_postits;
CREATE POLICY "Users can update postits from their flat" ON bulletin_postits
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete postits from their flat" ON bulletin_postits;
CREATE POLICY "Users can delete postits from their flat" ON bulletin_postits
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Bulletin Drawings
DROP POLICY IF EXISTS "Users can view drawings from their flat" ON bulletin_drawings;
CREATE POLICY "Users can view drawings from their flat" ON bulletin_drawings
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert drawings for their flat" ON bulletin_drawings;
CREATE POLICY "Users can insert drawings for their flat" ON bulletin_drawings
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete drawings from their flat" ON bulletin_drawings;
CREATE POLICY "Users can delete drawings from their flat" ON bulletin_drawings
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Bulletin Text
DROP POLICY IF EXISTS "Users can view text from their flat" ON bulletin_text;
CREATE POLICY "Users can view text from their flat" ON bulletin_text
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert text for their flat" ON bulletin_text;
CREATE POLICY "Users can insert text for their flat" ON bulletin_text
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update text from their flat" ON bulletin_text;
CREATE POLICY "Users can update text from their flat" ON bulletin_text
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete text from their flat" ON bulletin_text;
CREATE POLICY "Users can delete text from their flat" ON bulletin_text
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Expenses
DROP POLICY IF EXISTS "Users can view expenses from their flat" ON expenses;
CREATE POLICY "Users can view expenses from their flat" ON expenses
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert expenses for their flat" ON expenses;
CREATE POLICY "Users can insert expenses for their flat" ON expenses
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update expenses from their flat" ON expenses;
CREATE POLICY "Users can update expenses from their flat" ON expenses
  FOR UPDATE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete expenses from their flat" ON expenses;
CREATE POLICY "Users can delete expenses from their flat" ON expenses
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- Settlements
DROP POLICY IF EXISTS "Users can view settlements from their flat" ON settlements;
CREATE POLICY "Users can view settlements from their flat" ON settlements
  FOR SELECT USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert settlements for their flat" ON settlements;
CREATE POLICY "Users can insert settlements for their flat" ON settlements
  FOR INSERT WITH CHECK (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete settlements from their flat" ON settlements;
CREATE POLICY "Users can delete settlements from their flat" ON settlements
  FOR DELETE USING (
    flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid())
  );

-- 5. Create a function to automatically set flat_code on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, flat_code)
  VALUES (new.id, NULL);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Note: Users will need to set their flat_code after registration
-- This can be done through the profile update functionality
