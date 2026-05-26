import {
  buildKhatmahPlanRows,
  buildSessionTitle,
  dailySessionsForKhatmah,
  getKhatmahPlanSummary,
  getManifestSample,
  SESSIONS_PER_KHATMAH,
} from './quranSessionEditor';
import { quranOverview, quranSessions } from './mockData';

export const QURAN_JOURNEY_PATH_OFFSETS = [48, 0, -48, 0, 32];
export const QURAN_TARGET_KHATMAH = quranOverview.targetKhatmah;

const ARABIC_DAY_ORDINALS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
  'الثالث عشر',
  'الرابع عشر',
  'الخامس عشر',
  'السادس عشر',
  'السابع عشر',
  'الثامن عشر',
  'التاسع عشر',
  'العشرون',
];

export const defaultQuranAdminProgress = {
  completedKhatmahs: 0,
  currentKhatmah: 1,
  completedSessionsInCurrent: 3,
};

export function quranDayLabel(dayIndex) {
  if (dayIndex >= 1 && dayIndex <= ARABIC_DAY_ORDINALS.length) {
    return `اليوم ${ARABIC_DAY_ORDINALS[dayIndex - 1]}`;
  }
  return `اليوم ${dayIndex}`;
}

function mapMockSession(row) {
  const daily = dailySessionsForKhatmah(row.khatmah);
  const dayIndex = Math.ceil(row.session / daily);
  const sessionInDay = ((row.session - 1) % daily) + 1;
  const sample = getManifestSample(row.session);

  return {
    id: row.id,
    khatmah: row.khatmah,
    session: row.session,
    dayIndex,
    sessionInDay,
    dailySessions: daily,
    hizb: row.hizb,
    half: row.half,
    title: row.title,
    surahRange: sample ? `${sample.rangeStart} → ${sample.rangeEnd}` : '—',
    file: row.file,
    audioPath: row.audioPath,
    durationMinutes: row.durationMinutes,
    audioFile: row.audioFile ?? (row.file ? { name: row.file, sizeMock: '—', notUploaded: true } : null),
    status: row.status,
    statusKey: row.statusKey ?? 'missing',
  };
}

function buildPlanSessionRow(khatmah, planRow) {
  const sample = getManifestSample(planRow.sessionNumber);
  return {
    id: `k${String(khatmah).padStart(2, '0')}_s${String(planRow.sessionNumber).padStart(3, '0')}`,
    khatmah,
    session: planRow.sessionNumber,
    dayIndex: planRow.dayIndex,
    sessionInDay: planRow.sessionInDay,
    dailySessions: planRow.dailySessions,
    hizb: planRow.hizbNumber,
    half: planRow.halfHizb,
    title: planRow.title,
    surahRange: sample ? `${sample.rangeStart} → ${sample.rangeEnd}` : '—',
    file: `session_${String(planRow.sessionNumber).padStart(3, '0')}.mp3`,
    audioPath: `assets/audio/quran/${quranOverview.activeReciterId}/half_hizb/session_${String(planRow.sessionNumber).padStart(3, '0')}.mp3`,
    durationMinutes: sample?.durationMinutes ?? quranOverview.durationMinutes,
    status: sample ? 'يحتاج مراجعة' : 'ناقص',
    statusKey: sample ? 'review' : 'missing',
  };
}

/** بداية خفيفة — عينات mock فقط؛ باقي الختمة تُولَّد عند فتحها */
export function seedQuranJourneySessions() {
  return quranSessions.map(mapMockSession).sort((a, b) => a.khatmah - b.khatmah || a.session - b.session);
}

/**
 * تحميل 120 جلسة عند أول فتح للختمة فقط.
 * لا يُعاد إدراج جلسات محذوفة — حتى يعمل «إضافة جلسة» بعد الحذف.
 */
