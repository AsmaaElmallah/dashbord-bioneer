import { buildInitialContentLibraryState } from '../../data/contentLibraryAdmin';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

export function translateLibrarySaveError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول وتأكدي أن دورك admin أو editor.';
  }
  if (m.includes('foreign key') || m.includes('group_id')) {
    return 'فئة العمر غير موجودة في Supabase — حدّثي الصفحة لإعادة مزامنة المجموعات.';
  }
  if (m.includes('jwt') || m.includes('not authenticated')) {
    return 'انتهت الجلسة — سجّلي الدخول ثم أعيدي الحفظ.';
  }
  return message;
}

const MEDIA_CATEGORIES = new Set(['nature', 'calm', 'lullabies']);
const APP_MENU_BY_CATEGORY = {
  nature: 'nature_sounds',
  calm: 'calm_music',
  lullabies: 'lullabies',
  library_books: 'library_books',
};

const TABLE = 'library_items';
const GROUPS_TABLE = 'age_hub_groups';
const HUB_ITEMS_TABLE = 'age_hub_items';

function rowToAdminItem(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryTitle: row.category_id,
    title: row.title,
    videoId: row.video_id,
    playlistId: row.playlist_id,
    duration: row.duration_label ?? '—',
    moodTag: row.mood_tag ?? '—',
    natureChip: row.nature_chip,
    itemType: row.item_type,
    linkStatus: row.link_status ?? 'سليم',
    publishStatus: mapPublishToArabic(row.publish_status),
    showsWhen: row.app_menu_id ?? row.category_id,
  };
}

function mapPublishToArabic(status) {
  const map = {
    draft: 'مسودة',
    review: 'يحتاج مراجعة',
    published: 'منشور',
    archived: 'مؤرشف',
  };
  return map[status] ?? status;
}

function mapPublishToDb(arabicOrEn) {
  const map = {
    مسودة: 'draft',
    'يحتاج مراجعة': 'review',
    منشور: 'published',
    مؤرشف: 'archived',
    draft: 'draft',
    review: 'review',
    published: 'published',
    archived: 'archived',
  };
  return map[arabicOrEn] ?? 'draft';
}

export function adminItemToRow(item, categoryId) {
  const cat = categoryId ?? item.categoryId;
  return {
    id: item.id,
    category_id: cat,
    title: item.title,
    video_id: item.videoId || null,
    playlist_id: item.playlistId || null,
    duration_label: item.duration ?? '—',
    mood_tag: item.moodTag ?? '—',
    nature_chip: item.natureChip ?? null,
    item_type: item.itemType ?? (item.playlistId ? 'playlist' : 'video'),
    link_status: item.linkStatus ?? 'سليم',
    publish_status: mapPublishToDb(item.publishStatus),
    hub_kind: 'media',
    app_menu_id: item.appMenuId ?? APP_MENU_BY_CATEGORY[cat] ?? null,
  };
}

/** دمج بيانات Supabase في شكل state المحلي للوحة */
export function hydrateContentLibraryState(mediaItems, hubState) {
  const base = buildInitialContentLibraryState();
  const items = mediaItems ?? [];

  return {
    ...base,
    mediaItems: items.filter((i) => MEDIA_CATEGORIES.has(i.categoryId)),
    libraryBooksItems: items.filter((i) => i.categoryId === 'library_books'),
    exerciseGroups:
      hubState?.exerciseGroups?.length > 0 ? hubState.exerciseGroups : base.exerciseGroups,
    activityGroups:
      hubState?.activityGroups?.length > 0 ? hubState.activityGroups : base.activityGroups,
  };
}

