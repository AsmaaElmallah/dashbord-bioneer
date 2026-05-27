import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const POSTS_TABLE = 'mothers_club_posts';
const CATEGORIES_TABLE = 'mothers_club_categories';
const CLUB_MEDIA_BUCKET = 'club-media';

export const PUBLISH_STATUS_LABEL = {
  published: 'منشور',
  review: 'يحتاج مراجعة',
  archived: 'مخفي',
  draft: 'مسودة',
};

export const PUBLISH_STATUS_TONE = {
  published: 'success',
  review: 'warning',
  archived: 'muted',
  draft: 'info',
};

export function rowToClubPost(row) {
  return {
    id: row.id,
    author: row.author_display_name ?? '—',
    tag: row.tag ?? '',
    title: row.title ?? '',
    body: row.body ?? '',
    categoryId: row.category_id,
    imageStoragePath: row.image_storage_path,
    likes: row.like_count ?? 0,
    comments: row.comment_count ?? 0,
    status: PUBLISH_STATUS_LABEL[row.publish_status] ?? row.publish_status,
    publishStatus: row.publish_status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
  };
}

export function translateMothersClubError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول كـ admin/editor.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي المحاولة.';
  }
  return message;
}

export async function fetchAllClubPosts() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToClubPost), error: null, offline: false };
}

export async function fetchClubCategories() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .select('*')
    .order('sort_order');

  if (error) return { data: null, error, offline: false };
  return { data: data ?? [], error: null, offline: false };
}

export async function updateClubPostStatus(id, publishStatus) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const patch = {
    publish_status: publishStatus,
    updated_at: new Date().toISOString(),
  };
  if (publishStatus === 'published') {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error, offline: false };
  return { data: data ? rowToClubPost(data) : null, error: null, offline: false };
}

export async function upsertStaffClubPost({
  id,
  title,
  body,
  tag,
  categoryId,
  authorDisplayName,
  publishStatus = 'published',
  imageStoragePath,
}) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const row = {
    title: title.trim(),
    body: body.trim(),
    tag: tag?.trim() || null,
    category_id: categoryId || null,
    author_display_name: authorDisplayName?.trim() || 'فريق بيانور',
    publish_status: publishStatus,
    updated_at: new Date().toISOString(),
  };

  if (imageStoragePath) {
    row.image_storage_path = imageStoragePath;
  }

  if (publishStatus === 'published') {
    row.published_at = new Date().toISOString();
  }

  if (id) {
    row.id = id;
  }

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) return { data: null, error, offline: false };
  return { data: data ? rowToClubPost(data) : null, error: null, offline: false };
}

export async function deleteClubPost(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(POSTS_TABLE).delete().eq('id', id);
  return { error, offline: false };
}

export async function uploadClubPostImage(file, postId) {
  if (!isSupabaseEnabled || !supabase) {
    return { path: null, error: null, offline: true };
  }

  const f = file?.rawFile ?? file;
  if (!f?.name) {
    return { path: null, error: new Error('اختر صورة'), offline: false };
  }

  const ext = f.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `posts/staff/${postId ?? crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(CLUB_MEDIA_BUCKET).upload(path, f, {
    upsert: true,
    contentType: f.type || 'image/jpeg',
  });

  if (error) return { path: null, error, offline: false };
  return { path, error: null, offline: false };
}

export async function getClubImageSignedUrl(path) {
  if (!isSupabaseEnabled || !path) return null;
  const { data } = await supabase.storage.from(CLUB_MEDIA_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
