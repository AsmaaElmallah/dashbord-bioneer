import { mathSlideSamples } from './mockData';
import { lessonTracks } from './lessonBuilder';

export { lessonTracks as slideTracks };

export const slidePackageOptions = {
  math: ['q_129_132', 'dot_numeric_133_136', 'beads_numeric', 'lesson_01_10'],
  visual: ['visual_src_01', 'visual_src_16', 'visual_src_18'],
  emotional: ['emotional_pkg_01', 'emotional_pkg_12', 'emotional_pkg_32'],
};

export const slideFileStatusOptions = ['موجود', 'ناقص', 'يحتاج مراجعة'];

export function createEmptySlideContent(overrides = {}) {
  return {
    track: 'math',
    packageId: 'q_129_132',
    slideIndexInLesson: 1,
    globalIndex: 1,
    mainImage: null,
    extraImages: [],
    audioFile: null,
    durationSec: '',
    altText: '',
    motherInstructions: '',
    tags: '',
    fileStatus: 'ناقص',
    ...overrides,
  };
}

export function getSlideValidation(slide) {
  const issues = [];
  if (!slide.mainImage) {
    issues.push({
      id: 'noImage',
      message: 'لا يمكن نشر الشريحة بدون صورة أساسية.',
      severity: 'error',
    });
  }
  if (!slide.audioFile) {
    issues.push({
      id: 'noAudio',
      message: 'يُفضّل إرفاق ملف صوت للشريحة (mock).',
      severity: 'warning',
    });
  }
  if (!slide.durationSec || Number(slide.durationSec) <= 0) {
    issues.push({
      id: 'noDuration',
      message: 'مدة الشريحة (durationSec) مطلوبة.',
      severity: 'error',
    });
  }
  return issues;
}

/** مثال: شريحة بصورة وبدون صوت — من mathSlideSamples slide_g237 */
export function getSlideMissingAudioMock() {
  const sample = mathSlideSamples.find((s) => s.audioStatus === 'ناقص') ?? mathSlideSamples[2];
  return createEmptySlideContent({
    track: 'math',
    packageId: sample.packageId,
    slideIndexInLesson: sample.slideIndex,
    globalIndex: sample.globalIndex,
    mainImage: {
      name: sample.assetPath.split('/').pop(),
      sizeMock: '842 KB',
      notUploaded: true,
    },
    audioFile: null,
    durationSec: sample.durationSec,
    altText: 'شريحة حساب عددي — خرزات',
    motherInstructions: 'اشرحي للطفل بهدوء وكرري إذا لزم.',
    tags: 'حساب, خرزات',
    fileStatus: 'ناقص',
  });
}

export function fileLabel(file) {
  if (!file) return '—';
  return typeof file === 'string' ? file : file.name;
}