export function ageHubItemToRow(item, groupId, sortOrder = 0) {
  const itemType = item.playlistId && !item.videoId ? 'playlist' : 'video';
  return {
    id: item.id,
    group_id: groupId,
    title: item.title,
    video_id: item.videoId || null,
    playlist_id: item.playlistId || null,
    mood_tag: item.moodTag ?? '—',
    item_type: itemType,
    sort_order: sortOrder,
    publish_status: item.publishStatus === 'منشور' ? 'published' : 'draft',
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

/** أول تشغيل: رفع مجموعات وعناصر mock إلى Supabase إن كانت فارغة */
export async function ensureAgeHubCatalogSeeded() {
  if (!isSupabaseEnabled || !supabase) return { error: null };

  const { count, error: countErr } = await supabase
    .from(GROUPS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('hub_type', 'exercises');

  if (countErr) return { error: countErr };
  if (count && count > 0) return { error: null };

  const base = buildInitialContentLibraryState();
  const seedEx = await seedAgeHubType(base.exerciseGroups, 'exercises');
  if (seedEx.error) return seedEx;
  return seedAgeHubType(base.activityGroups, 'activities');
}

async function seedAgeHubType(groups, hubType) {
  for (let gi = 0; gi < groups.length; gi += 1) {
    const group = groups[gi];
    const { error: gErr } = await upsertAgeHubGroup(ageHubGroupToRow(group, hubType, gi));
    if (gErr) return { error: gErr };

    for (let ii = 0; ii < group.items.length; ii += 1) {
      const { error: iErr } = await upsertAgeHubItem(ageHubItemToRow(group.items[ii], group.id, ii));
      if (iErr) return { error: iErr };
    }
  }
  return { error: null };
}

export async function upsertAgeHubGroup(row) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(GROUPS_TABLE).upsert(row, { onConflict: 'id' });
  return { error, offline: false };
}

export async function upsertAgeHubItem(row) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(HUB_ITEMS_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) return { data: null, error, offline: false };
  return {
    data: data
      ? {
          id: data.id,
          title: data.title,
          videoId: data.video_id,
          playlistId: data.playlist_id,
          moodTag: data.mood_tag,
        }
      : null,
    error: null,
    offline: false,
  };
}

export async function deleteAgeHubItemById(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(HUB_ITEMS_TABLE).delete().eq('id', id);
  return { error, offline: false };
}

/** تحميل كامل للمكتبة من Supabase */
export async function loadContentLibraryState() {
  const seedRes = await ensureAgeHubCatalogSeeded();
  if (seedRes.error) return { state: null, error: seedRes.error };

  const [libRes, hubRes] = await Promise.all([fetchAllLibraryItems(), fetchAgeHubState()]);

  if (libRes.error) return { state: null, error: libRes.error };
  if (hubRes.error) return { state: null, error: hubRes.error };

  return {
    state: hydrateContentLibraryState(libRes.data, hubRes),
    error: null,
  };
}

/** جلب كل عناصر المكتبة (للأدمن — يتطلب staff RLS) */
export async function fetchAllLibraryItems() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('category_id')
    .order('sort_order');

  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToAdminItem), error: null, offline: false };
}

export async function upsertLibraryItem(row) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' }).select().single();
  return { data, error, offline: false };
}

export async function deleteLibraryItem(id) {
  if (!isSupabaseEnabled) return { error: null, offline: true };

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error, offline: false };
}

/** مجموعات الرياضة/الأنشطة */
export async function fetchAgeHubState() {
  if (!isSupabaseEnabled) {
    return { exerciseGroups: null, activityGroups: null, error: null, offline: true };
  }

  const { data: groups, error: gErr } = await supabase
    .from(GROUPS_TABLE)
    .select('*')
    .order('sort_order');

  if (gErr) {
    return { exerciseGroups: null, activityGroups: null, error: gErr, offline: false };
  }

  const { data: items, error: iErr } = await supabase
    .from(HUB_ITEMS_TABLE)
    .select('*')
    .order('sort_order');

  if (iErr) {
    return { exerciseGroups: null, activityGroups: null, error: iErr, offline: false };
  }

  const byGroup = (type) =>
    (groups ?? [])
      .filter((g) => g.hub_type === type)
      .map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: g.subtitle,
        parentNote: g.parent_note,
        items: (items ?? [])
          .filter((it) => it.group_id === g.id)
          .map((it) => ({
            id: it.id,
            title: it.title,
            videoId: it.video_id,
            playlistId: it.playlist_id,
            moodTag: it.mood_tag,
          })),
      }));

  return {
    exerciseGroups: byGroup('exercises'),
    activityGroups: byGroup('activities'),
    error: null,
    offline: false,
  };
}
