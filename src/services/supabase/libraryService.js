import {
  contentLibraryHubTabs,
  getCategoryMeta,
} from '../../data/contentLibraryAdmin';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const LIBRARY_TABLE = 'library_items';
const AGE_GROUPS_TABLE = 'age_hub_groups';
const AGE_ITEMS_TABLE = 'age_hub_items';

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
    id: group.id,
    hub_type: hubType,
    title: group.title,
    subtitle: group.subtitle ?? null,
    parent_note: group.parentNote ?? null,
    sort_order: sortOrder,
    publish_status: 'published',
  };
}

export function ageHubItemToRow(item, groupId, sortOrder) {
  const videoId = item.videoId?.trim() || null;
  const playlistId = item.playlistId?.trim() || null;

  return {
    id: item.id,
    group_id: groupId,
    title: item.title,
    video_id: videoId,
    playlist_id: playlistId,
    mood_tag: item.moodTag ?? '—',
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
    publishStatus: publishFromDb(row.publish_status),
  };
}

function buildAgeHubGroups(groupRows, itemRows, hubType) {
  const groups = groupRows
    .filter((g) => g.hub_type === hubType)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => ({
      id: g.id,
      title: g.title,
      subtitle: g.subtitle ?? '',
      parentNote: g.parent_note ?? '',
      items: [],
    }));

  const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));

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

  const { data, error } = await supabase
    .from(LIBRARY_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  return { data, error, offline: false };
}

export async function deleteLibraryItem(id) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await supabase.from(LIBRARY_TABLE).delete().eq('id', id);
  return { error, offline: false };
}

export async function upsertAgeHubGroup(row) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await supabase.from(AGE_GROUPS_TABLE).upsert(row, { onConflict: 'id' });
  return { error, offline: false };
}

export async function upsertAgeHubItem(row) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await supabase.from(AGE_ITEMS_TABLE).upsert(row, { onConflict: 'id' });
  return { error, offline: false };
}

export async function deleteAgeHubItemById(id) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null, offline: true };
  }

  const { error } = await supabase.from(AGE_ITEMS_TABLE).delete().eq('id', id);
  return { error, offline: false };
}

export function translateLibrarySaveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor في profiles.';
  }
  if (m.includes('duplicate key') || m.includes('unique constraint')) {
    return 'معرّف العنصر مستخدم مسبقاً.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي الحفظ.';
  }
  if (m.includes('library_items_youtube_check') || m.includes('age_hub_items_youtube_check')) {
    return 'يجب إدخال videoId أو playlistId قبل الحفظ.';
  }
  return message;
}
