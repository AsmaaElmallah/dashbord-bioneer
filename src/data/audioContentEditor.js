import { targetingAudiences } from './mockData';

export const audioUsageOptions = [
  { id: 'slide_narration', label: 'تعليق شريحة (m4a)' },
  { id: 'quran_session', label: 'جلسة قرآن (mp3)' },
  { id: 'library_ambient', label: 'مكتبة — أصوات / تهويدات' },
  { id: 'onboarding', label: 'Onboarding / CMS' },
  { id: 'notification_sound', label: 'صوت إشعار' },
];

export const audioFormatOptions = ['m4a', 'mp3', 'wav'];

export const audioPublishStatusOptions = ['مسودة', 'يحتاج مراجعة', 'منشور'];

export function createEmptyAudioContent(overrides = {}) {
  return {
    title: '',
    audioFile: null,
    format: 'm4a',
    durationSec: '',
    transcript: '',
    usageId: 'slide_narration',
    placement: '',
    targetAudience: targetingAudiences[0] ?? 'كل الأعمار',
    publishStatus: 'مسودة',
    assetPath: '',
    reciterId: '',
    packageId: '',
    ...overrides,
  };
}

export function getAudioContentValidation(content) {
  const issues = [];
  if (!content.audioFile) {
    issues.push({ id: 'noAudio', message: 'لا يوجد ملف صوت — اختر mp3 أو m4a mock.' });
  }
  if (!content.title?.trim()) {
    issues.push({ id: 'noTitle', message: 'أضف عنواناً للملف في الأصول.' });
  }
  if (!content.durationSec?.toString().trim()) {
    issues.push({ id: 'noDuration', message: 'أضف مدة بالثواني (durationSec) للمعاينة.' });
  }
  if (content.usageId === 'quran_session' && !content.reciterId?.trim()) {
    issues.push({ id: 'noReciter', message: 'جلسة قرآن — حدّد القارئ (reciterId).' });
  }
  return issues;
}

export function getAudioUsageLabel(usageId) {
  return audioUsageOptions.find((u) => u.id === usageId)?.label ?? usageId;
}

export function formatDurationLabel(durationSec) {
  const sec = Number(durationSec);
  if (!sec || Number.isNaN(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s} ث`;
}

/** مثال: m4a شريحة حساب */
export function getSlideAudioMock() {
  return createEmptyAudioContent({
    title: 'slide_001.m4a — q_129_132',
    audioFile: { name: 'slide_001.m4a', sizeMock: '312 KB', notUploaded: true },
    format: 'm4a',
    durationSec: '45',
    transcript: 'عدّ الخرزات مع طفلك — واحدة، اثنتان…',
    usageId: 'slide_narration',
    placement: 'assets/math/packages/q_129_132/audio/slide_001.m4a',
    assetPath: 'assets/math/packages/q_129_132/audio/slide_001.m4a',
    packageId: 'q_129_132',
    targetAudience: '6-12 شهر',
    publishStatus: 'مسودة',
  });
}

/** مثال: mp3 جلسة قرآن */
export function getQuranSessionAudioMock() {
  return createEmptyAudioContent({
    title: 'session_001.mp3 — نصف حزب 1',
    audioFile: { name: 'session_001.mp3', sizeMock: '4.8 MB', notUploaded: true },
    format: 'mp3',
    durationSec: '320',
    transcript: 'سورة الفاتحة — تلاوة أحمد خضر',
    usageId: 'quran_session',
    placement: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    assetPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    reciterId: 'ahmed_khader',
    targetAudience: 'كل الأعمار',
    publishStatus: 'يحتاج مراجعة',
  });
}
