const PREFIX = 'bayanour_admin_';

export const ADMIN_STORAGE_KEYS = {
  contentLibrary: `${PREFIX}content_library_v1`,
  assessments: `${PREFIX}assessments_v1`,
  quranSessions: `${PREFIX}quran_sessions_v1`,
  curriculumSlides: (trackId) => `${PREFIX}curriculum_${trackId}_v1`,
};

export function loadAdminState(key, buildFallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return buildFallback();
    const parsed = JSON.parse(raw);
    if (parsed == null) return buildFallback();
    return parsed;
  } catch {
    return buildFallback();
  }
}

/** يحمي من بيانات localStorage تالفة (مثلاً دالة محفوظة بالخطأ) */
export function loadAdminArrayState(key, buildFallback) {
  const data = loadAdminState(key, buildFallback);
  return Array.isArray(data) ? data : buildFallback();
}

export function saveAdminState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearAdminState(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
