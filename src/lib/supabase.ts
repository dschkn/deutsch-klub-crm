import { createClient } from '@supabase/supabase-js';

const dataSource = import.meta.env.VITE_DATA_SOURCE || 'demo';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseRequested = dataSource === 'supabase';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const shouldLoadFromSupabase = isSupabaseRequested && isSupabaseConfigured;

export const supabase = shouldLoadFromSupabase
  ? createClient(supabaseUrl, supabaseKey)
  : null;