export function ensureKhatmahPlanSessions(sessions, khatmah) {
  const existingForKhatmah = sessions.filter((s) => s.khatmah === khatmah);
  if (existingForKhatmah.length > 0) {
    return sessions;
  }

  const byKey = new Map(sessions.map((s) => [`${s.khatmah}-${s.session}`, s]));

  buildKhatmahPlanRows(khatmah).forEach((planRow) => {
    const key = `${khatmah}-${planRow.sessionNumber}`;
    byKey.set(key, buildPlanSessionRow(khatmah, planRow));
  });

  return Array.from(byKey.values()).sort((a, b) => a.khatmah - b.khatmah || a.session - b.session);
}

export function getCompletedSessionsForKhatmah(progress, khatmah) {
  if (khatmah < progress.currentKhatmah) return SESSIONS_PER_KHATMAH;
  if (khatmah > progress.currentKhatmah) return 0;
  return progress.completedSessionsInCurrent;
}

export function getAdminKhatmahNodeState(khatmah) {
  const summary = getKhatmahPlanSummary(khatmah);
  return {
    isDone: false,
    isActive: false,
    isLocked: false,
    isAdminOpen: true,
    canOpen: true,
    subtitle: `${summary.dailySessions} جلسة/يوم · ${summary.daysToFinish} يوم`,
    speechBubble: null,
  };
}

export function getAdminDayNodeState(khatmah) {
  const daily = dailySessionsForKhatmah(khatmah);
  return {
    isDone: false,
    isActive: false,
    isLocked: false,
    isAdminOpen: true,
    canOpen: true,
    subtitle: `${daily} جلسات`,
    speechBubble: null,
  };
}

export function getKhatmahNodeState(khatmah, progress) {
  const completed = progress.completedKhatmahs;
  const current = progress.currentKhatmah;
  const isDone = khatmah <= completed;
  const isActive = !isDone && khatmah === current;
  const isLocked = khatmah > current;
  return { isDone, isActive, isLocked, canOpen: !isLocked };
}

export function getDayNodeState(khatmah, dayIndex, progress) {
  const daily = dailySessionsForKhatmah(khatmah);
  const completedSessions = getCompletedSessionsForKhatmah(progress, khatmah);
  const completedDays = Math.floor(completedSessions / daily);
  const partialToday = completedSessions % daily;
  const isCurrentKhatmah = khatmah === progress.currentKhatmah;
  const summary = getKhatmahPlanSummary(khatmah);
  const khatmahDone = khatmah < progress.currentKhatmah;

  const isDone = dayIndex <= completedDays || khatmahDone;
  const isActive =
    isCurrentKhatmah && !khatmahDone && dayIndex === completedDays + 1 && partialToday < daily;
  const isLocked = !isDone && !isActive;

  let subtitle;
  if (isActive && partialToday > 0) {
    subtitle = `جلسة ${partialToday} من ${daily}`;
  } else if (isDone) {
    subtitle = `${daily} جلسات مكتملة`;
  }

  return { isDone, isActive, isLocked, subtitle, canOpen: !isLocked };
}

export function buildKhatmahDayNodes(khatmah, progress, options = {}) {
  const { adminMode = false } = options;
  const summary = getKhatmahPlanSummary(khatmah);
  const nodes = [];

  for (let day = 1; day <= summary.daysToFinish; day += 1) {
    const state = adminMode ? getAdminDayNodeState(khatmah) : getDayNodeState(khatmah, day, progress);
    nodes.push({
      id: `k${khatmah}-d${day}`,
      label: quranDayLabel(day),
      subtitle: state.subtitle,
      ...state,
      speechBubble: adminMode ? null : state.isActive ? 'ابدأ الآن' : null,
      payload: { khatmah, day },
    });
  }

  return nodes;
}

