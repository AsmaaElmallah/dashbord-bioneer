function formatSize(bytes) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mockFileFromInput(file) {
  if (!file) return null;
  return {
    name: file.name,
    sizeMock: formatSize(file.size),
    notUploaded: true,
    rawFile: file,
  };
}

/** محاكاة استخراج صورة + صوت من شريحة PowerPoint واحدة */
export function mockPptxSlideBundleFromInput(file) {
  if (!file) return null;
  const pptx = mockFileFromInput(file);
  if (!pptx) return null;

  const base = file.name.replace(/\.pptx$/i, '') || 'slide';
  const imageFile = {
    name: `${base}_slide.png`,
    sizeMock: '420 KB',
    notUploaded: true,
    extractedFrom: file.name,
    source: 'pptx',
  };
  const audioFile = {
    name: `${base}_narration.m4a`,
    sizeMock: '1.1 MB',
    notUploaded: true,
    extractedFrom: file.name,
    source: 'pptx',
  };

  return { pptxFile: pptx, imageFile, audioFile };
}

export function slideMediaReady(draft) {
  if (draft?.pptxFile && draft?.imageFile && draft?.audioFile) return true;
  return Boolean(draft?.imageFile || draft?.audioFile);
}

export const mockLinkedAssetCatalog = [
  { id: 'asset_cover_01', name: 'cover-bayanour.jpg', path: 'assets/covers/cover-bayanour.jpg', type: 'صورة' },
  { id: 'asset_slide_01', name: 'math-slide-05.png', path: 'assets/math/slides/math-slide-05.png', type: 'صورة' },
  { id: 'asset_audio_01', name: 'quran-session-12.m4a', path: 'assets/quran/audio/quran-session-12.m4a', type: 'صوت' },
  { id: 'asset_video_01', name: 'intro-lesson.mp4', path: 'assets/videos/intro-lesson.mp4', type: 'فيديو' },
];

export function createEmptyMediaUpload(overrides = {}) {
  return {
    coverImage: null,
    extraImages: [],
    audioFile: null,
    videoFile: null,
    youtubeVideoId: '',
    playlistId: '',
    duration: '',
    imageAlt: '',
    caption: '',
    sourceNote: '',
    linkedAssets: [],
    ...overrides,
  };
}

export function getMediaValidation(contentType, media) {
  const issues = [];
  const isYoutubeType = ['فيديو', 'تمرين', 'نشاط'].includes(contentType);

  if (isYoutubeType && !media.youtubeVideoId?.trim() && !media.playlistId?.trim()) {
    issues.push({
      id: 'youtube',
      message: 'فيديو YouTube يحتاج videoId أو playlistId على الأقل.',
    });
  }

  if (contentType === 'شريحة' && !media.coverImage && media.extraImages.length === 0) {
    issues.push({
      id: 'slideImage',
      message: 'الشريحة تحتاج صورة واحدة على الأقل (رئيسية أو إضافية).',
    });
  }

  const isAudioType = ['صوت', 'جلسة قرآن'].includes(contentType);
  if (isAudioType && !media.audioFile && !media.duration?.trim()) {
    issues.push({
      id: 'audio',
      message: 'الصوت يحتاج ملف صوت mock أو مدة محتوى.',
    });
  }

  return issues;
}

export function mediaFileLabel(file) {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.name ?? '';
}

export function mediaUploadSummary(media) {
  const parts = [];
  if (media.coverImage) parts.push(`غلاف: ${mediaFileLabel(media.coverImage)}`);
  if (media.extraImages?.length) parts.push(`صور: ${media.extraImages.length}`);
  if (media.audioFile) parts.push(`صوت: ${mediaFileLabel(media.audioFile)}`);
  if (media.videoFile) parts.push(`فيديو: ${mediaFileLabel(media.videoFile)}`);
  if (media.youtubeVideoId) parts.push(`YouTube: ${media.youtubeVideoId}`);
  if (media.playlistId) parts.push(`playlist: ${media.playlistId}`);
  return parts.length ? parts.join(' · ') : '—';
}

/** ترحيل من الحقول الم flat القديمة إن وُجدت */
export function mediaFromLegacyFields(wizard) {
  if (wizard.mediaUpload) return wizard.mediaUpload;
  const toFile = (name) => (name ? { name, sizeMock: '—', notUploaded: true } : null);
  return createEmptyMediaUpload({
    coverImage: toFile(wizard.coverImage),
    extraImages: (wizard.extraImages ?? []).map((n) => toFile(n)),
    audioFile: toFile(wizard.audioFile),
    videoFile: toFile(wizard.videoFile),
    youtubeVideoId: wizard.youtubeVideoId ?? '',
    playlistId: wizard.playlistId ?? '',
    duration: wizard.duration ?? '',
    imageAlt: wizard.imageAlt ?? '',
  });
}
