import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { supportTickets as mockTickets, supportTicketColumns } from '../data/mockData';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  BOARD_COLUMNS,
  fetchFeedbackTickets,
  moveTicketBoard,
  replyToTicket,
  translateFeedbackError,
} from '../services/supabase/communityFeedbackService';

const priorityTone = { عالية: 'error', متوسطة: 'warning', منخفضة: 'info' };

const boardKeyFromLabel = Object.fromEntries(
  BOARD_COLUMNS.map((c) => [c.label, c.key]),
);

export function CommunityFeedbackManager({ kind }) {
  const { needsLogin } = useAuth();
  const { showMock, showSuccess, showError } = useSnackbar();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const kindFilter = kind === 'complaints' ? 'complaint' : 'suggestion';
  const useRemote = isSupabaseEnabled;

  const reload = useCallback(async () => {
    if (!useRemote) {
      const filtered = mockTickets.filter((t) =>
        kind === 'complaints' ? t.type === 'شكوى' : t.type === 'اقتراح',
      );
      setTickets(
        filtered.map((t) => ({
          ...t,
          kind: kindFilter,
          boardStatusKey: boardKeyFromLabel[t.boardStatus] ?? 'new',
          priorityKey: 'medium',
        })),
      );
      setSelectedId(filtered[0]?.id ?? null);
      return;
    }

    setLoading(true);
    const { data, error } = await fetchFeedbackTickets(kindFilter);
    setLoading(false);

    if (error) {
      showError(translateFeedbackError(error.message));
      return;
    }

    setTickets(data ?? []);
    setSelectedId((prev) =>
      prev && data?.some((t) => t.id === prev) ? prev : data?.[0]?.id ?? null,
    );
  }, [useRemote, kind, kindFilter, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selected = tickets.find((t) => t.id === selectedId);

  useEffect(() => {
    setReplyDraft(selected?.adminReply ?? '');
  }, [selected?.id, selected?.adminReply]);

  const ticketsByColumn = (label) =>
    tickets.filter((t) => t.boardStatus === label);

  const run = async (label, fn) => {
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    if (!useRemote) {
      showMock(`${label} — mock`);
      return;
    }
    setSaving(true);
    const { error } = await fn();
    setSaving(false);
    if (error) {
      showError(translateFeedbackError(error.message));
      return;
    }
    showSuccess(label);
    await reload();
  };

  const submitReply = () => {
    if (!selectedId || !replyDraft.trim()) {
      showError('اكتبي نص الرد.');
      return;
    }
    run('تم حفظ الرد', () => replyToTicket(selectedId, replyDraft.trim()));
  };

  const moveBoard = (boardStatusKey) => {
    if (!selectedId) return;
    run('تم تحديث الحالة', () => moveTicketBoard(selectedId, boardStatusKey));
  };

  return (
    <>
      {!useRemote && (
        <InfoBanner>Supabase غير مفعّل — بيانات mock للشكاوى/الاقتراحات.</InfoBanner>
      )}

      <div className="ticket-board">
        {supportTicketColumns.map((col) => (
          <div key={col} className="ticket-board__column">
            <h4 className="ticket-board__title">{col}</h4>
            {loading ? (
              <p className="text-caption">جاري التحميل…</p>
            ) : ticketsByColumn(col).length === 0 ? (
              <p className="ticket-board__empty">لا تذاكر في «{col}»</p>
            ) : (
              ticketsByColumn(col).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`ticket-board__card${selectedId === t.id ? ' ticket-board__card--selected' : ''}`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <strong>{String(t.id).slice(0, 8)}</strong> {t.title}
                  <span className="text-caption">{t.user}</span>
                </button>
              ))
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="جدول التذاكر" />
          {tickets.length === 0 && !loading ? (
            <EmptyState
              title={kind === 'complaints' ? 'لا شكاوى' : 'لا اقتراحات'}
              description="لم تصل تذاكر بعد من التطبيق."
              compact
            />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--compact admin-table--cards">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>المستخدم</th>
                    <th>التاريخ</th>
                    <th>الأولوية</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      className={selectedId === t.id ? 'selected' : ''}
                      onClick={() => setSelectedId(t.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td data-label="العنوان">{t.title}</td>
                      <td data-label="المستخدم">{t.user}</td>
                      <td data-label="التاريخ">{t.date}</td>
                      <td data-label="الأولوية">
                        <StatusBadge tone={priorityTone[t.priority]}>{t.priority}</StatusBadge>
                      </td>
                      <td data-label="الحالة">{t.boardStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>

        <AdminCard className="detail-panel">
          <SectionHeader title="تفاصيل التذكرة" />
          {selected ? (
            <>
              <h4 style={{ margin: '0 0 8px' }}>{selected.title}</h4>
              <p className="text-caption" style={{ marginBottom: 8 }}>
                {selected.user} · {selected.date}
              </p>
              <p>
                <strong>النص:</strong>
                <br />
                {selected.body}
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>الطفل:</strong> {selected.childMock.name} — {selected.childMock.age}
              </p>
              <label style={{ display: 'block', marginTop: 16 }}>
                <strong>رد الإدارة</strong>
                <textarea
                  rows={4}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={saving}
                  onClick={submitReply}
                >
                  حفظ الرد
                </button>
                <button
                  type="button"
                  className="btn btn--outline"
                  disabled={saving}
                  onClick={() => moveBoard('in_review')}
                >
                  قيد المراجعة
                </button>
                <button
                  type="button"
                  className="btn btn--outline"
                  disabled={saving}
                  onClick={() => moveBoard('closed')}
                >
                  إغلاق
                </button>
                <button type="button" className="btn btn--ghost" disabled={loading} onClick={reload}>
                  تحديث
                </button>
              </div>
            </>
          ) : (
            <p className="text-caption">اختر تذكرة من اللوحة أو الجدول.</p>
          )}
        </AdminCard>
      </div>
    </>
  );
}
