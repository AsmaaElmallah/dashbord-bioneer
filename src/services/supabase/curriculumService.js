import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'curriculum_slides';
const BUCKET = 'slide-media';

/** مسارات مربوطة بـ Supabase في المرحلة 1 */
export const CURRICULUM_CLOUD_TRACKS = new Set(['math', 'visual', 'emotional']);

const STATUS_KEY = {
  موجود: 'ok',
  ناقص: 'missing',
  'يحتاج مراجعة': 'review',
  مسودة: 'draft',
};

function fileExt(name, fallback) {
  return name?.split('.').pop()?.toLowerCase() ?? fallback;
}

export function rowToCurriculumSlide(row) {
  return {
    id: row.id,
    lesson: row.lesson_number,
    globalIndex: row.global_index,
    slideIndex: row.slide_index,
    dayIndexInLesson: row.day_index_in_lesson,
    packageId: row.package_id,
    title: row.title,
    assetPath: row.legacy_image_path ?? '',
    audioPath: row.legacy_audio_path ?? '',
    imageStoragePath: row.image_storage_path,
    audioStoragePath: row.audio_storage_path,
    durationSec: row.duration_sec,
    imageStatus: row.image_status,
    audioStatus: row.audio_status,
    mediaUploadMode: row.media_upload_mode ?? 'separate',
    publishStatus: row.publish_status,
    cloudSaved: Boolean(row.image_storage_path || row.audio_storage_path),
    imageFile: row.legacy_image_path || row.image_storage_path
      ? {
          name: row.legacy_image_path?.split('/').pop() ?? 'slide.png',
          sizeMock: '—',
          notUploaded: !row.image_storage_path,
          uploaded: Boolean(row.image_storage_path),
        }
      : null,
    audioFile: row.legacy_audio_path || row.audio_storage_path
      ? {
          name: row.legacy_audio_path?.split('/').pop() ?? 'slide.m4a',
          sizeMock: '—',
          notUploaded: !row.audio_storage_path,
          uploaded: Boolean(row.audio_storage_path),
        }
      : null,
  };
}

export function curriculumSlideToRow(slide, trackId) {
  return {
    id: slide.id,
    track_id: trackId,
    lesson_number: slide.lesson,
    global_index: slide.globalIndex,
    slide_index: slide.slideIndex,
    day_index_in_lesson: slide.dayIndexInLesson ?? 1,
    package_id: slide.packageId ?? null,
    title: slide.title ?? `شريحة ${slide.slideIndex}`,
    legacy_image_path: slide.assetPath || null,
    legacy_audio_path: slide.audioPath || null,
    image_storage_path: slide.imageStoragePath ?? null,
    audio_storage_path: slide.audioStoragePath ?? null,
    duration_sec: slide.durationSec ?? 45,
    image_status: slide.imageStatus ?? 'ناقص',
    audio_status: slide.audioStatus ?? 'ناقص',
    image_status_key: STATUS_KEY[slide.imageStatus] ?? 'missing',
    audio_status_key: STATUS_KEY[slide.audioStatus] ?? 'missing',
    media_upload_mode: slide.mediaUploadMode ?? 'separate',
    publish_status: slide.publishStatus ?? 'draft',
  };
}

export function translateCurriculumSaveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية للحفظ — سجّلي الدخول وتأكدي أن دورك admin أو editor.';
  }
  if (m.includes('duplicate key') || m.includes('unique constraint')) {
    return 'رقم الشريحة العالمي مستخدم مسبقاً في هذا المسار.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي الحفظ.';
  }
  return message;
}

export async function fetchCurriculumSlides(trackId) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('track_id', trackId)
    .order('lesson_number')
    .order('global_index');

  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToCurriculumSlide), error: null, offline: false };
}

export async function upsertCurriculumSlide(row) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' }).select().single();
  if (error) return { data: null, error, offline: false };
  return { data: data ? rowToCurriculumSlide(data) : null, error: null, offline: false };
}

export async function deleteCurriculumSlide(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error, offline: false };
}

async function uploadSlideFile(fileOrMeta, path, contentType) {
  const file = fileOrMeta?.rawFile ?? fileOrMeta;
  if (!file?.name) {
    return { path: null, error: new Error('لا يوجد ملف للرفع.') };
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: contentType || file.type,
  });

  if (error) return { path: null, error };
  return { path, error: null };
}

export async function uploadSlideImage(fileOrMeta, { trackId, slideId }) {
  if (!isSupabaseEnabled || !supabase) {
    return { path: null, error: null, offline: true };
  }
  const file = fileOrMeta?.rawFile ?? fileOrMeta;
  const ext = fileExt(file?.name, 'png');
  const path = `${trackId}/${slideId}/image.${ext}`;
  return uploadSlideFile(fileOrMeta, path, file?.type || 'image/png');
}

export async function uploadSlideAudio(fileOrMeta, { trackId, slideId }) {
  if (!isSupabaseEnabled || !supabase) {
    return { path: null, error: null, offline: true };
  }
  const file = fileOrMeta?.rawFile ?? fileOrMeta;
  const ext = fileExt(file?.name, 'm4a');
  const path = `${trackId}/${slideId}/audio.${ext}`;
  const type =
    file?.type ||
    (ext === 'm4a' ? 'audio/mp4' : ext === 'mp3' ? 'audio/mpeg' : 'audio/mpeg');
  return uploadSlideFile(fileOrMeta, path, type);
}

/** رفع صورة و/أو صوت ثم إرجاع الشريحة المحدّثة */
export async function uploadSlideMedia(slide, trackId) {
  let next = { ...slide };

  if (slide.imageFile?.rawFile) {
    const img = await uploadSlideImage(slide.imageFile, { trackId, slideId: slide.id });
    if (img.error) return { slide: null, error: img.error };
    if (img.path) {
      next = {
        ...next,
        imageStoragePath: img.path,
        imageStatus: 'موجود',
      };
    }
  }

  if (slide.audioFile?.rawFile) {
    const aud = await uploadSlideAudio(slide.audioFile, { trackId, slideId: slide.id });
    if (aud.error) return { slide: null, error: aud.error };
    if (aud.path) {
      next = {
        ...next,
        audioStoragePath: aud.path,
        audioStatus: 'موجود',
      };
    }
  }

  return { slide: next, error: null };
}
