import { isSupabaseEnabled } from '../lib/supabaseClient';

/** هل اللوحة تستخدم Supabase بدل localStorage لهذا المجال؟ */
export const useSupabaseBackend = isSupabaseEnabled;
