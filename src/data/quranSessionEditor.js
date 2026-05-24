import { quranKhatmahPlan, quranOverview, quranReciters, quranSessions } from './mockData';

export const SESSIONS_PER_KHATMAH = 120;
export const quranSessionFileStatusOptions = ['موجود', 'ناقص', 'يحتاج مراجعة'];
export const halfHizbOptions = [
  { value: 1, label: 'الأول' },
  { value: 2, label: 'الثاني' },
];

/** عيّنات من half_hizb_manifest.json — UI mock فقط */
const manifestRangeSamples = {
  1: { rangeStart: '1:1', rangeEnd: '2:31', durationMinutes: 16, fileSizeMb: '4.83' },
  2: { rangeStart: '2:31', rangeEnd: '2:68', durationMinutes: 18, fileSizeMb: '5.96' },
  3: { rangeStart: '2:68', rangeEnd: '2:105', durationMinutes: 18, fileSizeMb: '5.87' },
  60: { rangeStart: '25:1', rangeEnd: '25:20', durationMinutes: 15, fileSizeMb: '4.12' },
  120: { rangeStart: '114:1', rangeEnd: '114:6', durationMinutes: 2, fileSizeMb: '0.48' },
};

export function dailySessionsForKhatmah(khatmahIndex) {
  if (khatmahIndex <= 1) return 2;
  if (khatmahIndex === 2) return 3;
  if (khatmahIndex === 3) return 4;
  return 5;
}

export function parentHizbForSession(sessionIndex) {
  return Math.floor((sessionIndex + 1) / 2);
}

export function halfOfHizbForSession(sessionIndex) {
  return sessionIndex % 2 === 1 ? 1 : 2;
}

export function halfHizbLabel(half) {
  return half === 1 ? 'الأول' : 'الثاني';
}

export function buildSessionTitle(sessionNumber) {
  const hizb = parentHizbForSession(sessionNumber);
  const half = halfOfHizbForSession(sessionNumber);
  return `نصف حزب ${hizb} (${halfHizbLabel(half)})`;
}

export function buildAudioPathMock(reciterId, sessionNumber) {
  const padded = String(sessionNumber).padStart(3, '0');
  return `assets/audio/quran/${reciterId}/half_hizb/session_${padded}.mp3`;
}

export function getManifestSample(sessionNumber) {
  return manifestRangeSamples[sessionNumber] ?? null;
}

export function sessionFromPlan(khatmahNumber, sessionNumber) {
  const hizb = parentHizbForSession(sessionNumber);
  const half = halfOfHizbForSession(sessionNumber);
  const sample = getManifestSample(sessionNumber);
  const reciterId = quranOverview.activeReciterId;

  return createEmptyQuranSession({
    khatmahNumber,
    sessionNumber,
    hizbNumber: hizb,
    halfHizb: half,
    rangeStart: sample?.rangeStart ?? `${hizb}:1`,
    rangeEnd: sample?.rangeEnd ?? `${hizb}:20`,
    reciterId,
    durationMinutes: sample?.durationMinutes ?? quranOverview.durationMinutes,
    fileSizeMb: sample?.fileSizeMb ?? '',
    fileStatus: sample ? 'يحتاج مراجعة' : 'ناقص',
    audioFile: null,
  });
}

export function createEmptyQuranSession(overrides = {}) {
  const sessionNumber = overrides.sessionNumber ?? 1;
  const hizb = overrides.hizbNumber ?? parentHizbForSession(sessionNumber);
  const half = overrides.halfHizb ?? halfOfHizbForSession(sessionNumber);

  return {
    khatmahNumber: 1,
    sessionNumber,
    hizbNumber: hizb,
    halfHizb: half,
    rangeStart: '1:1',
    rangeEnd: '2:31',
    reciterId: quranOverview.activeReciterId,
    audioFile: null,
    durationMinutes: quranOverview.durationMinutes,
    fileSizeMb: '',
    fileStatus: 'ناقص',
    reviewNotes: '',
    ...overrides,
  };
}

/** 120 جلسة لخطة الختمة — daily sessions حسب رقم الختمة */
export function buildKhatmahPlanRows(khatmahNumber) {
  const daily = dailySessionsForKhatmah(khatmahNumber);
  const rows = [];

  for (let session = 1; session <= SESSIONS_PER_KHATMAH; session += 1) {
    const dayIndex = Math.ceil(session / daily);
    const sessionInDay = ((session - 1) % daily) + 1;
    rows.push({
      sessionNumber: session,
      hizbNumber: parentHizbForSession(session),
      halfHizb: halfOfHizbForSession(session),
      halfLabel: halfHizbLabel(halfOfHizbForSession(session)),
      dayIndex,
      sessionInDay,
      dailySessions: daily,
      title: buildSessionTitle(session),
    });
  }

  return rows;
}

export function getKhatmahPlanSummary(khatmahNumber) {
  const fromMock = quranKhatmahPlan.find((r) =>
    khatmahNumber >= 4 ? r.khatmah === 4 : r.khatmah === khatmahNumber,
  );
  const daily = dailySessionsForKhatmah(khatmahNumber);
  const daysToFinish = Math.ceil(SESSIONS_PER_KHATMAH / daily);

  return {
    dailySessions: daily,
    daysToFinish: fromMock?.daysToFinish ?? daysToFinish,
    note: fromMock?.note ?? `${daily} جلسات يومياً`,
  };
}

export function getReciterOptions() {
  return quranReciters.map((r) => ({ id: r.id, label: r.name, active: r.active }));
}

export function getQuranSessionValidation(session) {
  const issues = [];
  if (!session.audioFile) {
    issues.push({
      id: 'noAudio',
      message: 'ملف mp3 غير مرفق — الجلسة ناقصة.',
      severity: 'error',
    });
  }
  if (!session.durationMinutes || Number(session.durationMinutes) <= 0) {
    issues.push({
      id: 'noDuration',
      message: 'مدة الجلسة مطلوبة.',
      severity: 'error',
    });
  }
  if (!session.rangeStart || !session.rangeEnd) {
    issues.push({
      id: 'noRange',
      message: 'نطاق الآيات (rangeStart / rangeEnd) مطلوب.',
      severity: 'warning',
    });
  }
  return issues;
}

/** مثال: جلسة 1 ختمة 1 — metadata كاملة بدون mp3 */
export function getQuranSessionMissingMp3Mock() {
  const sample = quranSessions.find((s) => s.status === 'ناقص') ?? quranSessions[0];
  const sessionNumber = sample.session;

  return createEmptyQuranSession({
    khatmahNumber: sample.khatmah,
    sessionNumber,
    hizbNumber: sample.hizb,
    halfHizb: sample.half,
    rangeStart: manifestRangeSamples[sessionNumber]?.rangeStart ?? '1:1',
    rangeEnd: manifestRangeSamples[sessionNumber]?.rangeEnd ?? '2:31',
    reciterId: quranOverview.activeReciterId,
    audioFile: null,
    durationMinutes: sample.durationMinutes,
    fileSizeMb: manifestRangeSamples[sessionNumber]?.fileSizeMb ?? '',
    fileStatus: 'ناقص',
    reviewNotes: 'mp3 غير موجود في assets — manifest فقط.',
  });
}

export function audioFileLabel(file) {
  if (!file) return '—';
  return typeof file === 'string' ? file : file.name;
}
