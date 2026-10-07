import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';
import { WHATSAPP_SETTING_KEY } from './librarySectionsService';

const KEYS = {
  manualEnabled: 'payment_manual_enabled',
  manualInstructions: 'payment_manual_instructions',
  paypalEnabled: 'payment_paypal_enabled',
  whatsapp: WHATSAPP_SETTING_KEY,
};

export const emptyPaymentSettings = {
  manualEnabled: true,
  manualInstructions: '',
  paypalEnabled: false,
  whatsapp: '',
};

export async function loadPaymentSettings() {
  if (!isSupabaseEnabled || !supabase) return { data: emptyPaymentSettings, error: null };
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', Object.values(KEYS));
  if (error) return { data: emptyPaymentSettings, error };
  const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));
  return {
    data: {
      manualEnabled: (byKey[KEYS.manualEnabled] ?? 'true') === 'true',
      manualInstructions: byKey[KEYS.manualInstructions] ?? '',
      paypalEnabled: byKey[KEYS.paypalEnabled] === 'true',
      whatsapp: byKey[KEYS.whatsapp] ?? '',
    },
    error: null,
  };
}

export async function savePaymentSettings(settings) {
  if (!isSupabaseEnabled || !supabase) return { error: new Error('Supabase غير مفعّل') };
  const now = new Date().toISOString();
  const { error } = await supabase.from('app_settings').upsert(
    [
      { key: KEYS.manualEnabled, value: String(!!settings.manualEnabled), updated_at: now },
      { key: KEYS.manualInstructions, value: settings.manualInstructions.trim(), updated_at: now },
      { key: KEYS.paypalEnabled, value: String(!!settings.paypalEnabled), updated_at: now },
      { key: KEYS.whatsapp, value: settings.whatsapp.replace(/\D/g, ''), updated_at: now },
    ],
    { onConflict: 'key' },
  );
  return { error };
}
