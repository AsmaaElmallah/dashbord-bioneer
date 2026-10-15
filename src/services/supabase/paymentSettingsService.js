import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const PAYPAL_KEY = 'payment_paypal_enabled';

export const emptyPaymentSettings = {
  paypalEnabled: false,
};

export async function loadPaymentSettings() {
  if (!isSupabaseEnabled || !supabase) return { data: emptyPaymentSettings, error: null };
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', PAYPAL_KEY)
    .maybeSingle();
  if (error) return { data: emptyPaymentSettings, error };
  return { data: { paypalEnabled: data?.value === 'true' }, error: null };
}

export async function savePaymentSettings(settings) {
  if (!isSupabaseEnabled || !supabase) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      { key: PAYPAL_KEY, value: String(!!settings.paypalEnabled), updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
  return { error };
}
