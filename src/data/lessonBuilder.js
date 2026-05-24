import { onboardingAgeGroups } from './mockData';
import { visualSlideSamples } from './mockData';

export const lessonTracks = [
  { id: 'math', label: 'الحساب', flutterRoute: '/home/math', color: '#FF7043' },
  { id: 'visual', label: 'التحفيز البصري', flutterRoute: '/home/visual', color: '#9C6FD6' },
  { id: 'emotional', label: 'الذكاء العاطفي', flutterRoute: '/home/emotional', color: '#F1758E' },
];

export const slideStatusOptions = ['مسودة', 'يحتاج مراجعة', 'منشور', 'ناقص ملفات'];

export function createEmptySlide(order) {
  return {
    id: `slide-${Date.now()}-${order}`,
    order,
    title: '',
    description: '',
    imageName: '',
    audioName: '',
    durationSec: 45,
    status: 'مسودة',
  };
}

export function createEmptyLesson(overrides = {}) {
  return {
    track: 'math',
    lessonNumber: 1,
    title: '',
    goal: '',
    shortDescription: '',
    appearanceDays: '1–5',
    dailyRepetitions: 5,
    focusDurationMin: 10,
    ageGroup: onboardingAgeGroups[0]?.label ?? '0-3 شهور',
    publishStatus: 'مسودة',
    slides: [createEmptySlide(1)],
    previewSlideIndex: 0,
    ...overrides,
  };
}

export function reindexSlides(slides) {
  return slides.map((s, i) => ({ ...s, order: i + 1 }));
}

export function moveSlide(slides, id, direction) {
  const idx = slides.findIndex((s) => s.id === id);
  if (idx < 0) return slides;
  const next = idx + direction;
  if (next < 0 || next >= slides.length) return slides;
  const copy = [...slides];
  [copy[idx], copy[next]] = [copy[next], copy[idx]];
  return reindexSlides(copy);
}

export function getTrackMeta(trackId) {
  return lessonTracks.find((t) => t.id === trackId) ?? lessonTracks[0];
}

/** مثال درس بصري mock — من visualLessons + visualSlideSamples */
export function getVisualLessonMock() {
  const sample = visualSlideSamples[0];
  return createEmptyLesson({
    track: 'visual',
    lessonNumber: 1,
    title: 'درس 1 — التحفيز البصري المبكر',
    goal: 'تعزيز التركيز البصري والانتباه المشترك',
    shortDescription: 'جولة mock — 5 شرائح في visual_src_01',
    appearanceDays: '1–5',
    dailyRepetitions: 5,
    focusDurationMin: 8,
    ageGroup: '0-3 شهور',
    publishStatus: 'مسودة',
    slides: [
      {
        id: 'v-mock-1',
        order: 1,
        title: 'شريحة 1 — ترحيب بصري',
        description: 'مقدمة للطفل ولي الأمر',
        imageName: sample?.assetPath?.split('/').pop() ?? 'slide.png',
        audioName: 'slide_001.m4a',
        durationSec: sample?.durationSec ?? 40,
        status: 'مسودة',
      },
      {
        id: 'v-mock-2',
        order: 2,
        title: 'شريحة 2 — تتبع الحركة',
        description: 'متابعة جسم متحرك',
        imageName: 'slide_002.png',
        audioName: 'slide_002.m4a',
        durationSec: 42,
        status: 'ناقص ملفات',
      },
      {
        id: 'v-mock-3',
        order: 3,
        title: 'شريحة 3 — ألوان أساسية',
        description: 'تمييز أحمر وأزرق',
        imageName: 'slide_003.png',
        audioName: '',
        durationSec: 38,
        status: 'مسودة',
      },
    ],
    previewSlideIndex: 0,
  });
}
