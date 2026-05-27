import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

export const isSupabaseConfigured = Boolean(url && anonKey);
export const isSupabaseEnabled = isSupabaseConfigured && useSupabase;

/** عميل Supabase — null إذا غير مفعّل */
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
