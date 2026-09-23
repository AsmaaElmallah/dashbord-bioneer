import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

export async function searchCloudContent(query, limit = 50) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }
  const q = (query || '').trim();
  if (!q) return { data: [], error: null, offline: false };

  const pattern = `%${q}%`;

  const [cms, library, faq, consultations, feedback] = await Promise.all([
    supabase
      .from('cms_articles')
      .select('id, title, section, publish_status')
      .ilike('title', pattern)
      .limit(limit),
    supabase
      .from('library_items')
      .select('id, title, category_id, publish_status')
      .ilike('title', pattern)
      .limit(limit),
    supabase
      .from('community_faq')
      .select('id, question, publish_status')
      .ilike('question', pattern)
      .limit(limit),
    supabase
      .from('consultation_requests')
      .select('id, topic, status')
      .ilike('topic', pattern)
      .limit(limit),
    supabase
      .from('community_feedback')
      .select('id, subject, kind, board_status')
      .ilike('subject', pattern)
      .limit(limit),
  ]);

  const error =
    cms.error || library.error || faq.error || consultations.error || feedback.error;

  const results = [
    ...(cms.data ?? []).map((r) => ({
      id: `cms_${r.id}`,
      typeLabel: 'مقال CMS',
      title: r.title,
      subtitle: `${r.section ?? '—'} · ${r.publish_status}`,
      path: '/cms',
    })),
    ...(library.data ?? []).map((r) => ({
      id: `lib_${r.id}`,
      typeLabel: 'مكتبة',
      title: r.title,
      subtitle: `${r.category_id ?? '—'} · ${r.publish_status}`,
      path: '/library',
    })),
    ...(faq.data ?? []).map((r) => ({
      id: `faq_${r.id}`,
      typeLabel: 'FAQ',
      title: r.question,
      subtitle: r.publish_status,
      path: '/community',
    })),
    ...(consultations.data ?? []).map((r) => ({
      id: `cons_${r.id}`,
      typeLabel: 'استشارة',
      title: r.topic,
      subtitle: r.status,
      path: '/community',
    })),
    ...(feedback.data ?? []).map((r) => ({
      id: `fb_${r.id}`,
      typeLabel: r.kind === 'complaint' ? 'شكوى' : 'اقتراح',
      title: r.subject,
      subtitle: r.board_status,
      path: '/community',
    })),
  ].slice(0, limit);

  return { data: results, error: error || null, offline: false };
}
