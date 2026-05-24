import { getAgeGroupLabel as getActivityAge } from './activityExerciseEditor';
import { getAgeGroupLabel as getAssessmentAge } from './assessmentBuilder';
import { getArticleTemplate } from './articleEditor';
import {
  buildPlacementLabel,
  getLullabyYoutubeMock,
  getYoutubeThumbnailUrl,
  libraryTargetAgeOptions,
} from './libraryContentEditor';
import { getSectionLabel } from './activityExerciseEditor';

export const appPreviewContentTypes = [
  { id: 'article', label: 'مقال' },
  { id: 'library_video', label: 'فيديو مكتبة' },
  { id: 'activity', label: 'نشاط' },
  { id: 'exercise', label: 'تمرين' },
  { id: 'lesson', label: 'درس' },
  { id: 'slide', label: 'شريحة' },
  { id: 'assessment_question', label: 'سؤال تقييم' },
  { id: 'notification', label: 'إشعار' },
];

export const appPreviewTabs = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'section', label: 'القسم المختار' },
  { id: 'detail', label: 'شاشة التفاصيل' },
];

export function createEmptyAppPreview(overrides = {}) {
  return {
    contentType: 'article',
    title: '',
    subtitle: '',
    bodyPreview: '',
    imageUrl: null,
    ageLabel: '',
    section: '',
    placement: '',
    status: 'مسودة',
    ...overrides,
  };
}

export function getAppPreviewWarnings(preview) {
  const warnings = [];
  if (!preview.imageUrl) {
    warnings.push({ id: 'noImage', message: 'لا توجد صورة — المعاينة تعرض placeholder.' });
  }
  if (!preview.section?.trim() && !preview.placement?.trim()) {
    warnings.push({ id: 'noPlacement', message: 'لا يوجد مكان ظهور محدد.' });
  }
  if (!preview.ageLabel?.trim() || preview.ageLabel === '—') {
    warnings.push({ id: 'noAge', message: 'لا يوجد عمر مستهدف.' });
  }
  return warnings;
}

export function getContentTypeLabel(contentType) {
  return appPreviewContentTypes.find((t) => t.id === contentType)?.label ?? contentType;
}

export function fromArticle(article) {
  const firstBlock = article.blocks?.find((b) => b.text?.trim()) ?? article.blocks?.[0];
  const bodyPreview =
    firstBlock?.type === 'list'
      ? firstBlock.items?.filter(Boolean).join(' · ')
      : firstBlock?.text ?? '';

  return createEmptyAppPreview({
    contentType: 'article',
    title: article.title,
    subtitle: article.subtitle,
    bodyPreview: bodyPreview.slice(0, 120),
    imageUrl: null,
    ageLabel: article.ageLabel || article.targetAudience,
    section: article.templateLabel || article.placement?.split('>')[0]?.trim(),
    placement: article.placement,
    status: article.publishStatus,
  });
}

export function fromLibraryContent(content) {
  return createEmptyAppPreview({
    contentType: 'library_video',
    title: content.title,
    subtitle: content.moodTag,
    bodyPreview: `YouTube · ${content.duration || '—'}`,
    imageUrl: getYoutubeThumbnailUrl(content.videoId),
    ageLabel:
      libraryTargetAgeOptions.find((a) => a.id === content.targetAgeId)?.label ?? content.targetAgeId,
    section: buildPlacementLabel(content.categoryId).replace('المكتبة > ', 'المكتبة · '),
    placement: buildPlacementLabel(content.categoryId),
    status: content.publishStatus,
  });
}

export function fromActivityExercise(item) {
  return createEmptyAppPreview({
    contentType: item.itemType === 'exercise' ? 'exercise' : 'activity',
    title: item.title,
    subtitle: item.moodTag,
    bodyPreview: item.description?.slice(0, 100) ?? '',
    imageUrl: getYoutubeThumbnailUrl(item.videoId),
    ageLabel: getActivityAge(item.ageGroupId),
    section: getSectionLabel(item.itemType),
    placement: `${getSectionLabel(item.itemType)} > MediaAgeHub`,
    status: item.publishStatus,
  });
}

export function fromLesson(lesson) {
  return createEmptyAppPreview({
    contentType: 'lesson',
    title: lesson.title ?? lesson.lessonTitle,
    subtitle: lesson.goal,
    bodyPreview: `${lesson.slideCount ?? 0} شرائح · ${lesson.trackLabel ?? lesson.track}`,
    imageUrl: null,
    ageLabel: lesson.ageLabel ?? 'حسب المسار',
    section: lesson.trackLabel ?? 'المنهج',
    placement: lesson.trackLabel,
    status: lesson.publishStatus ?? 'مسودة',
  });
}

