import {
  getDailyRepeatsForCurriculumDay,
  getLessonAgePhaseLabel,
  getLessonDailyRepeatLabel,
} from './curriculumProgramAdmin';
import { quranDayLabel } from './quranJourneyAdmin';

const DAY_ORDINALS_IN_LESSON = [
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

export function curriculumLessonDayLabel(dayIndexInLesson) {
  if (dayIndexInLesson >= 1 && dayIndexInLesson <= DAY_ORDINALS_IN_LESSON.length) {
    return `اليوم ${DAY_ORDINALS_IN_LESSON[dayIndexInLesson - 1]}`;
  }
  return `اليوم ${dayIndexInLesson}`;
}

/** منطق curriculum_lesson_journey.dart */
export function curriculumLessonDaySpan(lessonNumber, maxLessonNumber) {
  const lesson = Math.min(Math.max(lessonNumber, 1), maxLessonNumber);
  if (lesson === 1) return { lessonNumber: 1, startDay: 1, endDay: 25, dayCount: 25 };
  if (lesson === 2) return { lessonNumber: 2, startDay: 26, endDay: 42, dayCount: 17 };
  if (lesson === 3) return { lessonNumber: 3, startDay: 43, endDay: 50, dayCount: 8 };
  if (lesson === 4) return { lessonNumber: 4, startDay: 51, endDay: 55, dayCount: 5 };
  const start = 56 + (lesson - 5) * 5;
  const end = start + 4;
  return { lessonNumber: lesson, startDay: start, endDay: end, dayCount: 5 };
}

export function getAdminLessonNodeState(lessonNumber, lessonMeta, trackConfig) {
  let subtitle = lessonMeta?.title
    ? `${lessonMeta.title} · ${lessonMeta.slideCount} شريحة`
    : `${lessonMeta?.slideCount ?? '—'} شريحة · ${lessonMeta?.days ?? ''}`;

  if (trackConfig?.program) {
    const span = curriculumLessonDaySpan(lessonNumber, trackConfig.maxLessonNumber);
    const repeat = getLessonDailyRepeatLabel(lessonNumber, trackConfig, lessonMeta);
    const age = getLessonAgePhaseLabel(lessonNumber, trackConfig);
    subtitle = `${subtitle} · منهج ${span.startDay}–${span.endDay} · ${repeat} · ${age}`;
  }

  return {
    isDone: false,
    isActive: false,
    isLocked: false,
    isAdminOpen: true,
    canOpen: true,
    subtitle,
    speechBubble: null,
  };
}

export function getAdminDayNodeState() {
  return {
    isDone: false,
    isActive: false,
    isLocked: false,
    isAdminOpen: true,
    canOpen: true,
    subtitle: 'مفتوح للأدمن',
    speechBubble: null,
  };
}

export function buildLessonJourneyNodes(trackConfig, lessons) {
  return lessons.map((meta) => {
    const lessonNumber = meta.lesson;
    return {
      id: `${trackConfig.trackId}-lesson-${lessonNumber}`,
      label: trackConfig.lessonLabel(lessonNumber),
      payload: { lesson: lessonNumber, lessonId: meta.id },
      isBonus: false,
      ...getAdminLessonNodeState(lessonNumber, meta, trackConfig),
    };
  });
}

export function buildLessonDayNodes(trackConfig, lessonNumber) {
  const span = curriculumLessonDaySpan(lessonNumber, trackConfig.maxLessonNumber);
  const nodes = [];

  for (let day = 1; day <= span.dayCount; day += 1) {
    nodes.push({
      id: `${trackConfig.trackId}-l${lessonNumber}-d${day}`,
      label: curriculumLessonDayLabel(day),
      subtitle: (() => {
        const globalDay = span.startDay + day - 1;
        const repeats = getDailyRepeatsForCurriculumDay(globalDay);
        return `منهج يوم ${globalDay} · ${repeats}×/يوم`;
      })(),
      payload: { lesson: lessonNumber, dayIndexInLesson: day },
      ...getAdminDayNodeState(),
    });
  }

  return nodes;
}

function mapSampleSlide(sample, trackConfig, lessonNumber, dayIndexInLesson) {
  return {
    ...sample,
    lesson: lessonNumber,
    dayIndexInLesson,
    imageFile: sample.imageFile ?? (sample.assetPath ? { name: 'slide.png', sizeMock: '—', notUploaded: true } : null),
    audioFile:
      sample.audioFile ??
      (sample.audioPath ? { name: 'slide.m4a', sizeMock: '—', notUploaded: true } : null),
    imageStatus: sample.imageStatus ?? (sample.assetPath ? 'موجود' : 'ناقص'),
    audioStatus: sample.audioStatus ?? (sample.audioPath ? 'موجود' : 'ناقص'),
  };
}

function buildGeneratedSlide(trackConfig, lessonNumber, slideIndexInLesson, globalIndex, dayIndexInLesson) {
  const packageId = trackConfig.defaultPackageId(lessonNumber);
  const padded = String(slideIndexInLesson).padStart(3, '0');
  const paths = trackConfig.buildAssetPaths(packageId, padded, globalIndex);

  return {
    id: `${trackConfig.trackId}_l${lessonNumber}_g${globalIndex}`,
    lesson: lessonNumber,
    globalIndex,
    slideIndex: slideIndexInLesson,
    dayIndexInLesson,
    packageId,
    assetPath: paths.png,
    audioPath: paths.audio,
    durationSec: 45,
    imageFile: null,
    audioFile: null,
    imageStatus: 'ناقص',
    audioStatus: 'ناقص',
    title: `شريحة ${slideIndexInLesson}`,
  };
}

/** تحميل كل الدروس — فقط الدرس بلا شرائح يُولَّد (لا يعيد المحذوف) */
export function ensureAllTrackSlides(slides, trackConfig) {
  let next = slides;
  for (let lesson = 1; lesson <= trackConfig.maxLessonNumber; lesson += 1) {
    if (!next.some((s) => s.lesson === lesson)) {
      next = ensureLessonSlides(next, trackConfig, lesson);
    }
  }
  return next;
}

/** أول فتح للدرس: عينات mock + توليد شرائح الدرس */
export function ensureLessonSlides(slides, trackConfig, lessonNumber) {
  const lessonMeta = trackConfig.lessons.find((l) => l.lesson === lessonNumber);
  const existing = slides.filter((s) => s.lesson === lessonNumber);
  if (existing.length > 0) return slides;

  const span = curriculumLessonDaySpan(lessonNumber, trackConfig.maxLessonNumber);
  const { globalStart, slideCount } = trackConfig.getSlideRange(lessonNumber, lessonMeta);
  const samples = (trackConfig.slideSamples ?? []).filter((s) => s.lesson === lessonNumber);
  const byGlobal = new Map(slides.map((s) => [`${s.lesson}-${s.globalIndex}`, s]));

  for (let i = 0; i < slideCount; i += 1) {
    const globalIndex = globalStart + i;
    const slideIndexInLesson = i + 1;
    const dayIndexInLesson = (i % span.dayCount) + 1;
    const key = `${lessonNumber}-${globalIndex}`;
    if (byGlobal.has(key)) continue;

    const sample = samples.find((s) => s.globalIndex === globalIndex);
    byGlobal.set(
      key,
      sample
        ? mapSampleSlide(sample, trackConfig, lessonNumber, dayIndexInLesson)
        : buildGeneratedSlide(trackConfig, lessonNumber, slideIndexInLesson, globalIndex, dayIndexInLesson),
    );
  }

  const others = slides.filter((s) => s.lesson !== lessonNumber);
  const lessonSlides = Array.from(byGlobal.values()).filter((s) => s.lesson === lessonNumber);
  return [...others, ...lessonSlides].sort(
    (a, b) => a.lesson - b.lesson || a.globalIndex - b.globalIndex,
  );
}

export function getSlidesForLessonDay(slides, lesson, dayIndexInLesson) {
  return slides
    .filter((s) => s.lesson === lesson && s.dayIndexInLesson === dayIndexInLesson)
    .sort((a, b) => a.globalIndex - b.globalIndex);
}

export function filterCurriculumSlides(slides, filters, trackConfig) {
  return slides.filter((s) => {
    if (filters.lesson !== 'all' && s.lesson !== Number(filters.lesson)) return false;
    if (filters.packageId !== 'all' && s.packageId !== filters.packageId) return false;
    if (filters.imageStatus !== 'all' && s.imageStatus !== filters.imageStatus) return false;
    if (filters.audioStatus !== 'all' && s.audioStatus !== filters.audioStatus) return false;
    if (filters.missingOnly && s.imageStatus === 'موجود' && s.audioStatus === 'موجود') return false;
    if (trackConfig.filterSlideExtra && !trackConfig.filterSlideExtra(s, filters)) return false;
    return true;
  });
}

export function createNewSlideForDay(slides, trackConfig, lessonNumber, dayIndexInLesson, draft) {
  const { imageFile, audioFile, pptxFile, title, durationSec, packageId } = draft;
  if (!imageFile && !audioFile) {
    return {
      error:
        'ارفع شريحة PowerPoint (.pptx) أو صورة PNG و/أو صوت (m4a) على الأقل قبل الحفظ.',
    };
  }

  const lessonSlides = slides.filter((s) => s.lesson === lessonNumber);
  const maxGlobal = lessonSlides.reduce((m, s) => Math.max(m, s.globalIndex), 0);
  const nextGlobal = maxGlobal + 1;
  const inDay = getSlidesForLessonDay(slides, lessonNumber, dayIndexInLesson);
  const slideIndexInLesson =
    inDay.length === 0 ? 1 : Math.max(...inDay.map((s) => s.slideIndex)) + 1;
  const pkg = packageId || trackConfig.defaultPackageId(lessonNumber);
  const padded = String(slideIndexInLesson).padStart(3, '0');
  const paths = trackConfig.buildAssetPaths(pkg, padded, nextGlobal);
  const hasImage = Boolean(imageFile);
  const hasAudio = Boolean(audioFile);

  return {
    slide: {
      id: `${trackConfig.trackId}_l${lessonNumber}_new_${Date.now()}`,
      lesson: lessonNumber,
      globalIndex: nextGlobal,
      slideIndex: slideIndexInLesson,
      dayIndexInLesson,
      packageId: pkg,
      title: title?.trim() || `شريحة ${slideIndexInLesson}`,
      assetPath: hasImage ? paths.png : '',
      audioPath: hasAudio ? paths.audio : '',
      durationSec: Number(durationSec) > 0 ? Number(durationSec) : 45,
      imageFile: imageFile ?? null,
      audioFile: audioFile ?? null,
      imageStatus: hasImage ? 'موجود' : 'ناقص',
      audioStatus: hasAudio ? 'موجود' : 'ناقص',
      pptxSource: pptxFile ?? null,
      mediaUploadMode: pptxFile ? 'pptx' : 'separate',
    },
  };
}

export function attachSlideMedia(slide, { imageFile, audioFile, pptxBundle }) {
  const next = { ...slide };

  if (pptxBundle) {
    const { pptxFile, imageFile: img, audioFile: aud } = pptxBundle;
    if (pptxFile) next.pptxSource = pptxFile;
    if (img) {
      next.imageFile = img;
      next.imageStatus = 'موجود';
      if (!next.assetPath?.trim()) {
        next.assetPath = slide.assetPath || `assets/.../${img.name}`;
      }
    }
    if (aud) {
      next.audioFile = aud;
      next.audioStatus = 'موجود';
      if (!next.audioPath?.trim()) {
        next.audioPath = slide.audioPath || `assets/.../audio/${aud.name}`;
      }
    }
    next.mediaUploadMode = 'pptx';
    return next;
  }

  if (imageFile) {
    next.imageFile = imageFile;
    next.imageStatus = 'موجود';
    if (!next.assetPath?.trim()) {
      next.assetPath = slide.assetPath || `assets/.../${imageFile.name}`;
    }
  }
  if (audioFile) {
    next.audioFile = audioFile;
    next.audioStatus = 'موجود';
    if (!next.audioPath?.trim()) {
      next.audioPath = slide.audioPath || `assets/.../audio/${audioFile.name}`;
    }
  }
  return next;
}

/** للتوافق مع تسمية القرآن في breadcrumb الطويل */
export { quranDayLabel as curriculumGlobalDayLabel };
