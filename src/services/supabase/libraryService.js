import {
  contentLibraryHubTabs,
  getCategoryMeta,
} from '../../data/contentLibraryAdmin';
import { activityAgeGroups, exerciseAgeGroups } from '../../data/mockData';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const LIBRARY_TABLE = 'library_items';
const AGE_GROUPS_TABLE = 'age_hub_groups';
const AGE_ITEMS_TABLE = 'age_hub_items';

const REQUEST_TIMEOUT_MS = 20000;

function withTimeout(request) {
  return Promise.race([
    request,
    new Promise((resolve) => {
      setTimeout(
        () => resolve({ data: null, error: new Error('request_timeout') }),
        REQUEST_TIMEOUT_MS,
      );
    }),
  ]);
}

/** Exercise and activity groups share ids (age_0_3…) but age_hub_groups.id is a single-column PK. */
const EXERCISE_DB_PREFIX = 'ex_';

function groupIdToDb(groupId, hubType) {
  if (hubType !== 'exercises' || groupId.startsWith(EXERCISE_DB_PREFIX)) return groupId;
  return `${EXERCISE_DB_PREFIX}${groupId}`;
}

function groupIdFromDb(dbId, hubType) {
  if (hubType === 'exercises' && dbId.startsWith(EXERCISE_DB_PREFIX)) {
    return dbId.slice(EXERCISE_DB_PREFIX.length);
  }
  return dbId;
}

function defaultAgeHubGroups(hubType) {
  const source = hubType === 'exercises' ? exerciseAgeGroups : activityAgeGroups;
  return source.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: g.subtitle ?? '',
    parentNote: g.parentNote ?? '',
    items: [],
  }));
}

const PUBLISH_TO_DB = {
  منشور: 'published',
  published: 'published',
  مسودة: 'draft',
  draft: 'draft',
  'قيد المراجعة': 'review',
  review: 'review',
  مؤرشف: 'archived',
  archived: 'archived',
};

const PUBLISH_FROM_DB = {
  published: 'منشور',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  archived: 'مؤرشف',
};

function publishToDb(value) {
  return PUBLISH_TO_DB[value] ?? 'draft';
}

function publishFromDb(value) {
  return PUBLISH_FROM_DB[value] ?? 'مسودة';
}

function tabMeta(tabId) {
  return contentLibraryHubTabs.find((t) => t.id === tabId);
}

export function rowToMediaItem(row) {
  const cat = getCategoryMeta(row.category_id);
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryTitle: cat.title,
    title: row.title,
    videoId: row.video_id,
    playlistId: row.playlist_id,
    duration: row.duration_label ?? '—',
    moodTag: row.mood_tag ?? '—',
    natureChip: row.nature_chip,
    coverUrl: row.cover_url ?? null,
    videoUrl: row.video_url ?? null,
    itemType: row.item_type ?? 'video',
    linkStatus: row.link_status ?? 'سليم',
    publishStatus: publishFromDb(row.publish_status),
    showsWhen: `المكتبة > ${cat.title}`,
  };
}

export function adminItemToRow(item, tabId) {
  const meta = tabMeta(tabId);
  const videoId = item.videoId?.trim() || null;
  const playlistId = item.playlistId?.trim() || null;

  return {
    id: item.id,
    category_id: tabId,
    title: item.title,
    video_id: videoId,
    playlist_id: playlistId,
    duration_label: item.duration ?? '—',
    mood_tag: item.moodTag ?? '—',
    nature_chip: tabId === 'nature' ? item.natureChip ?? null : null,
    cover_url: item.coverUrl || null,
    video_url: item.videoUrl || null,
    item_type: item.itemType ?? (playlistId && !videoId ? 'playlist' : 'video'),
    link_status: item.linkStatus ?? 'سليم',
    hub_kind: 'media',
    app_menu_id: meta?.appMenuId ?? null,
    sort_order: item.sortOrder ?? 0,
    publish_status: publishToDb(item.publishStatus ?? 'منشور'),
  };
}

export function ageHubGroupToRow(group, hubType, sortOrder) {
  return {
    id: groupIdToDb(group.id, hubType),
    hub_type: hubType,
    title: group.title,
    subtitle: group.subtitle ?? null,
    parent_note: group.parentNote ?? null,
    sort_order: sortOrder,
    publish_status: 'published',
  };
}

export function ageHubItemToRow(item, groupId, sortOrder, hubType) {
  const videoId = item.videoId?.trim() || null;
  const playlistId = item.playlistId?.trim() || null;

  return {
    id: item.id,
    group_id: groupIdToDb(groupId, hubType),
    title: item.title,
    video_id: videoId,
    playlist_id: playlistId,
    mood_tag: item.moodTag ?? '—',
    cover_url: item.coverUrl || null,
    video_url: item.videoUrl || null,
    item_type: playlistId && !videoId ? 'playlist' : 'video',
    sort_order: sortOrder,
    publish_status: publishToDb(item.publishStatus ?? 'منشور'),
  };
}

function rowToAgeHubItem(row) {
  return {
    id: row.id,
    title: row.title,
    videoId: row.video_id,
    playlistId: row.playlist_id,
    moodTag: row.mood_tag ?? '—',
    coverUrl: row.cover_url ?? null,
    videoUrl: row.video_url ?? null,
    publishStatus: publishFromDb(row.publish_status),
  };
}

