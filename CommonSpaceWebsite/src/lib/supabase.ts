import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key-here') {
    console.warn('⚠️ Supabase not configured. Please add your Supabase credentials to .env file.');
    console.warn('The app will work in localStorage-only mode for now.');
    // Create a dummy client that won't throw errors
    supabase = createClient('https://dummy.supabase.co', 'dummy-key');
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
