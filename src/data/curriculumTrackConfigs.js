import {
  genericLessonNumberForDay,
  mathLessonNumberForDay,
  PROGRAM_TOTAL_DAYS,
} from './curriculumProgramAdmin';
import {
  emotionalLessons,
  emotionalOverview,
  emotionalPackages,
  mathLessons,
  mathOverview,
  mathPackages,
  mathSlideSamples,
  visualLessons,
  visualOverview,
  visualPackages,
  visualSlideSamples,
} from './mockData';

function mathSlideRange(lesson, lessonMeta) {
  if (lessonMeta?.globalStart != null) {
    return {
      slideCount: lessonMeta.slideCount,
      globalStart: lessonMeta.globalStart ?? 1,
      globalEnd: lessonMeta.globalEnd ?? lessonMeta.slideCount,
    };
  }
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 11) return { slideCount: 5, globalStart: 96, globalEnd: 100 };
  if (lesson === 25) return { slideCount: 7, globalStart: 231, globalEnd: 237 };
  if (lesson >= 2 && lesson <= 10) {
    const globalStart = 6 + 10 * (lesson - 2);
    return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
  }
  const globalStart = 101 + 10 * (lesson - 12);
  return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
}

function visualSlideRange(lesson, lessonMeta) {
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 30) return { slideCount: 7, globalStart: 286, globalEnd: 292 };
  const globalStart = 6 + 10 * (lesson - 2);
  return { slideCount: lessonMeta?.slideCount ?? 10, globalStart, globalEnd: globalStart + 9 };
}

function emotionalSlideRange(lesson, lessonMeta) {
  if (lessonMeta?.globalStart != null) {
    return {
      slideCount: lessonMeta.slideCount,
      globalStart: lessonMeta.globalStart,
      globalEnd: lessonMeta.globalEnd,
    };
  }
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 17) return { slideCount: 7, globalStart: 156, globalEnd: 162 };
  const globalStart = 6 + 10 * (lesson - 2);
  return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
}

export const mathTrackConfig = {
  trackId: 'math',
  journeyTitle: 'رحلة الحساب النقطي',
  heroTitle: 'منهج الحساب الذهني',
  heroSubtitle: `${mathOverview.lessonCount} درس · برنامج ${PROGRAM_TOTAL_DAYS} يوم (0–2 سنة)`,
  breadcrumbJourney: 'رحلة الدروس',
  lessonCount: mathOverview.lessonCount,
  maxLessonNumber: 25,
  program: {
    totalDays: mathOverview.totalProgramDays,
    lastNewContentDay: mathOverview.lastNewContentDay,
    reviewCycleStartDay: mathOverview.reviewCycleStartDay,
    lessonNumberForDay: mathLessonNumberForDay,
  },
  lessons: mathLessons,
  packages: mathPackages,
  packageFilterOptions: mathPackages,
  slideSamples: mathSlideSamples,
  accentVar: '--track-math',
  lessonLabel: (n) => `الدرس ${n}`,
  getSlideRange: mathSlideRange,
  defaultPackageId: (lesson) => {
    if (lesson <= 10) return 'q_129_132';
    if (lesson <= 24) return 'dot_numeric_133_136';
    return 'beads_numeric';
  },
  buildAssetPaths: (packageId, padded, globalIndex) => ({
    png: `assets/math/packages/${packageId}/slides/slide_${padded}.png`,
    audio: `assets/math/packages/${packageId}/audio/slide_${padded}.m4a`,
  }),
  seedSlides: () =>
    mathSlideSamples.map((s) => ({
      ...s,
      dayIndexInLesson: 1,
      imageFile: { name: 'slide.png', sizeMock: '—', notUploaded: true },
      audioFile: s.audioPath ? { name: 'slide.m4a', sizeMock: '—', notUploaded: true } : null,
      title: `شريحة عالمية #${s.globalIndex}`,
    })),
  editorSlideLink: '/content-studio/slide',
  editorLessonLink: '/content-studio/lesson',
};