function buildAgeHubGroups(groupRows, itemRows, hubType) {
  const remoteRows = groupRows
    .filter((g) => g.hub_type === hubType)
    .sort((a, b) => a.sort_order - b.sort_order);

  const remoteById = Object.fromEntries(
    remoteRows.map((g) => [groupIdFromDb(g.id, hubType), g]),
  );
  const defaults = defaultAgeHubGroups(hubType);
  const defaultIds = new Set(defaults.map((g) => g.id));

  const groups = [
    ...defaults.map((g) => {
      const remote = remoteById[g.id];
      if (!remote) return g;
      return {
        ...g,
        title: remote.title ?? g.title,
        subtitle: remote.subtitle ?? g.subtitle,
        parentNote: remote.parent_note ?? g.parentNote,
      };
    }),
    ...remoteRows
      .filter((g) => !defaultIds.has(groupIdFromDb(g.id, hubType)))
      .map((g) => ({
        id: groupIdFromDb(g.id, hubType),
        title: g.title,
        subtitle: g.subtitle ?? '',
        parentNote: g.parent_note ?? '',
        items: [],
      })),
  ];

  const groupMap = Object.fromEntries(groups.map((g) => [groupIdToDb(g.id, hubType), g]));

  itemRows
    .filter((item) => groupMap[item.group_id])
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((item) => {
      groupMap[item.group_id].items.push(rowToAgeHubItem(item));
    });

  return groups;
}

function buildStateFromRows(libraryRows, groupRows, itemRows) {
  const mediaItems = [];
  const libraryBooksItems = [];

  libraryRows.forEach((row) => {
    const item = rowToMediaItem(row);
    if (row.category_id === 'library_books') {
      libraryBooksItems.push(item);
    } else {
      mediaItems.push(item);
    }
  });

  return {
    mediaItems,
    libraryBooksItems,
    exerciseGroups: buildAgeHubGroups(groupRows, itemRows, 'exercises'),
    activityGroups: buildAgeHubGroups(groupRows, itemRows, 'activities'),
  };
}

export async function loadContentLibraryState() {
  if (!isSupabaseEnabled || !supabase) {
    return { state: null, error: null, offline: true };
  }

  const [libraryRes, groupsRes, itemsRes] = await Promise.all([
    supabase.from(LIBRARY_TABLE).select('*').order('sort_order'),
    supabase.from(AGE_GROUPS_TABLE).select('*').order('sort_order'),
    supabase.from(AGE_ITEMS_TABLE).select('*').order('sort_order'),
  ]);

  const error = libraryRes.error ?? groupsRes.error ?? itemsRes.error;
  if (error) return { state: null, error, offline: false };

  const libraryRows = libraryRes.data ?? [];
  const groupRows = groupsRes.data ?? [];
  const itemRows = itemsRes.data ?? [];

  if (libraryRows.length === 0 && groupRows.length === 0 && itemRows.length === 0) {
    return { state: null, error: null, offline: false };
  }

  return {
    state: buildStateFromRows(libraryRows, groupRows, itemRows),
    error: null,
    offline: false,
  };
}

export async function upsertLibraryItem(row) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const { data, error } = await withTimeout(
    supabase.from(LIBRARY_TABLE).upsert(row, { onConflict: 'id' }).select().single(),
  );

  return { data, error, offline: false };
}

export async function deleteLibraryItem(id) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await withTimeout(supabase.from(LIBRARY_TABLE).delete().eq('id', id));
  return { error, offline: false };
}

export async function upsertAgeHubGroup(row) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await withTimeout(
    supabase.from(AGE_GROUPS_TABLE).upsert(row, { onConflict: 'id' }),
  );
  return { error, offline: false };
}

export async function upsertAgeHubItem(row) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await withTimeout(
    supabase.from(AGE_ITEMS_TABLE).upsert(row, { onConflict: 'id' }),
  );
  return { error, offline: false };
}

export async function deleteAgeHubItemById(id) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await withTimeout(supabase.from(AGE_ITEMS_TABLE).delete().eq('id', id));
  return { error, offline: false };
}

const VIDEO_BUCKET = 'library-videos';

export async function uploadLibraryVideo(file) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase غير مفعّل') };
  }
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'video/mp4',
  });
  if (error) return { data: null, error };
  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return { data: { url: data.publicUrl }, error: null };
}

export function translateLibrarySaveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('video_url') || m.includes('bucket not found')) {
    return 'رفع الفيديو غير مفعّل بعد — شغّلي migration 20260526100018_uploaded_media_videos.sql في Supabase SQL Editor.';
  }
  if (m.includes('exceeded the maximum allowed size') || m.includes('payload too large')) {
    return 'حجم الفيديو أكبر من المسموح في Supabase — ارفعي فيديو أصغر أو زوّدي حد الرفع من إعدادات Storage.';
  }
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor في profiles.';
  }
  if (m.includes('duplicate key') || m.includes('unique constraint')) {
    return 'معرّف العنصر مستخدم مسبقاً.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي الحفظ.';
  }
  if (m.includes('request_timeout')) {
    return 'انتهت مهلة الاتصال بـ Supabase — أعيدي تحميل الصفحة (F5) وجربي الحفظ مرة أخرى.';
  }
  if (m.includes('cover_url')) {
    return 'عمود صورة الخلفية غير موجود — شغّلي migration 20260526100017_media_cover_images.sql في Supabase SQL Editor.';
  }
  if (m.includes('library_items_youtube_check') || m.includes('age_hub_items_youtube_check')) {
    return 'يجب إدخال رابط YouTube أو رفع ملف فيديو قبل الحفظ.';
  }
  return message;
}
