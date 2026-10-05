import { DEFAULT_AGE_BAND } from '../../data/libraryAgeBands';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const PAID_TABLE = 'library_paid_books';
const VIDEOS_TABLE = 'library_visual_videos';
const SETTINGS_TABLE = 'app_settings';
export const WHATSAPP_SETTING_KEY = 'library_whatsapp';

function offline() {
  return !isSupabaseEnabled || !supabase;
}

const OFFLINE_ERROR = new Error('Supabase غير مفعّل');

// ---------------------------------------------------------------------------
// Paid books
// ---------------------------------------------------------------------------

export function emptyPaidBookDraft(sortOrder = 0) {
  return {
    id: null,
    ageBand: DEFAULT_AGE_BAND,
    title: '',
    description: '',
    coverUrl: '',
    sortOrder,
    publishStatus: 'published',
  };
}

function rowToPaidBook(row) {
  return {
    id: row.id,
    ageBand: row.age_band ?? DEFAULT_AGE_BAND,
    title: row.title ?? '',
    description: row.description ?? '',
    coverUrl: row.cover_url ?? '',
    sortOrder: row.sort_order ?? 0,
    publishStatus: row.publish_status ?? 'draft',
  };
}

function paidBookToRow(book) {
  return {
    id: book.id || `paid_${Date.now()}`,
    age_band: book.ageBand,
    title: book.title.trim(),
    description: book.description.trim(),
    cover_url: book.coverUrl?.trim() || null,
    sort_order: Number(book.sortOrder) || 0,
    publish_status: book.publishStatus,
  };
}

export function validatePaidBook(book) {
  if (!book.title.trim()) return 'العنوان مطلوب.';
  if (book.publishStatus === 'published' && !book.coverUrl) return 'ارفعي صورة الكتاب قبل النشر.';
  return null;
}

export async function listPaidBooks() {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase.from(PAID_TABLE).select('*').order('sort_order').order('created_at');
  return { data: (data ?? []).map(rowToPaidBook), error };
}

export async function savePaidBook(book) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(PAID_TABLE).upsert(paidBookToRow(book), { onConflict: 'id' });
  return { error };
}

export async function deletePaidBook(id) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(PAID_TABLE).delete().eq('id', id);
  return { error };
}

// ---------------------------------------------------------------------------
// Visual stimulation videos
// ---------------------------------------------------------------------------

export function emptyVisualVideoDraft(sortOrder = 0) {
  return {
    id: null,
    ageBand: DEFAULT_AGE_BAND,
    title: '',
    description: '',
    sourceType: 'youtube',
    youtubeInput: '',
    youtubeVideoId: '',
    videoUrl: '',
    coverUrl: '',
    sortOrder,
    publishStatus: 'published',
  };
}

function rowToVisualVideo(row) {
  const youtubeVideoId = row.youtube_video_id ?? '';
  return {
    id: row.id,
    ageBand: row.age_band ?? DEFAULT_AGE_BAND,
    title: row.title ?? '',
    description: row.description ?? '',
    sourceType: row.video_url && !youtubeVideoId ? 'upload' : 'youtube',
    youtubeInput: youtubeVideoId,
    youtubeVideoId,
    videoUrl: row.video_url ?? '',
    coverUrl: row.cover_url ?? '',
    sortOrder: row.sort_order ?? 0,
    publishStatus: row.publish_status ?? 'draft',
  };
}

function visualVideoToRow(video) {
  const useYoutube = video.sourceType !== 'upload';
  return {
    id: video.id || `visual_${Date.now()}`,
    age_band: video.ageBand,
    title: video.title.trim(),
    description: video.description.trim(),
    youtube_video_id: useYoutube ? video.youtubeVideoId || null : null,
    video_url: useYoutube ? null : video.videoUrl || null,
    cover_url: video.coverUrl?.trim() || null,
    sort_order: Number(video.sortOrder) || 0,
    publish_status: video.publishStatus,
  };
}

export async function listVisualVideos() {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase.from(VIDEOS_TABLE).select('*').order('sort_order').order('created_at');
  return { data: (data ?? []).map(rowToVisualVideo), error };
}

export async function saveVisualVideo(video) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(VIDEOS_TABLE).upsert(visualVideoToRow(video), { onConflict: 'id' });
  return { error };
}

export async function deleteVisualVideo(id) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(VIDEOS_TABLE).delete().eq('id', id);
  return { error };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function loadWhatsappNumber() {
  if (offline()) return { data: '', error: null };
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('value')
    .eq('key', WHATSAPP_SETTING_KEY)
    .maybeSingle();
  return { data: data?.value ?? '', error };
}

export async function saveWhatsappNumber(value) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      { key: WHATSAPP_SETTING_KEY, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
  return { error };
}

export function translateSectionsError(message) {
  const m = message?.toLowerCase() ?? '';
  if (
    (m.includes('library_paid_books') || m.includes('library_visual_videos') || m.includes('app_settings') || m.includes('age_band')) &&
    (m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))
  ) {
    return 'جداول أقسام المكتبة غير موجودة — شغّلي migration 20260526100021_library_age_sections.sql في Supabase SQL Editor.';
  }
  if (m.includes('library_visual_videos_source_check')) {
    return 'أضيفي رابط YouTube أو ارفعي فيديو قبل النشر.';
  }
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي المحاولة.';
  }
  return message;
}
