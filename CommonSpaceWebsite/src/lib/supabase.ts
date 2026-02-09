import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key';

// Create a dummy supabase client that won't throw network errors
const dummyClient = createClient('https://dummy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTAwMDAwMCwiZXhwIjoxOTYwMDAwMDAwfQ.dummy');

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : dummyClient;

export const isSupabaseConfigured = isConfigured;

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured – running in LOCAL STORAGE mode. To use Supabase features, get credentials from your team or create a project at https://supabase.com');
}
