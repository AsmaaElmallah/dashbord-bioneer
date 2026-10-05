import { activityAgeGroups, exerciseAgeGroups, libraryMediaItems, libraryTabs } from './mockData';

const CATEGORY_META = {
  nature: { id: 'nature', title: 'أصوات الطبيعة' },
  calm: { id: 'calm', title: 'موسيقى هادئة' },
  lullabies: { id: 'lullabies', title: 'تهويدات' },
  library_books: { id: 'library_books', title: 'المكتبة' },
};

export function getCategoryMeta(categoryId) {
  return CATEGORY_META[categoryId] ?? { id: categoryId, title: categoryId };
}

/** تبويبات إدارة المحتوى — مكتبة المحتوى + الرياضة (من الرئيسية) */
export const contentLibraryHubTabs = [
  { id: 'exercises', title: 'الرياضة', appMenuId: 'baby_exercises', hubKind: 'age' },
  { id: 'activities', title: 'الأنشطة', appMenuId: 'activities', hubKind: 'age' },
  { id: 'nature', title: 'صوت الطبيعة', appMenuId: 'nature_sounds', hubKind: 'media' },
  { id: 'calm', title: 'موسيقى هادئة', appMenuId: 'calm_music', hubKind: 'media' },
  { id: 'lullabies', title: 'تهويدات', appMenuId: 'lullabies', hubKind: 'media' },
];

export function isAgeHubTab(tabId) {
  const tab = contentLibraryHubTabs.find((t) => t.id === tabId);
  return tab?.hubKind === 'age';
}

export function getAgeHubStateKey(tabId) {
  return tabId === 'exercises' ? 'exerciseGroups' : 'activityGroups';
}

const MEDIA_CATEGORY_IDS = new Set(['nature', 'calm', 'lullabies', 'library_books']);

export const natureChipOptions = [
  { id: 'rain', label: 'مطر' },
  { id: 'forest', label: 'غابة' },
  { id: 'ocean', label: 'محيط' },
  { id: 'wind', label: 'رياح' },
];

/** مطابق لـ parseYoutubeLink في exercises_catalog.dart (قائمة · shorts · youtu.be) */
/** معرّف فيديو واحد فقط — يقبل روابط watch حتى لو فيها list. */
export function parseYoutubeVideoId(input) {
  const raw = (input ?? '').trim();
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const v = url.searchParams.get('v');
    if (v) return v;
  } catch {
    /* not a URL */
  }
  return parseYoutubeInput(raw).videoId || '';
}

export function parseYoutubeInput(input) {
  const raw = (input ?? '').trim();
  if (!raw) return { videoId: '', playlistId: '', error: null };

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return { videoId: raw, playlistId: '', error: null };
  }
  if (/^PL[\w-]+$/i.test(raw)) {
    return { videoId: '', playlistId: raw, error: null };
  }

  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    const list = url.searchParams.get('list');
    if (list) {
      return { videoId: '', playlistId: list, error: null };
    }

    const segments = url.pathname.split('/').filter(Boolean);
    if (url.hostname.includes('youtu.be') && segments[0]) {
      return { videoId: segments[0], playlistId: '', error: null };
    }

    const shortsIdx = segments.indexOf('shorts');
    if (shortsIdx >= 0 && segments[shortsIdx + 1]) {
      return { videoId: segments[shortsIdx + 1], playlistId: '', error: null };
    }

    const videoId = url.searchParams.get('v') ?? '';
    if (videoId) {
      return { videoId, playlistId: '', error: null };
    }

    return { videoId: '', playlistId: '', error: 'لم يُعثر على videoId أو playlistId في الرابط.' };
  } catch {
    return { videoId: '', playlistId: '', error: 'رابط YouTube غير صالح.' };
  }
}

function libRow(row) {
  const categoryId = row.categoryId;
  const cat = getCategoryMeta(categoryId);
  const videoId = row.videoId?.trim() || null;
  const playlistId = row.playlistId?.trim() || null;
  const itemType = playlistId && !videoId ? 'playlist' : 'video';
  return {
    id: row.id,
    categoryId,
    categoryTitle: cat.title,
    title: row.title,
    videoId,
    playlistId,
    duration: row.duration ?? '—',
    moodTag: row.moodTag ?? '—',
    natureChip: row.natureChip ?? null,
    coverUrl: row.coverUrl ?? null,
    videoUrl: row.videoUrl ?? null,
    itemType,
    linkStatus: row.linkStatus ?? 'سليم',
    publishStatus: row.publishStatus ?? 'منشور',
    showsWhen: `المكتبة > ${cat.title}`,
  };
}

