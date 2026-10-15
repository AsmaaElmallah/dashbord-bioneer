import { libraryAgeBands } from '../../data/libraryAgeBands';
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

const OLD_CLUB_CATEGORY_IDS = ['sleep', 'feeding', 'play'];

export function clubAgeLabel(id) {
  return libraryAgeBands.find((b) => b.id === id)?.label ?? '';
}

export async function ensureClubAgeCategories() {
  if (!isSupabaseEnabled || !supabase) return { error: null };
  const rows = libraryAgeBands.map((b, i) => ({
    id: b.id,
    label: b.label,
    icon_key: 'child_care',
    sort_order: i + 1,
    publish_status: 'published',
  }));
  const { error: upsertError } = await supabase.from('mothers_club_categories').upsert(rows, { onConflict: 'id' });
  if (upsertError) return { error: upsertError };
  const { error } = await supabase.from('mothers_club_categories').delete().in('id', OLD_CLUB_CATEGORY_IDS);
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

export async function upsertClubPost({ title, body, categoryId, groupId, pinned = false }) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  const { error } = await supabase.from(CLUB_POSTS).insert({
    title: title.trim(),
    body: body.trim(),
    category_id: groupId ? null : categoryId || null,
    group_id: groupId || null,
    is_pinned: pinned,
    publish_status: 'published',
    author_id: user?.id ?? null,
    author_display_name: 'فريق بيانور',
  });
  return { error };
}

// ---------------------------------------------------------------------------
// جروبات النادي
// ---------------------------------------------------------------------------
const CLUB_GROUPS = 'mothers_club_groups';

export async function fetchClubGroups() {
  if (!isSupabaseEnabled) return { data: [], error: null };
  const { data, error } = await supabase
    .from(CLUB_GROUPS)
    .select('*')
    .order('sort_order')
    .order('created_at');
  return { data: data ?? [], error };
}

export async function saveClubGroup(group) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const row = {
    title: group.title.trim(),
    description: (group.description ?? '').trim(),
    icon_key: group.iconKey || 'people',
    course_id: group.courseId || null,
    info_note: (group.infoNote ?? '').trim(),
    sort_order: Number(group.sortOrder) || 0,
    publish_status: group.published ? 'published' : 'draft',
  };
  const query = group.id
    ? supabase.from(CLUB_GROUPS).update(row).eq('id', group.id)
    : supabase.from(CLUB_GROUPS).insert(row);
  const { error } = await query;
  return { error };
}

export async function deleteClubGroup(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from(CLUB_GROUPS).delete().eq('id', id);
  return { error };
}

/** Rejected posts stay visible only to their author as «ماتنشرش». */
export async function rejectClubPost(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(CLUB_POSTS)
    .update({ publish_status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

export async function deleteClubPost(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from(CLUB_POSTS).delete().eq('id', id);
  return { error };
}

export async function fetchClubComments(postId) {
  if (!isSupabaseEnabled) return { data: [], error: null };
  const { data, error } = await supabase
    .from('mothers_club_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at');
  return { data: data ?? [], error };
}

export function clubImageUrl(path) {
  if (!path || !supabase) return null;
  if (path.startsWith('http')) return path;
  return supabase.storage.from('club-media').getPublicUrl(path).data?.publicUrl ?? null;
}

export async function setClubPostPinned(id, pinned) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(CLUB_POSTS)
    .update({ is_pinned: pinned, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

/** Reply shown to mothers with the «رد الأخصائية ✓» badge. */
export async function addExpertReply(postId, body, displayName = 'أخصائية بيانور') {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) return { error: new Error('سجّلي دخول الداشبورد الأول') };
  const { error } = await supabase.from('mothers_club_comments').insert({
    post_id: postId,
    author_id: user.id,
    author_display_name: displayName.trim() || 'أخصائية بيانور',
    body: body.trim(),
    is_expert: true,
  });
  return { error };
}

/** Real names for anonymous posts (admins only). */
export async function fetchProfileNames(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!isSupabaseEnabled || ids.length === 0) return {};
  const { data } = await supabase.from('profiles').select('id, display_name').in('id', ids);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.display_name]));
}

export async function fetchClubReports() {
  if (!isSupabaseEnabled) return { data: [], error: null };
  const { data, error } = await supabase
    .from('mothers_club_reports')
    .select(
      'id, reason, status, created_at, post_id, comment_id, mothers_club_posts(id, title, body, author_display_name), mothers_club_comments(id, body, author_display_name, post_id)',
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function resolveClubReport(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from('mothers_club_reports').update({ status: 'resolved' }).eq('id', id);
  return { error };
}

export async function deleteClubComment(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from('mothers_club_comments').delete().eq('id', id);
  return { error };
}

export async function setClubPostCategory(id, categoryId) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(CLUB_POSTS)
    .update({ category_id: categoryId || null, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

export async function publishClubPost(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(CLUB_POSTS)
    .update({ publish_status: 'published' })
    .eq('id', id);
  return { error };
}
