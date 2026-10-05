import { BookOpen, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { MediaCoverPick } from './MediaCoverPick';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { ageBandLabel, libraryAgeBands } from '../data/libraryAgeBands';
import { libraryPdfPublishOptions, publishLabel } from '../services/supabase/libraryPdfService';
import {
  deletePaidBook,
  emptyPaidBookDraft,
  listPaidBooks,
  savePaidBook,
  translateSectionsError,
  validatePaidBook,
} from '../services/supabase/librarySectionsService';

const publishTone = { published: 'success', review: 'warning', draft: 'muted', archived: 'muted' };

export function LibraryPaidBooksManager() {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listPaidBooks();
    setLoading(false);
    if (error) showError(translateSectionsError(error.message) ?? 'تعذّر تحميل الكتب المدفوعة');
    else setItems(data);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((b) => b.ageBand === filter)),
    [items, filter],
  );

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const onSave = async () => {
    const issue = validatePaidBook(draft);
    if (issue) {
      showError(issue);
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setSaving(true);
    const { error } = await savePaidBook(draft);
    setSaving(false);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showSuccess(draft.publishStatus === 'published' ? 'تم الحفظ والنشر في التطبيق' : 'تم الحفظ');
    setDraft(null);
    await reload();
  };

  const onDelete = async (book) => {
    if (!window.confirm(`حذف «${book.title}» نهائياً؟`)) return;
    const { error } = await deletePaidBook(book.id);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر الحذف');
      return;
    }
    showSuccess('تم الحذف');
    if (draft?.id === book.id) setDraft(null);
    await reload();
  };

  return (
    <div className="page-stack">
      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SectionHeader title="الكتب المدفوعة" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => setDraft(emptyPaidBookDraft(items.length))}
            >
              <Plus size={16} /> كتاب جديد
            </button>
          </div>
        </div>
        <p className="text-caption" style={{ margin: '4px 0 12px' }}>
          صورة الكتاب وتحتها النص (اكتبي السعر في النص لو حابة)، وزر واتساب للتواصل على الرقم المحفوظ فوق.
        </p>
        <div className="filters-row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">كل الأعمار</option>
            {libraryAgeBands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      {draft && (
        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={draft.id ? 'تعديل كتاب مدفوع' : 'كتاب مدفوع جديد'} />
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <MediaCoverPick
            label="صورة الكتاب"
            value={draft.coverUrl}
            onChange={(url) => patch({ coverUrl: url })}
          />
          <label className="cms-field">
            العنوان
            <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <label className="cms-field">
            النص تحت الصورة
            <textarea
              rows={4}
              placeholder="وصف الكتاب، محتواه، السعر وطريقة الاستلام…"
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              الفئة العمرية
              <select value={draft.ageBand} onChange={(e) => patch({ ageBand: e.target.value })}>
                {libraryAgeBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              حالة النشر
              <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                {libraryPdfPublishOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="cms-field">
            الترتيب
            <input type="number" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)}>
              <X size={14} /> إلغاء
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <MockLoading label="جاري تحميل الكتب المدفوعة…" />
        ) : visible.length === 0 ? (
          <EmptyState icon={BookOpen} title="لا توجد كتب مدفوعة" description="اضغطي «كتاب جديد» لإضافة أول كتاب." compact />
        ) : (
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>العنوان</th>
                  <th>العمر</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((book) => (
                  <tr key={book.id} className={draft?.id === book.id ? 'selected' : ''}>
                    <td>
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {book.title}
                      <div className="text-caption text-truncate">{book.description}</div>
                    </td>
                    <td>{ageBandLabel(book.ageBand)}</td>
                    <td>
                      <StatusBadge tone={publishTone[book.publishStatus] ?? 'muted'}>
                        {publishLabel(book.publishStatus)}
                      </StatusBadge>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="تعديل"
                        onClick={() => setDraft({ ...book })}
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="حذف"
                        onClick={() => onDelete(book)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        )}
      </AdminCard>
    </div>
  );
}
