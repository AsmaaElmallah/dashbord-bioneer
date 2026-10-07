import { parseYoutubeVideoId } from '../../data/contentLibraryAdmin';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const COURSES_TABLE = 'courses';
const LESSONS_TABLE = 'course_lessons';
const ENROLLMENTS_TABLE = 'course_enrollments';
const VIDEO_BUCKET = 'course-videos';

/** حد الباقة المجانية في Supabase لحجم الملف الواحد. */
export const COURSE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const COURSE_VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-m4v';

export const courseAccessOptions = [
  { id: 'free', label: 'مجانية' },
  { id: 'subscription', label: 'ضمن الباقة' },
  { id: 'paid', label: 'مدفوعة (تتشتري لوحدها)' },
];

export const coursePublishOptions = [
  { id: 'draft', label: 'مسودة' },
  { id: 'published', label: 'منشور' },
  { id: 'archived', label: 'مؤرشف' },
];

export function accessLabel(id) {
  return courseAccessOptions.find((o) => o.id === id)?.label ?? id;
}

export function coursePublishLabel(id) {
  return coursePublishOptions.find((o) => o.id === id)?.label ?? id;
}

const OFFLINE_ERROR = new Error('Supabase غير مفعّل');

function offline() {
  return !isSupabaseEnabled || !supabase;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export function emptyCourseDraft(sortOrder = 0) {
  return {
    id: null,
    title: '',
    subtitle: '',
    description: '',
    instructorName: '',
    coverUrl: '',
    accessType: 'free',
    priceLabel: '',
    priceUsd: '',
    storeProductIdAndroid: '',
    storeProductIdIos: '',
    sortOrder,
    publishStatus: 'published',
  };
}

function rowToCourse(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    instructorName: row.instructor_name ?? '',
    coverUrl: row.cover_url ?? '',
    accessType: row.access_type ?? 'free',
    priceLabel: row.price_label ?? '',
    priceUsd: row.price_usd ?? '',
    storeProductIdAndroid: row.store_product_id_android ?? '',
    storeProductIdIos: row.store_product_id_ios ?? '',
    sortOrder: row.sort_order ?? 0,
    publishStatus: row.publish_status ?? 'draft',
  };
}

function courseToRow(course) {
  return {
    id: course.id || `course_${Date.now()}`,
    title: course.title.trim(),
    subtitle: course.subtitle.trim(),
    description: course.description.trim(),
    instructor_name: course.instructorName.trim(),
    cover_url: course.coverUrl?.trim() || null,
    access_type: course.accessType,
    price_label: course.priceLabel.trim(),
    price_usd: String(course.priceUsd ?? '').trim() === '' ? null : Number(course.priceUsd),
    store_product_id_android: course.storeProductIdAndroid?.trim() || null,
    store_product_id_ios: course.storeProductIdIos?.trim() || null,
    sort_order: Number(course.sortOrder) || 0,
    publish_status: course.publishStatus,
  };
}

export function validateCourse(course) {
  if (!course.title.trim()) return 'اسم الدورة مطلوب.';
  if (course.publishStatus === 'published' && !course.coverUrl) return 'ارفعي صورة للدورة قبل النشر.';
  return null;
}

export async function listCourses() {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase
    .from(COURSES_TABLE)
    .select('*, course_lessons(count)')
    .order('sort_order')
    .order('created_at');
  return {
    data: (data ?? []).map((row) => ({
      ...rowToCourse(row),
      lessonCount: row.course_lessons?.[0]?.count ?? 0,
    })),
    error,
  };
}

export async function saveCourse(course) {
  if (offline()) return { data: null, error: OFFLINE_ERROR };
  const { data, error } = await supabase
    .from(COURSES_TABLE)
    .upsert(courseToRow(course), { onConflict: 'id' })
    .select()
    .single();
  return { data: data ? rowToCourse(data) : null, error };
}

export async function deleteCourse(courseId) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { data: lessons } = await supabase
    .from(LESSONS_TABLE)
    .select('video_path')
    .eq('course_id', courseId);
  const { error } = await supabase.from(COURSES_TABLE).delete().eq('id', courseId);
  const paths = (lessons ?? []).map((l) => l.video_path).filter(Boolean);
  if (!error && paths.length) {
    await supabase.storage.from(VIDEO_BUCKET).remove(paths);
  }
  return { error };
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export function emptyLessonDraft(courseId, sortOrder = 0) {
  return {
    id: null,
    courseId,
    title: '',
    description: '',
    sourceType: 'upload',
    videoPath: '',
    videoSizeBytes: null,
    youtubeInput: '',
    youtubeVideoId: '',
    durationMinutes: '',
    isPreview: false,
    sortOrder,
    publishStatus: 'published',
  };
}

function rowToLesson(row) {
  const youtubeVideoId = row.youtube_video_id ?? '';
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title ?? '',
    description: row.description ?? '',
    sourceType: row.video_path || !youtubeVideoId ? 'upload' : 'youtube',
    videoPath: row.video_path ?? '',
    videoSizeBytes: null,
    youtubeInput: youtubeVideoId,
    youtubeVideoId,
    durationMinutes: row.duration_seconds ? String(Math.round(row.duration_seconds / 60)) : '',
    isPreview: row.is_preview ?? false,
    sortOrder: row.sort_order ?? 0,
    publishStatus: row.publish_status ?? 'draft',
  };
}

