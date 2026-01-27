-- Initial Supabase Setup for Student Common Space
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    flat_code TEXT NOT NULL,
    profile_picture TEXT DEFAULT '😀',
    quote TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, flat_code)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'flat_code', 'DEFAULT'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create other tables with flat_code
CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name TEXT NOT NULL,
    assigned_to TEXT,
    completed BOOLEAN DEFAULT FALSE,
    flat_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    purchased BOOLEAN DEFAULT FALSE,
    flat_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bulletin_postits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    color TEXT DEFAULT 'yellow',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    flat_code TEXT NOT NULL,
    created_by UUID REFERENCES auth.users,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_by UUID REFERENCES auth.users,
    flat_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS on all tables
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_postits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for flat_code isolation
CREATE POLICY "Users can view their flat's cleaning tasks"
    ON cleaning_tasks FOR SELECT
    USING (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their flat's cleaning tasks"
    ON cleaning_tasks FOR INSERT
    WITH CHECK (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their flat's shopping list"
    ON shopping_list FOR SELECT
    USING (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their flat's shopping items"
    ON shopping_list FOR INSERT
    WITH CHECK (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their flat's bulletin posts"
    ON bulletin_postits FOR SELECT
    USING (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their flat's bulletin posts"
    ON bulletin_postits FOR INSERT
    WITH CHECK (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their flat's expenses"
    ON expenses FOR SELECT
    USING (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their flat's expenses"
    ON expenses FOR INSERT
    WITH CHECK (flat_code = (SELECT flat_code FROM profiles WHERE id = auth.uid()));

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_flat_code ON profiles(flat_code);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_flat_code ON cleaning_tasks(flat_code);
CREATE INDEX IF NOT EXISTS idx_shopping_list_flat_code ON shopping_list(flat_code);
CREATE INDEX IF NOT EXISTS idx_bulletin_postits_flat_code ON bulletin_postits(flat_code);
CREATE INDEX IF NOT EXISTS idx_expenses_flat_code ON expenses(flat_code);