export function buildInitialContentLibraryState() {
  const mediaItems = libraryMediaItems
    .filter((i) => MEDIA_CATEGORY_IDS.has(i.categoryId))
    .map((i) => ({ ...i }));

  const activityGroups = activityAgeGroups.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: g.subtitle,
    parentNote: g.parentNote,
    items: g.items.map((item) => ({ ...item })),
  }));

  const exerciseGroups = exerciseAgeGroups.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: g.subtitle,
    parentNote: g.parentNote,
    items: g.items.map((item) => ({ ...item })),
  }));

  const libraryBooksItems = [
    libRow({
      id: 'books_placeholder_1',
      categoryId: 'library_books',
      title: 'قصص قبل النوم (مثال)',
      videoId: null,
      playlistId: null,
      duration: '—',
      moodTag: 'قصص',
      publishStatus: 'مسودة',
      linkStatus: 'يحتاج مراجعة',
    }),
  ];

  return { mediaItems, activityGroups, exerciseGroups, libraryBooksItems };
}

export function getAgeHubGroups(state, tabId) {
  return tabId === 'exercises' ? state.exerciseGroups : state.activityGroups;
}

export function getMediaItemsForTab(state, tabId) {
  if (tabId === 'library_books') return state.libraryBooksItems;
  return state.mediaItems.filter((i) => i.categoryId === tabId);
}

/** مصدر الفيديو من المسودة: رابط YouTube (فيديو / playlist) أو ملف مرفوع. */
export function resolveVideoSource(draft) {
  if (draft.sourceType === 'upload') {
    const videoUrl = draft.videoUrl?.trim();
    if (!videoUrl) return { error: 'ارفعي ملف الفيديو أولاً.' };
    return { videoId: null, playlistId: null, videoUrl };
  }

  const parsed = parseYoutubeInput(draft.youtubeInput);
  if (parsed.error) return { error: parsed.error };

  let videoId = parsed.videoId || null;
  let playlistId = parsed.playlistId || null;
  if (draft.contentType === 'playlist') {
    if (!playlistId) return { error: 'أدخل رابط playlist أو playlistId.' };
    videoId = null;
  } else {
    if (!videoId) return { error: 'أدخل رابط فيديو YouTube أو اختاري "رفع فيديو".' };
    playlistId = null;
  }
  return { videoId, playlistId, videoUrl: null };
}

export function createMediaItem(tabId, draft) {
  const { title, duration, moodTag, natureChip, coverUrl } = draft;
  if (!title?.trim()) return { error: 'العنوان مطلوب.' };

  const source = resolveVideoSource(draft);
  if (source.error) return { error: source.error };
  const { videoId, playlistId, videoUrl } = source;

  const categoryId = tabId;
  const cat = contentLibraryHubTabs.find((t) => t.id === categoryId);
  const prefix = categoryId === 'library_books' ? 'books' : categoryId;
  const id = `${prefix}_${videoId ?? playlistId ?? 'upload'}_${Date.now()}`;

  const item = libRow({
    id,
    categoryId,
    title: title.trim(),
    videoId,
    playlistId,
    videoUrl,
    duration: duration?.trim() || '—',
    moodTag: moodTag?.trim() || '—',
    natureChip: categoryId === 'nature' ? natureChip || 'rain' : null,
    coverUrl: coverUrl || null,
    publishStatus: 'منشور',
    linkStatus: 'سليم',
  });

  return { item, showsInApp: cat?.appMenuId ?? categoryId };
}

export function updateMediaItem(items, itemId, patch) {
  return items.map((i) => (i.id === itemId ? { ...i, ...patch } : i));
}

export function deleteMediaItem(items, itemId) {
  return items.filter((i) => i.id !== itemId);
}

