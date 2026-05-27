import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'community_faq_items';

export function translateFaqError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول كـ admin/editor.';
  }
  return message;
}

export async function fetchAllFaqItems() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order');

  if (error) return { data: null, error, offline: false };
  return { data: data ?? [], error: null, offline: false };
}

export async function upsertFaqItem({ id, question, answer, sortOrder, publishStatus }) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const row = {
    question: question.trim(),
    answer: answer.trim(),
    sort_order: sortOrder ?? 0,
    publish_status: publishStatus ?? 'published',
    updated_at: new Date().toISOString(),
  };
  if (id) row.id = id;

  const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' }).select().single();
  if (error) return { data: null, error, offline: false };
  return { data, error: null, offline: false };
}

export async function deleteFaqItem(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error, offline: false };
}
