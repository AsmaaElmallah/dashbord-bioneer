import { contentWizardPlans, libraryMediaItems, libraryTabs, mediaAgeGroups } from './mockData';

export const libraryEditorCategories = [
  ...libraryTabs.filter((t) => t.id !== 'review'),
  { id: 'library_books', title: 'المكتبة' },
];

export const natureChipOptions = [
  { id: 'rain', label: 'مطر' },
  { id: 'forest', label: 'غابة' },
  { id: 'ocean', label: 'محيط' },
  { id: 'wind', label: 'رياح' },
];

export const libraryContentTypes = [
  { id: 'video', label: 'فيديو YouTube' },
  { id: 'playlist', label: 'Playlist' },
];

export const libraryLinkStatusOptions = ['سليم', 'يحتاج مراجعة', 'معطّل'];

export const libraryPublishStatusOptions = ['مسودة', 'منشور', 'يحتاج مراجعة'];

export const libraryTargetAgeOptions = [
  { id: 'all', label: 'كل الأعمار' },
  ...mediaAgeGroups.map((g) => ({ id: g.id, label: g.label })),
];

export function getCategoryMeta(categoryId) {
  return libraryEditorCategories.find((c) => c.id === categoryId) ?? libraryEditorCategories[0];
}

export function buildPlacementLabel(categoryId) {
  const cat = getCategoryMeta(categoryId);
  return `المكتبة > ${cat.title}`;
}

export function getYoutubeThumbnailUrl(videoId) {
  if (!videoId?.trim()) return null;
  return `https://img.youtube.com/vi/${videoId.trim()}/hqdefault.jpg`;
}

export function deriveItemType(content) {
  const hasVideo = Boolean(content.videoId?.trim());
  const hasPlaylist = Boolean(content.playlistId?.trim());
  if (hasPlaylist && !hasVideo) return 'playlist';
  if (hasVideo) return 'video';
  return content.contentType ?? 'video';
}

export function createEmptyLibraryContent(overrides = {}) {
  return {
    contentType: 'video',
    categoryId: 'lullabies',
    title: '',
    videoId: '',
    playlistId: '',
    duration: '',
    moodTag: '',
    natureChip: 'rain',
    linkStatus: 'سليم',
    targetAgeId: 'all',
    requiredPlan: 'بدون اشتراك',
    publishStatus: 'مسودة',
    ...overrides,
  };
}

export function getLibraryContentValidation(content) {
  const issues = [];
  const hasVideo = Boolean(content.videoId?.trim());
  const hasPlaylist = Boolean(content.playlistId?.trim());

  if (!hasVideo && !hasPlaylist) {
    issues.push({
      id: 'noYoutubeId',
      message: 'يجب إدخال videoId أو playlistId على الأقل.',
      severity: 'error',
    });
  }

  if (hasVideo && hasPlaylist) {
    issues.push({
      id: 'bothIds',
      message:
        'تم إدخال videoId و playlistId معاً — في التطبيق عادةً يُستخدم أحدهما؛ يمكنك إبقاء الاثنين للمراجعة فقط.',
      severity: 'info',
    });
  }

  if (!content.title?.trim()) {
    issues.push({
      id: 'noTitle',
      message: 'العنوان مطلوب قبل النشر.',
      severity: 'warning',
    });
  }

  if (content.categoryId === 'nature' && !content.natureChip) {
    issues.push({
      id: 'noNatureChip',
      message: 'أصوات الطبيعة تحتاج natureChip (مطر / غابة / محيط / رياح).',
      severity: 'warning',
    });
  }

  return issues;
}

/** مثال: تهويدة YouTube — من libraryMediaItems lullaby_1 */
export function getLullabyYoutubeMock() {
  const sample =
    libraryMediaItems.find((i) => i.id === 'lullaby_1') ??
    libraryMediaItems.find((i) => i.categoryId === 'lullabies');

  return createEmptyLibraryContent({
    contentType: 'video',
    categoryId: 'lullabies',
    title: sample?.title ?? 'أغنية الخروف الصغير',
    videoId: sample?.videoId ?? 'UHVcRjfufic',
    playlistId: '',
    duration: sample?.duration ?? '03:45',
    moodTag: sample?.moodTag ?? 'هادئة جداً',
    linkStatus: 'سليم',
    targetAgeId: 'all',
    requiredPlan: 'بدون اشتراك',
    publishStatus: 'مسودة',
  });
}

export { contentWizardPlans as libraryRequiredPlanOptions };
