import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'curriculum_slides';
const BUCKET = 'slide-media';

const STATUS_TO_KEY = {
  موجود: 'ok',
  ناقص: 'missing',
  'يحتاج مراجعة': 'review',
  مسودة: 'draft',
};

const KEY_TO_STATUS = {
  ok: 'موجود',
  missing: 'ناقص',
  review: 'يحتاج مراجعة',
  draft: 'مسودة',
};

const PUBLISH_TO_DB = {
  منشور: 'published',
  published: 'published',
  مسودة: 'draft',
  draft: 'draft',
  'قيد المراجعة': 'review',
  review: 'review',
  مؤرشف: 'archived',
  archived: 'archived',
};

const PUBLISH_FROM_DB = {
  published: 'منشور',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  archived: 'مؤرشف',
};

export function rowToAdminSlide(row) {
  return {
    id: row.id,
    lesson: row.lesson_number,
    globalIndex: row.global_index,
    slideIndex: row.slide_index,
    dayIndexInLesson: row.day_index_in_lesson,
    packageId: row.package_id,
    title: row.title,
    assetPath: row.legacy_image_path,
    audioPath: row.legacy_audio_path,
    imageStoragePath: row.image_storage_path,
    audioStoragePath: row.audio_storage_path,
    durationSec: row.duration_sec ?? 45,
    imageStatus: row.image_status ?? KEY_TO_STATUS[row.image_status_key] ?? 'ناقص',
    audioStatus: row.audio_status ?? KEY_TO_STATUS[row.audio_status_key] ?? 'ناقص',
    publishStatus: PUBLISH_FROM_DB[row.publish_status] ?? 'مسودة',
    imageFile: row.image_storage_path
      ? { name: row.image_storage_path.split('/').pop(), uploaded: true, notUploaded: false }
      : null,
    audioFile: row.audio_storage_path
      ? { name: row.audio_storage_path.split('/').pop(), uploaded: true, notUploaded: false }
      : null,
  };
}

export function adminSlideToRow(slide, trackId) {
  return {
    id: slide.id,
    track_id: trackId,
    lesson_number: slide.lesson,
    global_index: slide.globalIndex,
    slide_index: slide.slideIndex,
    day_index_in_lesson: slide.dayIndexInLesson,
    package_id: slide.packageId ?? null,
    title: slide.title ?? null,
    legacy_image_path: slide.assetPath ?? null,
    legacy_audio_path: slide.audioPath ?? null,
    image_storage_path: slide.imageStoragePath ?? null,
    audio_storage_path: slide.audioStoragePath ?? null,
    duration_sec: Number(slide.durationSec) || 45,
    image_status: slide.imageStatus ?? 'ناقص',
    audio_status: slide.audioStatus ?? 'ناقص',
    image_status_key: STATUS_TO_KEY[slide.imageStatus] ?? 'missing',
    audio_status_key: STATUS_TO_KEY[slide.audioStatus] ?? 'missing',
    publish_status: PUBLISH_TO_DB[slide.publishStatus] ?? 'draft',
  };
}

export async function fetchSlidesForTrack(trackId) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('track_id', trackId)
    .order('lesson_number')
    .order('global_index');

  if (error) return { data: null, error, offline: false };
  return {
    data: (data ?? []).map(rowToAdminSlide),
    error: null,
    offline: false,
  };
}

export async function upsertCurriculumSlide(slide, trackId) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const row = adminSlideToRow(slide, trackId);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  return {
    data: data ? rowToAdminSlide(data) : null,
    error,
    offline: false,
  };
}

export async function deleteCurriculumSlide(id) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error, offline: false };
}

export async function uploadSlideMedia(fileOrMeta, { trackId, slideId, kind }) {
  if (!isSupabaseEnabled || !supabase) {
    return { path: null, error: null, offline: true };
  }

  const file = fileOrMeta?.rawFile ?? fileOrMeta;
  if (!file?.name) {
    return { path: null, error: new Error('لا يوجد ملف للرفع'), offline: false };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? (kind === 'audio' ? 'm4a' : 'png');
  const path = `${trackId}/${slideId}/${kind}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || (kind === 'audio' ? 'audio/mp4' : 'image/png'),
  });

  if (error) return { path: null, error, offline: false };
  return { path, error: null, offline: false };
}

export function translateCurriculumError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission')) {
    return 'لا صلاحية — سجّلي الدخول كـ admin/editor.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي الحفظ.';
  }
  return message;
}