export const visualTrackConfig = {
  trackId: 'visual',
  journeyTitle: 'رحلة التحفيز البصري',
  heroTitle: 'التحفيز البصري',
  heroSubtitle: `${visualOverview.lessonCount} درس · برنامج ${PROGRAM_TOTAL_DAYS} يوم`,
  breadcrumbJourney: 'رحلة الدروس',
  lessonCount: visualOverview.lessonCount,
  maxLessonNumber: 30,
  program: {
    totalDays: PROGRAM_TOTAL_DAYS,
    lastNewContentDay: visualOverview.lastNewContentDay,
    reviewCycleStartDay: visualOverview.reviewCycleStartDay,
    lessonNumberForDay: (day) =>
      genericLessonNumberForDay(
        day,
        visualOverview.lastNewContentDay,
        30,
        visualOverview.reviewCycleStartDay,
      ),
  },
  lessons: visualLessons,
  packages: visualPackages,
  packageFilterOptions: visualPackages,
  slideSamples: visualSlideSamples,
  accentVar: '--track-visual',
  lessonLabel: (n) => `الدرس ${n}`,
  getSlideRange: visualSlideRange,
  defaultPackageId: (lesson) => `visual_src_${String(Math.min(lesson, 18)).padStart(2, '0')}`,
  buildAssetPaths: (packageId, padded) => ({
    png: `assets/visual/packages/${packageId}/slide_${padded}/slide.png`,
    audio: `assets/visual/packages/${packageId}/slide_${padded}/audio.m4a`,
  }),
  seedSlides: () =>
    visualSlideSamples.map((s) => ({
      ...s,
      dayIndexInLesson: 1,
      imageFile: { name: 'slide.png', sizeMock: '—', notUploaded: true },
      audioFile: { name: 'audio.m4a', sizeMock: '—', notUploaded: true },
      title: `شريحة #${s.globalIndex}`,
    })),
  editorSlideLink: '/content-studio/slide',
  editorLessonLink: '/content-studio/lesson',
};

export const emotionalTrackConfig = {
  trackId: 'emotional',
  journeyTitle: 'رحلة الذكاء العاطفي',
  heroTitle: 'الذكاء العاطفي الاجتماعي',
  heroSubtitle: `${emotionalOverview.lessonCount} درس · برنامج ${PROGRAM_TOTAL_DAYS} يوم`,
  breadcrumbJourney: 'رحلة الدروس',
  lessonCount: emotionalOverview.lessonCount,
  maxLessonNumber: 17,
  program: {
    totalDays: PROGRAM_TOTAL_DAYS,
    lastNewContentDay: emotionalOverview.lastNewContentDay,
    reviewCycleStartDay: emotionalOverview.reviewCycleStartDay,
    lessonNumberForDay: (day) =>
      genericLessonNumberForDay(
        day,
        emotionalOverview.lastNewContentDay,
        17,
        emotionalOverview.reviewCycleStartDay,
      ),
  },
  lessons: emotionalLessons,
  packages: emotionalPackages,
  packageFilterOptions: emotionalPackages.slice(0, 12),
  slideSamples: [],
  accentVar: '--track-emotional',
  lessonLabel: (n) => {
    const meta = emotionalLessons.find((l) => l.lesson === n);
    return meta?.title ? `الدرس ${n}` : `الدرس ${n}`;
  },
  getSlideRange: emotionalSlideRange,
  defaultPackageId: (lesson) => `emotional_src_${String(Math.min(lesson, 32)).padStart(2, '0')}`,
  buildAssetPaths: (packageId, padded) => ({
    png: `assets/emotional/packages/${packageId}/slide_${padded}.png`,
    audio: `assets/emotional/packages/${packageId}/audio_${padded}.m4a`,
  }),
  seedSlides: () => [],
  editorSlideLink: '/content-studio/slide',
  editorLessonLink: '/content-studio/lesson',
};
