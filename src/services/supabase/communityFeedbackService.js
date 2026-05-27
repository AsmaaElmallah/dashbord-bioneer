import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TABLE = 'community_feedback';

export const BOARD_COLUMNS = [
  { key: 'new', label: 'جديد' },
  { key: 'in_review', label: 'قيد المراجعة' },
  { key: 'replied', label: 'تم الرد' },
  { key: 'closed', label: 'مغلق' },
];

export const PRIORITY_LABEL = {
  high: 'عالية',
  medium: 'متوسطة',
  low: 'منخفضة',
};

export const KIND_LABEL = {
  complaint: 'شكوى',
  suggestion: 'اقتراح',
};

export function rowToTicket(row) {
  return {
    id: row.id,
    title: row.subject,
    type: KIND_LABEL[row.kind] ?? row.kind,
    kind: row.kind,
    user: row.author_display_name ?? '—',
    date: row.created_at?.slice(0, 10) ?? '—',
    priority: PRIORITY_LABEL[row.priority] ?? row.priority,
    priorityKey: row.priority,
    boardStatus: BOARD_COLUMNS.find((c) => c.key === row.board_status)?.label ?? row.board_status,
    boardStatusKey: row.board_status,
    body: row.body ?? '',
    childMock: {
      name: row.child_name ?? '—',
      age: row.child_age_label ?? '—',
    },
    adminReply: row.admin_reply,
  };
}

export function translateFeedbackError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'لا صلاحية — سجّلي الدخول كـ staff.';
  }
  return message;
}

export async function fetchFeedbackTickets(kind) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (kind) query = query.eq('kind', kind);

  const { data, error } = await query;
  if (error) return { data: null, error, offline: false };
  return { data: (data ?? []).map(rowToTicket), error: null, offline: false };
}

export async function updateFeedbackTicket(id, patch) {
  if (!isSupabaseEnabled) return { data: null, error: null, offline: true };

  const row = {
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error, offline: false };
  return { data: data ? rowToTicket(data) : null, error: null, offline: false };
}

export async function replyToTicket(id, adminReply, boardStatus = 'replied') {
  return updateFeedbackTicket(id, {
    admin_reply: adminReply,
    board_status: boardStatus,
  });
}

export async function moveTicketBoard(id, boardStatus) {
  return updateFeedbackTicket(id, { board_status: boardStatus });
}
