import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'cms_articles';

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

export const CMS_SECTIONS = [
  { id: 'parent_culture', label: 'ثقافة الأمهات' },
  { id: 'parent_health', label: 'الثقافة الصحية' },
  { id: 'how_to_teach', label: 'كيف أدرّس طفلي' },
];

export function rowToCmsItem(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    sectionId: row.section,
    sortOrder: row.sort_order ?? 0,
    publishStatus: PUBLISH_FROM_DB[row.publish_status] ?? 'مسودة',
  };
}

export function cmsItemToRow(item) {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    body: item.body ?? '',
    section: item.sectionId,
    sort_order: Number(item.sortOrder) || 0,
    publish_status: PUBLISH_TO_DB[item.publishStatus] ?? 'draft',
  };
}

export async function fetchCmsArticles() {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('section')
    .order('sort_order');
  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToCmsItem), error: null, offline: false };
}

export async function upsertCmsArticle(item) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from(TABLE).upsert(cmsItemToRow(item));
  return { error };
}

export async function publishCmsArticle(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(TABLE)
    .update({
      publish_status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error };
}
