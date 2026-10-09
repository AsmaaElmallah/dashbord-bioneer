import { parseYoutubeVideoId } from '../../data/contentLibraryAdmin';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const SESSIONS_TABLE = 'live_sessions';
const REQUESTS_TABLE = 'live_stage_requests';
const APP_ID_KEY = 'agora_app_id';

const OFFLINE_ERROR = new Error('Supabase غير مفعّل');

function offline() {
  return !isSupabaseEnabled || !supabase;
}

export const liveAccessOptions = [
  { id: 'free', label: 'مجاني لكل الأمهات' },
  { id: 'subscription', label: 'للمشتركات في الباقة' },
  { id: 'course', label: 'لمشتركات دورة معيّنة' },
];

export const liveStatusLabel = { scheduled: 'مجدول', live: 'مباشر الآن', ended: 'انتهى' };

export function liveAccessLabel(id) {
  return liveAccessOptions.find((o) => o.id === id)?.label ?? id;
}

/** "2026-10-08T18:30" for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function emptyLiveDraft() {
  return {
    id: null,
    title: '',
    description: '',
    instructorName: '',
    coverUrl: '',
    accessType: 'subscription',
    courseId: '',
    scheduledAt: '',
    maxStage: 6,
    recordingUrl: '',
    publishStatus: 'published',
    status: 'scheduled',
  };
}

function rowToSession(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    instructorName: row.instructor_name ?? '',
    coverUrl: row.cover_url ?? '',
    accessType: row.access_type ?? 'subscription',
    courseId: row.course_id ?? '',
    scheduledAt: toLocalInput(row.scheduled_at),
    maxStage: row.max_stage ?? 6,
    recordingUrl: row.recording_youtube_id ? `https://youtu.be/${row.recording_youtube_id}` : '',
    publishStatus: row.publish_status ?? 'published',
    status: row.status ?? 'scheduled',
  };
}

export function validateLive(draft) {
  if (!draft.title.trim()) return 'اسم اللايف مطلوب.';
  if (draft.accessType === 'course' && !draft.courseId) return 'اختاري الدورة اللي اللايف تبعها.';
  if (draft.recordingUrl.trim() && !parseYoutubeVideoId(draft.recordingUrl.trim())) {
    return 'رابط التسجيل لازم يكون رابط YouTube.';
  }
  const max = Number(draft.maxStage);
  if (!(max >= 1 && max <= 16)) return 'عدد الأمهات على المسرح من 1 لـ 16.';
  return null;
}

export async function listLiveSessions() {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select('*')
    .order('scheduled_at', { ascending: false, nullsFirst: true });
  return { data: (data ?? []).map(rowToSession), error };
}

export async function saveLiveSession(draft) {
  if (offline()) return { data: null, error: OFFLINE_ERROR };
  const row = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    instructor_name: draft.instructorName.trim(),
    cover_url: draft.coverUrl?.trim() || null,
    access_type: draft.accessType,
    course_id: draft.accessType === 'course' ? draft.courseId : null,
    scheduled_at: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
    max_stage: Number(draft.maxStage) || 6,
    recording_youtube_id: parseYoutubeVideoId(draft.recordingUrl.trim()) || null,
    publish_status: draft.publishStatus,
  };
  const query = draft.id
    ? supabase.from(SESSIONS_TABLE).update(row).eq('id', draft.id)
    : supabase.from(SESSIONS_TABLE).insert(row);
  const { data, error } = await query.select().single();
  return { data: data ? rowToSession(data) : null, error };
}

export async function deleteLiveSession(id) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(SESSIONS_TABLE).delete().eq('id', id);
  return { error };
}

export async function setLiveStatus(id, status) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase.from(SESSIONS_TABLE).update({ status }).eq('id', id);
  if (!error && status === 'ended') {
    await supabase
      .from(REQUESTS_TABLE)
      .update({ status: 'left' })
      .eq('session_id', id)
      .in('status', ['pending', 'approved']);
  }
  return { error };
}

export async function setLiveRecording(id, youtubeVideoId) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase
    .from(SESSIONS_TABLE)
    .update({ recording_youtube_id: youtubeVideoId || null })
    .eq('id', id);
  return { error };
}

export async function listStageRequests(sessionId) {
  if (offline()) return { data: [], error: null };
  const { data, error } = await supabase
    .from(REQUESTS_TABLE)
    .select('user_id, display_name, status, created_at')
    .eq('session_id', sessionId)
    .in('status', ['pending', 'approved'])
    .order('created_at');
  return { data: data ?? [], error };
}

export async function setStageRequestStatus(sessionId, userId, status) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase
    .from(REQUESTS_TABLE)
    .update({ status })
    .eq('session_id', sessionId)
    .eq('user_id', userId);
  return { error };
}

/** Calls back on any change to the stage requests of this session. Returns an unsubscribe function. */
export function watchStageRequests(sessionId, onChange) {
  if (offline()) return () => {};
  const channel = supabase
    .channel(`live_stage_${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: REQUESTS_TABLE, filter: `session_id=eq.${sessionId}` },
      onChange,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function fetchLiveToken(sessionId) {
  if (offline()) return { data: null, error: OFFLINE_ERROR };
  const { data, error } = await supabase.functions.invoke('live-token', { body: { session_id: sessionId } });
  if (error) {
    let code = null;
    try {
      code = (await error.context?.json?.())?.error ?? null;
    } catch {
      code = null;
    }
    return { data: null, error: new Error(translateLiveError(code ?? error.message) ?? 'تعذّر الاتصال بخدمة اللايف') };
  }
  return { data, error: null };
}

export async function loadAgoraAppId() {
  if (offline()) return { data: '', error: null };
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', APP_ID_KEY).maybeSingle();
  return { data: data?.value ?? '', error };
}

export async function saveAgoraAppId(value) {
  if (offline()) return { error: OFFLINE_ERROR };
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: APP_ID_KEY, value: value.trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return { error };
}

export function translateLiveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('agora_not_configured')) return 'حطي Agora App ID في إعدادات اللايف الأول.';
  if (m.includes('live_sessions') && (m.includes('does not exist') || m.includes('schema cache'))) {
    return 'جداول اللايف مش موجودة — شغّلي migration 20260526100026_live_sessions.sql في Supabase.';
  }
  if (m.includes('failed to send a request') || m.includes('function not found')) {
    return 'دالة live-token مش مرفوعة على Supabase لسه.';
  }
  if (m.includes('row-level security') || m.includes('permission denied')) return 'حسابك مالوش صلاحية.';
  return null;
}
