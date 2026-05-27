import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { communityFaqItems as mockFaq } from '../data/mockData';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  deleteFaqItem,
  fetchAllFaqItems,
  translateFaqError,
  upsertFaqItem,
} from '../services/supabase/communityFaqService';

const publishTone = {
  published: 'success',
  draft: 'info',
  review: 'warning',
  archived: 'muted',
};

const emptyForm = () => ({
  id: null,
  question: '',
  answer: '',
  sort_order: 10,
  publish_status: 'published',
});

export function CommunityFaqManager() {
  const { needsLogin } = useAuth();
  const { showMock, showSuccess, showError } = useSnackbar();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const useRemote = isSupabaseEnabled;

  const reload = useCallback(async () => {
    if (!useRemote) {
      const mapped = mockFaq.map((f, i) => ({
        id: `mock-${i}`,
        question: f.question,
        answer: f.answer,
        sort_order: i + 1,
        publish_status: 'published',
      }));
      setItems(mapped);
      return;
    }

    setLoading(true);
    const { data, error } = await fetchAllFaqItems();
    setLoading(false);

    if (error) {
      showError(translateFaqError(error.message));
      return;
    }
    setItems(data ?? []);
  }, [useRemote, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selected = items.find((f) => f.id === selectedId);

  useEffect(() => {
    if (selected) {
      setForm({
        id: selected.id,
        question: selected.question,
        answer: selected.answer,
        sort_order: selected.sort_order ?? 0,
        publish_status: selected.publish_status ?? 'published',
      });
    }
  }, [selected?.id]);

  const saveForm = async () => {
    if (!form.question.trim() || form.answer.trim().length < 5) {
      showError('أدخلي سؤالاً وإجابة كافية.');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    if (!useRemote) {
      showMock('حفظ السؤال — mock');
      return;
    }

    setSaving(true);
    const { error } = await upsertFaqItem({
      id: form.id,
      question: form.question,
      answer: form.answer,
      sortOrder: Number(form.sort_order) || 0,
      publishStatus: form.publish_status,
    });
    setSaving(false);

    if (error) {
      showError(translateFaqError(error.message));
      return;
    }

    showSuccess(form.id ? 'تم التحديث' : 'تمت الإضافة');
    setForm(emptyForm());
    setSelectedId(null);
    await reload();
  };

  const removeSelected = async () => {
    if (!selectedId || !window.confirm('حذف هذا السؤال؟')) return;
    if (!useRemote) {
      showMock('حذف — mock');
      return;
    }
    setSaving(true);
    const { error } = await deleteFaqItem(selectedId);
    setSaving(false);
    if (error) {
      showError(translateFaqError(error.message));
      return;
    }
    showSuccess('تم الحذف');
    setSelectedId(null);
    setForm(emptyForm());
    await reload();
  };

  return (
    <>
      {!useRemote && (
        <InfoBanner>Supabase غير مفعّل — FAQ من mock.</InfoBanner>
      )}

      <div className="grid-2">
        <AdminCard>
          <SectionHeader
            title={useRemote ? 'الأسئلة الشائعة (Supabase)' : 'الأسئلة الشائعة (mock)'}
          />
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setSelectedId(null);
                setForm(emptyForm());
              }}
            >
              + سؤال جديد
            </button>
          </div>
          {loading ? (
            <p className="text-caption">جاري التحميل…</p>
          ) : items.length === 0 ? (
            <EmptyState title="لا أسئلة" description="أضيفي أول سؤال من النموذج." compact />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--compact admin-table--cards">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>السؤال</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((f) => (
                    <tr
                      key={f.id}
                      className={selectedId === f.id ? 'selected' : ''}
                      onClick={() => setSelectedId(f.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td data-label="#">{f.sort_order}</td>
                      <td data-label="السؤال">{f.question}</td>
                      <td data-label="الحالة">
                        <StatusBadge tone={publishTone[f.publish_status] ?? 'info'}>
                          {f.publish_status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>

        <AdminCard className="detail-panel">
          <SectionHeader title={form.id ? 'تعديل سؤال' : 'سؤال جديد'} />
          <div className="form-grid">
            <label>
              الترتيب
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </label>
            <label>
              الحالة
              <select
                value={form.publish_status}
                onChange={(e) => setForm((f) => ({ ...f, publish_status: e.target.value }))}
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
                <option value="review">review</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="span-2">
              السؤال
              <input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              />
            </label>
            <label className="span-2">
              الإجابة
              <textarea
                rows={6}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" className="btn btn--primary" disabled={saving} onClick={saveForm}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
            {form.id && (
              <button type="button" className="btn btn--outline" disabled={saving} onClick={removeSelected}>
                حذف
              </button>
            )}
            <button type="button" className="btn btn--ghost" disabled={loading} onClick={reload}>
              تحديث
            </button>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
