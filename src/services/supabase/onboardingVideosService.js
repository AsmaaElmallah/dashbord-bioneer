import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'onboarding_videos';
const BUCKET = 'onboarding-videos';
const SLOT_COUNT = 7;

const PUBLISH_FROM_DB = {
  published: 'منشور',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  archived: 'مؤرشف',
};

function rowToSlot(row) {
  const youtubeVideoId = row.youtube_video_id ?? '';
  return {
    slot: row.slot,
    title: row.title ?? `فيديو التعريف ${row.slot}`,
    videoUrl: row.video_url ?? '',
    storagePath: row.storage_path ?? '',
    youtubeVideoId,
    sourceType: youtubeVideoId ? 'youtube' : 'upload',
    youtubeInput: youtubeVideoId,
    publishStatus: PUBLISH_FROM_DB[row.publish_status] ?? 'مسودة',
    published: row.publish_status === 'published',
  };
}

function emptySlots() {
  return Array.from({ length: SLOT_COUNT }, (_, i) => ({
    slot: i + 1,
    title: `فيديو التعريف ${i + 1}`,
    videoUrl: '',
    storagePath: '',
    youtubeVideoId: '',
    sourceType: 'upload',
    youtubeInput: '',
    publishStatus: 'مسودة',
    published: false,
  }));
}

/** Source actually used by the app for this slot. */
export function slotHasVideo(slot) {
  return slot.sourceType === 'youtube' ? Boolean(slot.youtubeVideoId) : Boolean(slot.videoUrl);
}

export function mergeOnboardingSlots(rows) {
  const bySlot = Object.fromEntries((rows ?? []).map((r) => [r.slot, rowToSlot(r)]));
  return emptySlots().map((slot) => bySlot[slot.slot] ?? slot);
}

export async function loadOnboardingVideos() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: emptySlots(), error: null, offline: true };
  }
  const { data, error } = await supabase.from(TABLE).select('*').order('slot');
  if (error) return { data: emptySlots(), error, offline: false };
  return { data: mergeOnboardingSlots(data), error: null, offline: false };
}

export async function uploadOnboardingVideo(slot, file) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase غير مفعّل') };
  }
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `slot_${slot}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'video/mp4',
  });
  if (error) return { data: null, error };
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { data: { url: data.publicUrl, path }, error: null };
}

export async function saveOnboardingSlot(slot) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل'), offline: true };
  }
  const useYoutube = slot.sourceType === 'youtube';
  const { error } = await supabase.from(TABLE).upsert(
    {
      slot: slot.slot,
      title: slot.title?.trim() || `فيديو التعريف ${slot.slot}`,
      video_url: useYoutube ? null : slot.videoUrl || null,
      storage_path: useYoutube ? null : slot.storagePath || null,
      youtube_video_id: useYoutube ? slot.youtubeVideoId || null : null,
      publish_status: slot.published && slotHasVideo(slot) ? 'published' : 'draft',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slot' },
  );
  return { error, offline: false };
}

export function translateOnboardingError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('youtube_video_id')) {
    return 'عمود رابط YouTube غير موجود — شغّلي migration 20260526100020_onboarding_videos_youtube.sql في Supabase SQL Editor.';
  }
  if (m.includes('onboarding_videos') && (m.includes('does not exist') || m.includes('schema cache'))) {
    return 'جدول فيديوهات التعريف غير موجود — شغّلي migration 20260526100019_onboarding_videos.sql في Supabase SQL Editor.';
  }
  if (m.includes('bucket not found') || m.includes('onboarding-videos')) {
    return 'مخزن فيديوهات التعريف غير موجود — شغّلي نفس الـ migration في SQL Editor.';
  }
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor.';
  }
  if (m.includes('exceeded the maximum allowed size') || m.includes('payload too large')) {
    return 'حجم الفيديو أكبر من حد Supabase (50 ميجا في الخطة المجانية) — استخدمي "رابط YouTube" للفيديوهات الطويلة.';
  }
  return message;
}
