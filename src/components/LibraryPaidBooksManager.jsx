import { BookOpen, Gift, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
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
  grantBookByEmail,
  listPaidBookPurchases,
  listPaidBooks,
  purchaseSourceLabel,
  revokeBookPurchase,
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
          صورة الكتاب وتحتها النص، وزر واتساب للتواصل. لو حابة الدفع بـ PayPal كمان: اكتبي السعر بالدولار، وفعّلي PayPal من صفحة الاشتراكات.
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
              placeholder="وصف الكتاب، محتواه، طريقة الاستلام…"
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <label className="cms-field">
            السعر بالدولار للدفع بـ PayPal (لو فاضي: زر PayPal مش هيظهر، والواتساب يفضل موجود)
            <input
              type="number"
              min="0"
              step="0.01"
              dir="ltr"
              placeholder="4"
              value={draft.priceUsd}
              onChange={(e) => patch({ priceUsd: e.target.value })}
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
                  <th>PayPal</th>
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
                    <td dir="ltr">{book.priceUsd ? `$${book.priceUsd}` : '—'}</td>
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

      <PaidBookPurchasesCard books={items} />
    </div>
  );
}

function PaidBookPurchasesCard({ books }) {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grantBookId, setGrantBookId] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [granting, setGranting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listPaidBookPurchases();
    setLoading(false);
    if (error) showError(translateSectionsError(error.message) ?? 'تعذّر تحميل مشتريات الكتب');
    else setItems(data);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const onGrant = async () => {
    const email = grantEmail.trim();
    if (!grantBookId) {
      showError('اختاري الكتاب.');
      return;
    }
    if (!email.includes('@')) {
      showError('اكتبي إيميل الأم صح.');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setGranting(true);
    const { error } = await grantBookByEmail(grantBookId, email);
    setGranting(false);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر المنح');
      return;
    }
    showSuccess('تم منح الكتاب — هيظهر عندها «تم الشراء» في التطبيق');
    setGrantEmail('');
    await reload();
  };

  const onRevoke = async (item) => {
    const extra = item.source === 'paypal' ? '\nدي دفعت بـ PayPal — اسحبيه بس لو رجّعتيلها فلوسها.' : '';
    if (!window.confirm(`سحب «${item.bookTitle || item.bookId}» من ${item.email || 'الأم'}؟${extra}`)) return;
    const { error } = await revokeBookPurchase(item.bookId, item.userId);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر السحب');
      return;
    }
    showSuccess('تم السحب');
    await reload();
  };

  return (
    <AdminCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SectionHeader title="مشتريات الكتب" />
        <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>
      <p className="text-caption" style={{ margin: '4px 0 12px' }}>
        الأمهات اللي دفعوا بـ PayPal أو اتمنحلهم كتاب من الإدارة. طلبات الواتساب مش بتظهر هنا — بتيجي على الرقم فوق.
      </p>
      <div className="grid-2" style={{ gap: 12, alignItems: 'end', marginBottom: 12 }}>
        <label className="cms-field">
          الكتاب
          <select value={grantBookId} onChange={(e) => setGrantBookId(e.target.value)}>
            <option value="">اختاري كتاب…</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
        <label className="cms-field">
          إيميل الأم
          <input
            type="email"
            dir="ltr"
            placeholder="mom@example.com"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
          />
        </label>
      </div>
      <p className="text-caption" style={{ margin: '0 0 8px' }}>
        للهدايا أو التعويض، أو لو دفعت بره التطبيق (مثلاً واتساب) وعايزة تسجّليها.
      </p>
      <button type="button" className="mock-btn mock-btn--primary" disabled={granting} onClick={onGrant}>
        <Gift size={14} /> {granting ? 'جاري المنح…' : 'منح الكتاب'}
      </button>
      <div style={{ height: 16 }} />
      {loading ? (
        <MockLoading label="جاري تحميل المشتريات…" />
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="لا توجد مشتريات بعد" description="لما أم تدفع بـ PayPal هتظهر هنا." compact />
      ) : (
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>الإيميل</th>
                <th>الاسم</th>
                <th>الكتاب</th>
                <th>المصدر</th>
                <th>التاريخ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.userId}-${item.bookId}`}>
                  <td dir="ltr">{item.email || '—'}</td>
                  <td>{item.name || '—'}</td>
                  <td>{item.bookTitle || item.bookId}</td>
                  <td>
                    <StatusBadge tone={item.source === 'admin' ? 'warning' : 'success'}>
                      {purchaseSourceLabel(item.source)}
                    </StatusBadge>
                  </td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '4px 8px' }}
                      aria-label="سحب"
                      onClick={() => onRevoke(item)}
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
  );
}