export function createAgeHubItem(groups, ageGroupId, draft, options) {
  const { idPrefix, moodVideo = 'تمرين', moodPlaylist = 'قائمة' } = options;
  const { title, moodTag, coverUrl } = draft;
  const group = groups.find((g) => g.id === ageGroupId);
  if (!group) return { error: 'اختر فئة عمرية.' };
  if (!title?.trim()) return { error: 'العنوان مطلوب.' };

  const source = resolveVideoSource(draft);
  if (source.error) return { error: source.error };
  const { videoId, playlistId, videoUrl } = source;

  const id = `${idPrefix}_${ageGroupId}_${Date.now()}`;
  const item = {
    id,
    title: title.trim(),
    videoId,
    playlistId,
    videoUrl,
    moodTag: moodTag?.trim() || (playlistId ? moodPlaylist : moodVideo),
    coverUrl: coverUrl || null,
  };

  return {
    groups: groups.map((g) =>
      g.id === ageGroupId ? { ...g, items: [...g.items, item] } : g,
    ),
    item,
  };
}

export function createActivityItem(groups, ageGroupId, draft) {
  return createAgeHubItem(groups, ageGroupId, draft, {
    idPrefix: 'act',
    moodVideo: 'نشاط',
    moodPlaylist: 'قائمة',
  });
}

export function createExerciseItem(groups, ageGroupId, draft) {
  return createAgeHubItem(groups, ageGroupId, draft, {
    idPrefix: 'ex',
    moodVideo: 'تمرين',
    moodPlaylist: 'قائمة',
  });
}

export function deleteAgeHubItem(groups, ageGroupId, itemId) {
  return groups.map((g) =>
    g.id === ageGroupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g,
  );
}

export function deleteActivityItem(groups, ageGroupId, itemId) {
  return deleteAgeHubItem(groups, ageGroupId, itemId);
}

export function deleteExerciseItem(groups, ageGroupId, itemId) {
  return deleteAgeHubItem(groups, ageGroupId, itemId);
}

export function updateAgeHubItem(groups, ageGroupId, itemId, patch) {
  return groups.map((g) =>
    g.id === ageGroupId
      ? {
          ...g,
          items: g.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
        }
      : g,
  );
}

export function updateMediaItemInState(state, tabId, itemId, patch) {
  if (tabId === 'library_books') {
    return {
      ...state,
      libraryBooksItems: updateMediaItem(state.libraryBooksItems, itemId, patch),
    };
  }
  return {
    ...state,
    mediaItems: updateMediaItem(state.mediaItems, itemId, patch),
  };
}

export function buildMediaItemPatchFromDraft(draft, tabId) {
  const source = resolveVideoSource(draft);
  if (source.error) return { error: source.error };
  const { videoId, playlistId, videoUrl } = source;

  const itemType = playlistId && !videoId ? 'playlist' : 'video';
  return {
    patch: {
      title: draft.title?.trim(),
      videoId,
      playlistId,
      videoUrl,
      duration: draft.duration?.trim() || '—',
      moodTag: draft.moodTag?.trim() || '—',
      natureChip: tabId === 'nature' ? draft.natureChip : null,
      coverUrl: draft.coverUrl || null,
      itemType,
    },
  };
}

export function buildAgeHubItemPatchFromDraft(draft, { isExercise = false } = {}) {
  const source = resolveVideoSource(draft);
  if (source.error) return { error: source.error };
  const { videoId, playlistId, videoUrl } = source;

  return {
    patch: {
      title: draft.title?.trim(),
      videoId,
      playlistId,
      videoUrl,
      moodTag:
        draft.moodTag?.trim() ||
        (playlistId ? 'قائمة' : isExercise ? 'تمرين' : 'نشاط'),
      coverUrl: draft.coverUrl || null,
    },
  };
}

export function mergeMediaState(state, tabId, newItem) {
  if (tabId === 'library_books') {
    return { ...state, libraryBooksItems: [...state.libraryBooksItems, newItem] };
  }
  return { ...state, mediaItems: [...state.mediaItems, newItem] };
}

export function removeMediaFromState(state, tabId, itemId) {
  if (tabId === 'library_books') {
    return {
      ...state,
      libraryBooksItems: deleteMediaItem(state.libraryBooksItems, itemId),
    };
  }
  return {
    ...state,
    mediaItems: deleteMediaItem(state.mediaItems, itemId),
  };
}

/** للتوافق مع libraryTabs القديمة */
export { libraryTabs };
