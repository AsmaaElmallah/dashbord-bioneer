import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const FAQ = 'community_faq';
const FEEDBACK = 'community_feedback';
const CLUB_POSTS = 'mothers_club_posts';
const CONSULTATIONS = 'consultation_requests';

const PUBLISH_TO_DB = {
  منشور: 'published',
  published: 'published',
  مسودة: 'draft',
  draft: 'draft',
};

const PUBLISH_FROM_DB = {
  published: 'منشور',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  archived: 'مؤرشف',
};

export function rowToFaq(row) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order ?? 0,
    publishStatus: PUBLISH_FROM_DB[row.publish_status] ?? 'مسودة',
  };
}

export async function fetchCommunityFaq() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };
  const { data, error } = await supabase
    .from(FAQ)
    .select('*')
    .order('sort_order');
  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToFaq), error: null, offline: false };
}

export async function upsertCommunityFaq(item) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const row = {
    id: item.id || undefined,
    question: item.question,
    answer: item.answer,
    sort_order: Number(item.sortOrder) || 0,
    publish_status: PUBLISH_TO_DB[item.publishStatus] ?? 'draft',
  };
  const { error } = await supabase.from(FAQ).upsert(row);
  return { error };
}

export async function publishCommunityFaq(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(FAQ)
    .update({ publish_status: 'published' })
    .eq('id', id);
  return { error };
}

export async function fetchCommunityFeedback(kind) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };
  let q = supabase.from(FEEDBACK).select('*').order('created_at', { ascending: false });
  if (kind) q = q.eq('kind', kind);
  const { data, error } = await q;
  if (error) return { data: null, error, offline: false };
  return { data: data ?? [], error: null, offline: false };
}

export async function fetchConsultationRequests() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };
  const { data, error } = await supabase
    .from(CONSULTATIONS)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error, offline: false };
  return { data: data ?? [], error: null, offline: false };
}

export async function updateConsultationStatus(id, { status, adminNote, scheduledAt }) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const patch = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNote !== undefined) patch.admin_note = adminNote;
  if (scheduledAt !== undefined) patch.scheduled_at = scheduledAt;
  const { error } = await supabase.from(CONSULTATIONS).update(patch).eq('id', id);
  return { error };
}

export async function updateFeedbackReply(id, { adminReply, boardStatus }) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(FEEDBACK)
    .update({
      admin_reply: adminReply,
      board_status: boardStatus ?? 'replied',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error };
}

export async function updateFeedbackBoardStatus(id, boardStatus) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(FEEDBACK)
    .update({
      board_status: boardStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error };
}

export async function fetchClubPosts() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };
  const { data, error } = await supabase
    .from(CLUB_POSTS)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error, offline: false };
  return { data: data ?? [], error: null, offline: false };
}

export async function publishClubPost(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(CLUB_POSTS)
    .update({ publish_status: 'published' })
    .eq('id', id);
  return { error };
}
