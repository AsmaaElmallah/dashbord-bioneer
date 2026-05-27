import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'quran_sessions';
const BUCKET = 'quran-audio';

export function rowToAdminSession(row) {
  return {
    id: row.id,
    khatmah: row.khatmah,
    session: row.session_number,
    dayIndex: row.day_index,
    sessionInDay: row.session_in_day,
    dailySessions: row.daily_sessions,
    hizb: row.hizb,
    half: row.half,
    title: row.title,
    surahRange: row.surah_range,
    file: row.file_name,
    audioPath: row.legacy_asset_path ?? row.storage_path,
    storagePath: row.storage_path,
    durationMinutes: row.duration_minutes,
    status: row.status,
    statusKey: row.status_key,
    publishStatus: row.publish_status,
    cloudSaved: Boolean(row.storage_path),
    audioFile: row.file_name
      ? {
          name: row.file_name,
          sizeMock: '—',
          notUploaded: !row.storage_path,
          uploaded: Boolean(row.storage_path),
        }
      : null,
  };
}

export function adminSessionToRow(session) {
  return {
    id: session.id,
    khatmah: session.khatmah,
    session_number: session.session,
    day_index: session.dayIndex,
    session_in_day: session.sessionInDay,
    daily_sessions: session.dailySessions,
    hizb: session.hizb,
    half: session.half,
    title: session.title,
    surah_range: session.surahRange,
    file_name: session.file ?? session.audioFile?.name ?? null,
    storage_path: session.storagePath ?? null,
    legacy_asset_path: session.audioPath ?? null,
    duration_minutes: session.durationMinutes ?? 15,
    status: session.status ?? 'ناقص',
    status_key: session.statusKey ?? 'missing',
    reciter_id: 'ahmed_khader',
    publish_status: session.publishStatus ?? 'draft',
  };
}

export async function fetchAllQuranSessions() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('khatmah')
    .order('session_number');

  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToAdminSession), error: null, offline: false };
}

export function translateQuranSaveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية للحفظ — سجّلي الدخول وتأكدي أن دورك admin أو editor في profiles.';
  }
  if (m.includes('duplicate key') || m.includes('unique constraint')) {
    return 'رقم الجلسة مستخدم مسبقاً في هذه الختمة — اختاري جلسة من الجدول وارفعي الصوت عليها.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول من الشريط العلوي ثم أعيدي الحفظ.';
  }
  return message;
}

export async function upsertQuranSession(row) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' }).select().single();
  if (error) return { data: null, error, offline: false };
  return { data: data ? rowToAdminSession(data) : null, error: null, offline: false };
}

export async function deleteQuranSession(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error, offline: false };
}

/**
 * رفع mp3/m4a إلى Storage
 * @returns {{ path: string, publicUrl: string | null, error: Error | null }}
 */
export async function uploadQuranAudio(fileOrMeta, { reciterId = 'ahmed_khader', sessionNumber }) {
  if (!isSupabaseEnabled || !supabase) {
    return { path: null, publicUrl: null, error: null, offline: true };
  }

  const file = fileOrMeta?.rawFile ?? fileOrMeta;
  if (!file?.name) {
    return { path: null, publicUrl: null, error: new Error('لا يوجد ملف صوت للرفع.'), offline: false };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
  const padded = String(sessionNumber).padStart(3, '0');
  const path = `${reciterId}/half_hizb/session_${padded}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'audio/mpeg',
  });

  if (error) return { path: null, publicUrl: null, error, offline: false };

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);

  return {
    path,
    publicUrl: signed?.signedUrl ?? null,
    error: null,
    offline: false,
  };
}