export function buildKhatmahJourneyNodes(progress, options = {}) {
  const { adminMode = false, count = adminMode ? QURAN_TARGET_KHATMAH : 5 } = options;
  const nodes = [];

  for (let i = 1; i <= count; i += 1) {
    const state = adminMode ? getAdminKhatmahNodeState(i) : getKhatmahNodeState(i, progress);
    nodes.push({
      id: `khatmah-${i}`,
      label: `الختمة ${i}`,
      subtitle: state.subtitle ?? (state.isDone ? 'مكتملة' : state.isActive ? `${getKhatmahPlanSummary(i).daysToFinish} يوماً` : null),
      isBonus: !adminMode && i === 4,
      speechBubble: adminMode ? null : state.isActive ? 'ابدأ الآن' : null,
      ...state,
      payload: { khatmah: i },
    });
  }

  return nodes;
}

export function getSessionsForKhatmahDay(sessions, khatmah, dayIndex) {
  return sessions
    .filter((s) => s.khatmah === khatmah && s.dayIndex === dayIndex)
    .sort((a, b) => a.session - b.session);
}

export function filterQuranSessions(sessions, filters) {
  return sessions.filter((s) => {
    if (filters.khatmah !== 'all' && s.khatmah !== Number(filters.khatmah)) return false;
    if (filters.status !== 'all' && s.statusKey !== filters.status) return false;
    return true;
  });
}

export function createNewSessionForDay(sessions, khatmah, dayIndex, draft = {}) {
  const { audioFile, title: titleInput, surahRange: rangeInput, durationMinutes: durationInput } = draft;

  if (!audioFile) {
    return { error: 'ارفع ملف mp3 أو m4a للجلسة قبل الحفظ.' };
  }

  const daily = dailySessionsForKhatmah(khatmah);
  const inDay = sessions.filter((s) => s.khatmah === khatmah && s.dayIndex === dayIndex);

  if (inDay.length >= daily) {
    return { error: `لا يمكن إضافة أكثر من ${daily} جلسات في اليوم.` };
  }

  const maxSession = sessions
    .filter((s) => s.khatmah === khatmah)
    .reduce((m, s) => Math.max(m, s.session), 0);
  const nextSession = maxSession + 1;

  if (nextSession > SESSIONS_PER_KHATMAH) {
    return { error: `اكتملت ${SESSIONS_PER_KHATMAH} جلسة لهذه الختمة.` };
  }

  const sessionInDay =
    inDay.length === 0 ? 1 : Math.max(...inDay.map((s) => s.sessionInDay)) + 1;

  const sample = getManifestSample(nextSession);
  const title = titleInput?.trim() || buildSessionTitle(nextSession);
  const surahRange =
    rangeInput?.trim() || (sample ? `${sample.rangeStart} → ${sample.rangeEnd}` : '—');
  const fileName = audioFile.name;
  const audioPath = `assets/audio/quran/${quranOverview.activeReciterId}/half_hizb/${fileName}`;

  return {
    session: {
      id: `k${String(khatmah).padStart(2, '0')}_s${String(nextSession).padStart(3, '0')}_new_${Date.now()}`,
      khatmah,
      session: nextSession,
      dayIndex,
      sessionInDay,
      dailySessions: daily,
      hizb: Math.floor((nextSession + 1) / 2),
      half: nextSession % 2 === 1 ? 1 : 2,
      title,
      surahRange,
      audioFile,
      file: fileName,
      audioPath,
      durationMinutes:
        Number(durationInput) > 0
          ? Number(durationInput)
          : sample?.durationMinutes ?? quranOverview.durationMinutes,
      status: 'موجود',
      statusKey: 'ok',
    },
  };
}

export function attachAudioToSession(session, audioFile, overrides = {}) {
  if (!audioFile) return session;
  const fileName = audioFile.name;
  return {
    ...session,
    ...overrides,
    audioFile,
    file: fileName,
    audioPath: `assets/audio/quran/${quranOverview.activeReciterId}/half_hizb/${fileName}`,
    status: 'موجود',
    statusKey: 'ok',
  };
}
