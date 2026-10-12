import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';
import { fetchSubscriptionReport } from './reportsService';

function countOf(res) {
  if (!res || res.error) return 0;
  return res.count ?? 0;
}

export async function fetchDashboardOverview() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const [
    users,
    children,
    courses,
    cms,
    subReport,
    feedback,
    consultations,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('children').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('cms_articles').select('*', { count: 'exact', head: true }),
    fetchSubscriptionReport(),
    supabase.from('community_feedback').select('id, board_status'),
    supabase.from('consultation_requests').select('id, status'),
  ]);

  const feedbackRows = feedback.error ? [] : (feedback.data ?? []);
  const consultRows = consultations.error ? [] : (consultations.data ?? []);
  const openFeedback = feedbackRows.filter(
    (r) => r.board_status === 'new' || r.board_status === 'in_review',
  ).length;
  const openConsultations = consultRows.filter(
    (r) => r.status === 'new' || r.status === 'scheduled',
  ).length;

  return {
    data: {
      users: countOf(users),
      children: countOf(children),
      courses: countOf(courses),
      cms: countOf(cms),
      activeSubs: subReport.data?.activeTotal ?? 0,
      planRows: subReport.data?.rows ?? [],
      openFeedback,
      openConsultations,
    },
    error: null,
    offline: false,
  };
}