function lessonToRow(lesson) {
  const useYoutube = lesson.sourceType === 'youtube';
  const minutes = Number.parseFloat(lesson.durationMinutes);
  return {
    id: lesson.id || `lesson_${Date.now()}`,
    course_id: lesson.courseId,
    title: lesson.title.trim(),
    description: lesson.description.trim(),
    video_path: useYoutube ? null : lesson.videoPath || null,
    youtube_video_id: useYoutube ? lesson.youtubeVideoId || null : null,
    duration_seconds: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : null,
    is_preview: Boolean(lesson.isPreview),
    sort_order: Number(lesson.sortOrder) || 0,
    publish_status: lesson.publishStatus,
  };
}

/** يرجّع الدرس بعد تحويل رابط YouTube لـ videoId، أو رسالة خطأ. */
export function prepareLesson(lesson) {
  if (!lesson.title.trim()) return { error: 'عنوان الدرس مطلوب.' };
  let next = lesson;
  if (lesson.sourceType === 'youtube') {
    const videoId = parseYoutubeVideoId(lesson.youtubeInput) || lesson.youtubeVideoId;
    if (lesson.youtubeInput.trim() && !videoId) return { error: 'رابط YouTube غير صحيح.' };
    next = { ...lesson, youtubeVideoId: videoId || '' };
    if (lesson.publishStatus === 'published' && !videoId) {
      return { error: 'حطي رابط YouTube قبل النشر.' };
    }
  } else if (lesson.publishStatus === 'published' && !lesson.videoPath) {
    return { error: 'ارفعي فيديو الدرس قبل النشر.' };
  }
  return { lesson: next };
}

export async function listLessons(courseId) {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase
    .from(LESSONS_TABLE)
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order')
    .order('created_at');
  return { data: (data ?? []).map(rowToLesson), error };
}

export async function saveLesson(lesson) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(LESSONS_TABLE).upsert(lessonToRow(lesson), { onConflict: 'id' });
  return { error };
}

export async function deleteLesson(lesson) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(LESSONS_TABLE).delete().eq('id', lesson.id);
  if (!error && lesson.videoPath) {
    await supabase.storage.from(VIDEO_BUCKET).remove([lesson.videoPath]);
  }
  return { error };
}

export async function uploadCourseVideo(courseId, file) {
  if (offline()) return { data: null, error: OFFLINE_ERROR };
  const path = `${courseId}/${Date.now()}_${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'video/mp4',
  });
  if (error) return { data: null, error };
  return { data: { path, size: file.size }, error: null };
}

export async function removeCourseVideo(path) {
  if (offline() || !path) return;
  await supabase.storage.from(VIDEO_BUCKET).remove([path]);
}

export async function signedCourseVideoUrl(path) {
  if (offline() || !path) return null;
  const { data } = await supabase.storage.from(VIDEO_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// ---------------------------------------------------------------------------
// Enrollments (فتح دورة مدفوعة لأم يدوياً)
// ---------------------------------------------------------------------------

export async function listEnrollments(courseId) {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase.rpc('admin_course_enrollments', { p_course_id: courseId });
  return {
    data: (data ?? []).map((e) => ({
      userId: e.user_id,
      email: e.email ?? '',
      name: e.display_name ?? '',
      source: e.source,
      createdAt: e.created_at,
    })),
    error,
  };
}

export async function grantCourseByEmail(courseId, email) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.rpc('admin_grant_course', {
    p_course_id: courseId,
    p_email: email.trim(),
  });
  return { error };
}

export async function revokeCourse(courseId, userId) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase
    .from(ENROLLMENTS_TABLE)
    .delete()
    .eq('course_id', courseId)
    .eq('user_id', userId);
  return { error };
}

export function translateCoursesError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('not_found_user')) return 'مفيش حساب بالإيميل ده في التطبيق.';
  if (m.includes('admin_grant_course') || m.includes('admin_course_enrollments')) {
    return 'دوال الدورات غير موجودة — شغّلي migration 20260526100022_courses.sql في Supabase SQL Editor.';
  }
  if (
    (m.includes('courses') || m.includes('course_lessons') || m.includes('course_enrollments')) &&
    (m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))
  ) {
    return 'جداول الدورات غير موجودة — شغّلي migration 20260526100022_courses.sql في Supabase SQL Editor.';
  }
  if (m.includes('bucket not found')) {
    return 'مكان فيديوهات الدورات غير موجود — شغّلي migration 20260526100022_courses.sql أولاً.';
  }
  if (m.includes('course_lessons_source_check')) return 'ارفعي فيديو أو حطي رابط YouTube قبل النشر.';
  if (m.includes('exceeded') || m.includes('too large') || m.includes('payload')) {
    return 'الفيديو أكبر من 50 ميجا — اضغطيه (HandBrake) أو استخدمي رابط YouTube.';
  }
  if (m.includes('mime') || m.includes('invalid_mime_type')) return 'نوع الملف غير مسموح — MP4 أو WEBM أو MOV.';
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('unauthorized')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي المحاولة.';
  return message;
}
