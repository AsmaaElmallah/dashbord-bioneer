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
  { id: 'library_books', title: 'المكتبة', appMenuId: 'library_books', hubKind: 'media' },
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

export function createMediaItem(tabId, draft) {
  const { title, youtubeInput, duration, moodTag, natureChip, contentType } = draft;
  if (!title?.trim()) return { error: 'العنوان مطلوب.' };

  const parsed = parseYoutubeInput(youtubeInput);
  if (parsed.error) return { error: parsed.error };

  let videoId = parsed.videoId;
  let playlistId = parsed.playlistId;

  if (contentType === 'video' && !videoId) {
    return { error: 'أدخل رابط فيديو أو videoId.' };
  }
  if (contentType === 'playlist' && !playlistId) {
    return { error: 'أدخل رابط playlist أو playlistId.' };
  }
  if (contentType === 'video') playlistId = null;
  if (contentType === 'playlist') videoId = null;

  if (!videoId && !playlistId) {
    return { error: 'يجب videoId أو playlistId على الأقل.' };
  }

  const categoryId = tabId;
  const cat = contentLibraryHubTabs.find((t) => t.id === categoryId);
  const prefix = categoryId === 'library_books' ? 'books' : categoryId;
  const id = `${prefix}_${videoId ?? playlistId}_${Date.now()}`;

  const item = libRow({
    id,
    categoryId,
    title: title.trim(),
    videoId,
    playlistId,
    duration: duration?.trim() || '—',
    moodTag: moodTag?.trim() || '—',
    natureChip: categoryId === 'nature' ? natureChip || 'rain' : null,
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
  const { title, youtubeInput, moodTag, contentType } = draft;
  const group = groups.find((g) => g.id === ageGroupId);
  if (!group) return { error: 'اختر فئة عمرية.' };
  if (!title?.trim()) return { error: 'العنوان مطلوب.' };

  const parsed = parseYoutubeInput(youtubeInput);
  if (parsed.error) return { error: parsed.error };

  let videoId = parsed.videoId || null;
  let playlistId = parsed.playlistId || null;
  if (contentType === 'video') playlistId = null;
  if (contentType === 'playlist') videoId = null;
  if (!videoId && !playlistId) return { error: 'يجب رابط فيديو أو playlist.' };

  const id = `${idPrefix}_${ageGroupId}_${Date.now()}`;
  const item = {
    id,
    title: title.trim(),
    videoId,
    playlistId,
    moodTag: moodTag?.trim() || (playlistId ? moodPlaylist : moodVideo),
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
  const parsed = parseYoutubeInput(draft.youtubeInput);
  if (parsed.error) return { error: parsed.error };

  let videoId = parsed.videoId || null;
  let playlistId = parsed.playlistId || null;
  if (draft.contentType === 'video') playlistId = null;
  if (draft.contentType === 'playlist') videoId = null;
  if (!videoId && !playlistId) return { error: 'يجب رابط فيديو أو playlist.' };

  const itemType = playlistId && !videoId ? 'playlist' : 'video';
  return {
    patch: {
      title: draft.title?.trim(),
      videoId,
      playlistId,
      duration: draft.duration?.trim() || '—',
      moodTag: draft.moodTag?.trim() || '—',
      natureChip: tabId === 'nature' ? draft.natureChip : null,
      itemType,
    },
  };
}

export function buildAgeHubItemPatchFromDraft(draft, { isExercise = false } = {}) {
  const parsed = parseYoutubeInput(draft.youtubeInput);
  if (parsed.error) return { error: parsed.error };

  let videoId = parsed.videoId || null;
  let playlistId = parsed.playlistId || null;
  if (draft.contentType === 'video') playlistId = null;
  if (draft.contentType === 'playlist') videoId = null;
  if (!videoId && !playlistId) return { error: 'يجب رابط فيديو أو playlist.' };

  return {
    patch: {
      title: draft.title?.trim(),
      videoId,
      playlistId,
      moodTag:
        draft.moodTag?.trim() ||
        (playlistId ? 'قائمة' : isExercise ? 'تمرين' : 'نشاط'),
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