export function fromSlide(slide) {
  return createEmptyAppPreview({
    contentType: 'slide',
    title: `شريحة #${slide.slideIndexInLesson ?? slide.globalIndex}`,
    subtitle: slide.packageId,
    bodyPreview: slide.motherInstructions || slide.altText,
    imageUrl: slide.mainImage ? 'mock://slide-image' : null,
    ageLabel: 'حسب المسار',
    section: slide.track === 'math' ? 'الحساب' : slide.track === 'visual' ? 'التحفيز البصري' : 'الذكاء العاطفي',
    placement: `${slide.track} · pkg ${slide.packageId}`,
    status: slide.fileStatus,
  });
}

export function fromAssessmentQuestion(question, assessment) {
  return createEmptyAppPreview({
    contentType: 'assessment_question',
    title: question.text?.slice(0, 60) || 'سؤال تقييم',
    subtitle: question.axis,
    bodyPreview: question.text,
    imageUrl: null,
    ageLabel: getAssessmentAge(question.ageGroupId),
    section: assessment?.name ?? 'التقييمات',
    placement: 'تقييمنا',
    status: assessment?.publishStatus ?? 'مسودة',
  });
}

export function fromNotification(notification) {
  return createEmptyAppPreview({
    contentType: 'notification',
    title: notification.title,
    subtitle: notification.type,
    bodyPreview: notification.body,
    imageUrl: null,
    ageLabel: notification.targetAgeId === 'all' ? 'كل الأعمار' : notification.targetAgeId,
    section: notification.linkedSection,
    placement: notification.linkedSection,
    status: notification.publishStatus,
  });
}

/** مثال: مقال من CMS mock */
export function getArticlePreviewExample() {
  return fromArticle(getArticleTemplate('curriculum'));
}

/** مثال: فيديو تهويدات */
export function getLibraryVideoPreviewExample() {
  return fromLibraryContent(getLullabyYoutubeMock());
}

/** أمثلة ثابتة لكل الأنواع — صفحة العرض */
export function getAllPreviewExamples() {
  const article = getArticlePreviewExample();
  const library = getLibraryVideoPreviewExample();
  return {
    article,
    library_video: library,
    activity: createEmptyAppPreview({
      contentType: 'activity',
      title: 'لعب إبداعي (9–36 شهر)',
      subtitle: 'لعب مشترك',
      bodyPreview: 'نشاط MediaAgeHub — playlist mock',
      imageUrl: null,
      ageLabel: '9-36 شهر',
      section: 'الأنشطة',
      placement: 'الأنشطة > MediaAgeHub',
      status: 'منشور',
    }),
    exercise: createEmptyAppPreview({
      contentType: 'exercise',
      title: 'تمرين 4-6 أشهر',
      imageUrl: getYoutubeThumbnailUrl('puUzPozUdP0'),
      ageLabel: '4-6 أشهر',
      section: 'الرياضة',
      placement: 'الرياضة > tamareen',
      status: 'مسودة',
    }),
    lesson: createEmptyAppPreview({
      contentType: 'lesson',
      title: 'درس 12 — الحساب',
      subtitle: 'عدّ خرزات',
      bodyPreview: '5 شرائح · يوم 56',
      ageLabel: '6-12 شهر',
      section: 'الحساب',
      placement: 'الحساب > مسار الدرس',
      status: 'منشور',
    }),
    slide: createEmptyAppPreview({
      contentType: 'slide',
      title: 'شريحة g237',
      bodyPreview: 'PNG + m4a mock',
      imageUrl: 'mock://slide',
      ageLabel: 'حسب المسار',
      section: 'الحساب',
      placement: 'math · q_129_132',
      status: 'ناقص',
    }),
    assessment_question: createEmptyAppPreview({
      contentType: 'assessment_question',
      title: 'هل يقف مع دعم؟',
      bodyPreview: 'نعم / لا — النمو البدني',
      ageLabel: '6-12 شهر',
      section: 'التقييمات',
      placement: 'تقييمنا > اختبار القدرات',
      status: 'مسودة',
    }),
    notification: createEmptyAppPreview({
      contentType: 'notification',
      title: 'حان وقت جلسة القرآن 🌙',
      bodyPreview: '5 دقائق تكفي لختمة جميلة.',
      ageLabel: 'كل الأعمار',
      section: 'القرآن',
      placement: 'القرآن + push',
      status: 'مجدول',
    }),
  };
}
