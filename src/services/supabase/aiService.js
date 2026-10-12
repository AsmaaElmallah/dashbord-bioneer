import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const KEYS = {
  enabled: 'ai_enabled',
  provider: 'ai_provider',
  model: 'ai_model',
  dailyLimit: 'ai_daily_limit',
  globalLimit: 'ai_global_daily_limit',
  emergencyPhone: 'ai_emergency_phone',
};

export const aiProviders = [
  { id: 'gemini', label: 'Google Gemini (مجاني)', models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] },
  { id: 'claude', label: 'Anthropic Claude (مدفوع)', models: ['claude-haiku-4-5', 'claude-sonnet-4-5'] },
];

export const knowledgeCategories = [
  { id: 'sleep', label: 'النوم' },
  { id: 'feeding', label: 'الأكل والرضاعة' },
  { id: 'motor', label: 'الحركة والمهارات' },
  { id: 'language', label: 'الكلام واللغة' },
  { id: 'social', label: 'المشاعر والتواصل' },
  { id: 'health', label: 'الصحة' },
  { id: 'safety', label: 'الأمان' },
  { id: 'play', label: 'اللعب والشاشات' },
  { id: 'general', label: 'عام' },
];

export const emptyAiSettings = {
  enabled: true,
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  dailyLimit: 20,
  globalLimit: 200,
  emergencyPhone: '',
};

const notReady = () => ({ data: null, error: new Error('Supabase غير مفعّل') });

export async function loadAiSettings() {
  if (!isSupabaseEnabled || !supabase) return { data: emptyAiSettings, error: null };
  const { data, error } = await supabase.from('app_settings').select('key, value').in('key', Object.values(KEYS));
  if (error) return { data: emptyAiSettings, error };
  const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));
  return {
    data: {
      enabled: (byKey[KEYS.enabled] ?? 'true') !== 'false',
      provider: byKey[KEYS.provider] === 'claude' ? 'claude' : 'gemini',
      model: byKey[KEYS.model] || emptyAiSettings.model,
      dailyLimit: Number(byKey[KEYS.dailyLimit]) || emptyAiSettings.dailyLimit,
      globalLimit: Number(byKey[KEYS.globalLimit]) || emptyAiSettings.globalLimit,
      emergencyPhone: byKey[KEYS.emergencyPhone] ?? '',
    },
    error: null,
  };
}

export async function saveAiSettings(s) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const now = new Date().toISOString();
  const { error } = await supabase.from('app_settings').upsert(
    [
      { key: KEYS.enabled, value: String(!!s.enabled), updated_at: now },
      { key: KEYS.provider, value: s.provider, updated_at: now },
      { key: KEYS.model, value: s.model.trim(), updated_at: now },
      { key: KEYS.dailyLimit, value: String(Math.max(1, Number(s.dailyLimit) || 20)), updated_at: now },
      { key: KEYS.globalLimit, value: String(Math.max(1, Number(s.globalLimit) || 200)), updated_at: now },
      { key: KEYS.emergencyPhone, value: s.emergencyPhone.replace(/[^\d+]/g, ''), updated_at: now },
    ],
    { onConflict: 'key' },
  );
  return { error };
}

/** Usage for the last 7 days (UTC, same as the database). */
export async function fetchAiUsage() {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const since = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('ai_usage')
    .select('user_id, day, messages_count, plans_count')
    .gte('day', since);
  if (error) return { data: null, error };
  const rows = data ?? [];
  const todayRows = rows.filter((r) => r.day === today);
  const sum = (list, key) => list.reduce((acc, r) => acc + (r[key] ?? 0), 0);
  return {
    data: {
      todayMessages: sum(todayRows, 'messages_count'),
      todayPlans: sum(todayRows, 'plans_count'),
      todayUsers: todayRows.length,
      weekMessages: sum(rows, 'messages_count'),
      weekUsers: new Set(rows.map((r) => r.user_id)).size,
    },
    error: null,
  };
}

export async function fetchAiBadFeedback() {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from('ai_feedback')
    .select('message_id, user_id, rating, reason, question, answer, created_at')
    .eq('rating', -1)
    .order('created_at', { ascending: false })
    .limit(100);
  return { data: data ?? [], error };
}

export async function deleteAiFeedback(messageId, userId) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const { error } = await supabase.from('ai_feedback').delete().eq('message_id', messageId).eq('user_id', userId);
  return { error };
}

export async function fetchKnowledge() {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null };
  const [rows, pending] = await Promise.all([
    supabase
      .from('ai_knowledge')
      .select('id, title, content, age_bands, category, source_name, source_url, publish_status, updated_at')
      .order('updated_at', { ascending: false }),
    supabase.from('ai_knowledge').select('id').is('embedding', null),
  ]);
  if (rows.error) return { data: [], error: rows.error };
  const pendingIds = new Set((pending.data ?? []).map((r) => r.id));
  return {
    data: (rows.data ?? []).map((r) => ({ ...r, needsIndex: pendingIds.has(r.id) })),
    error: null,
  };
}

export async function upsertKnowledge(item) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const payload = {
    title: item.title.trim(),
    content: item.content.trim(),
    age_bands: item.age_bands?.length ? item.age_bands : ['all'],
    category: item.category,
    source_name: item.source_name.trim(),
    source_url: item.source_url?.trim() || null,
    publish_status: item.publish_status,
  };
  const query = item.id
    ? supabase.from('ai_knowledge').update(payload).eq('id', item.id)
    : supabase.from('ai_knowledge').insert(payload);
  const { error } = await query;
  return { error };
}

export async function deleteKnowledge(id) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const { error } = await supabase.from('ai_knowledge').delete().eq('id', id);
  return { error };
}

export const timelineKinds = [
  { id: 'vaccine', label: 'تطعيم' },
  { id: 'development', label: 'مهارة' },
  { id: 'feeding', label: 'أكل' },
];

export async function fetchTimeline() {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from('baby_timeline')
    .select('id, kind, age_days, title, body, tips, source_name, source_url, publish_status')
    .order('age_days');
  return { data: data ?? [], error };
}

export async function upsertTimeline(item) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const payload = {
    kind: item.kind,
    age_days: Math.max(0, Math.round(Number(item.age_days) || 0)),
    title: item.title.trim(),
    body: item.body.trim(),
    tips: item.tipsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean),
    source_name: item.source_name.trim(),
    source_url: item.source_url?.trim() || null,
    publish_status: item.publish_status,
  };
  const query = item.id
    ? supabase.from('baby_timeline').update(payload).eq('id', item.id)
    : supabase.from('baby_timeline').insert(payload);
  const { error } = await query;
  return { error };
}

export async function deleteTimeline(id) {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const { error } = await supabase.from('baby_timeline').delete().eq('id', id);
  return { error };
}

/** Builds the search index (Gemini embeddings) for new/edited references. */
export async function indexKnowledge() {
  if (!isSupabaseEnabled || !supabase) return notReady();
  const { data, error } = await supabase.functions.invoke('ai-assistant', { body: { action: 'embed_knowledge' } });
  return { data, error };
}
