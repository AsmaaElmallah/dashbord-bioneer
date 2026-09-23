import { ExternalLink, FileText, ImagePlus, Pencil, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  categoryLabel,
  deleteLibraryPdf,
  emptyPdfDraft,
  formatBytes,
  libraryPdfCategories,
  libraryPdfPublishOptions,
  listLibraryPdfs,
  pdfToRow,
  publishLabel,
  signedPdfUrl,
  translatePdfError,
  uploadLibraryCover,
  uploadLibraryPdfFile,
  upsertLibraryPdf,
  validatePdfDraft,
} from '../services/supabase/libraryPdfService';

const publishTone = {
  published: 'success',
  review: 'warning',
  draft: 'muted',
  archived: 'muted',
};

const accentByIndex = ['#B77B72', '#C79254', '#7C8668'];

export function LibraryPdfManager() {
  const { showMock } = useSnackbar();
  const { needsLogin } = useAuth();
  const pdfInput = useRef(null);
  const coverInput = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(isSupabaseEnabled);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const reload = useCallback(async () => {
    if (!isSupabaseEnabled) return;
    setLoading(true);
    const { data, error } = await listLibraryPdfs();
    if (error) showMock(translatePdfError(error.message) ?? 'تعذّر تحميل ملفات المكتبة');
    else setItems(data ?? []);
    setLoading(false);
  }, [showMock]);

  useEffect(() => {
    reload();
  }, [reload]);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((p) => p.category === filter)),
    [items, filter],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((p) => p.publishStatus === 'published').length,
      drafts: items.filter((p) => p.publishStatus !== 'published').length,
    }),
    [items],
  );

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const startNew = () => setDraft({ ...emptyPdfDraft(), sortOrder: items.length });
  const startEdit = (pdf) => setDraft({ ...pdf });

  const onPickPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showMock('اختاري ملفاً بصيغة PDF');
      return;
    }
    setUploadingPdf(true);
    const { data, error } = await uploadLibraryPdfFile(file);
    setUploadingPdf(false);
    if (error) {
      showMock(translatePdfError(error.message) ?? 'تعذّر رفع الملف');
      return;
    }
    setDraft((d) => ({
      ...d,
      filePath: data.path,
      fileSizeBytes: data.size,
      title: d.title || file.name.replace(/\.pdf$/i, ''),
    }));
    showMock('تم رفع ملف الـ PDF');
  };

  const onPickCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingCover(true);
    const { data, error } = await uploadLibraryCover(file);
    setUploadingCover(false);
    if (error) {
      showMock(translatePdfError(error.message) ?? 'تعذّر رفع الغلاف');
      return;
    }
    patch({ coverUrl: data.url });
    showMock('تم رفع صورة الغلاف');
  };

  const onSave = async () => {
    const issues = validatePdfDraft(draft);
    if (issues.length) {
      showMock(issues[0]);
      return;
    }
    if (needsLogin) {
      showMock('سجّلي الدخول أولاً لحفظ ملفات المكتبة.');
      return;
    }
    setSaving(true);
    const { error } = await upsertLibraryPdf(pdfToRow(draft));
    setSaving(false);
    if (error) {
      showMock(translatePdfError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showMock(draft.publishStatus === 'published' ? 'تم الحفظ والنشر في التطبيق' : 'تم الحفظ');
    setDraft(null);
    await reload();
  };

  const onDelete = async (pdf) => {
    if (!window.confirm(`حذف «${pdf.title}» نهائياً مع ملفه؟`)) return;
    const { error } = await deleteLibraryPdf(pdf);
    if (error) {
      showMock(translatePdfError(error.message) ?? 'تعذّر الحذف');
      return;
    }
    showMock('تم الحذف');
    if (draft?.id === pdf.id) setDraft(null);
    await reload();
  };

  const onOpenFile = async (path) => {
    const url = await signedPdfUrl(path);
    if (url) window.open(url, '_blank', 'noopener');
    else showMock('تعذّر فتح الملف');
  };

  if (!isSupabaseEnabled) {
    return (
      <AdminCard>
        <SectionHeader title="ملفات PDF — تبويب المكتبة في التطبيق" />
        <InfoBanner tone="warning">فعّلي Supabase في ملف .env لإدارة ملفات المكتبة ورفعها.</InfoBanner>
      </AdminCard>
    );
  }

  return (
    <div className="page-stack">
      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SectionHeader title="ملفات PDF — تبويب المكتبة في التطبيق" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button type="button" className="mock-btn mock-btn--primary" onClick={startNew}>
              <Plus size={16} /> ملف جديد
            </button>
          </div>
        </div>
        <p className="text-caption" style={{ margin: '4px 0 12px' }}>
          الملفات المنشورة فقط تظهر للمستخدمين في تبويب «المكتبة». الإجمالي {stats.total} · منشور {stats.published} · غير منشور {stats.drafts}
        </p>
        <div className="filters-row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">كل التصنيفات</option>
            {libraryPdfCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      {draft && (
        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={draft.id ? 'تعديل ملف' : 'ملف جديد'} />
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>

          <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>
            <div>
              <div className="filters-row" style={{ marginBottom: 12 }}>
                <input ref={pdfInput} type="file" hidden accept="application/pdf,.pdf" onChange={onPickPdf} />
                <button
                  type="button"
                  className="mock-btn mock-btn--primary"
                  disabled={uploadingPdf}
                  onClick={() => pdfInput.current?.click()}
                >
                  <Upload size={16} /> {uploadingPdf ? 'جاري رفع الملف…' : draft.filePath ? 'استبدال ملف الـ PDF' : 'رفع ملف الـ PDF'}
                </button>
                <input ref={coverInput} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={onPickCover} />
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  disabled={uploadingCover}
                  onClick={() => coverInput.current?.click()}
                >
                  <ImagePlus size={16} /> {uploadingCover ? 'جاري رفع الغلاف…' : 'رفع صورة الغلاف'}
                </button>
              </div>
              <p className="text-caption" style={{ marginTop: 0 }}>
                {draft.filePath ? (
                  <>
                    الملف: <code dir="ltr">{draft.filePath}</code> · {formatBytes(draft.fileSizeBytes)}{' '}
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '2px 8px' }}
                      onClick={() => onOpenFile(draft.filePath)}
                    >
                      <ExternalLink size={12} /> فتح
                    </button>
                  </>
                ) : (
                  'لم يُرفع ملف بعد — لا يمكن النشر بدون ملف.'
                )}
              </p>

              <label className="cms-field">
                العنوان
                <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
              </label>
              <div className="grid-2" style={{ gap: 12 }}>
                <label className="cms-field">
                  التصنيف (فلتر التطبيق)
                  <select value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
                    {libraryPdfCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cms-field">
                  الوسم الملوّن فوق العنوان
                  <input
                    type="text"
                    placeholder="دليل إرشادي شامل"
                    value={draft.tagLabel}
                    onChange={(e) => patch({ tagLabel: e.target.value })}
                  />
                </label>
              </div>
              <label className="cms-field">
                الوصف (سطر واحد في الكارت)
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </label>
              <div className="grid-2" style={{ gap: 12 }}>
                <label className="cms-field">
                  عدد الصفحات
                  <input
                    type="number"
                    min="1"
                    value={draft.pageCount}
                    onChange={(e) => patch({ pageCount: e.target.value })}
                  />
                </label>
                <label className="cms-field">
                  كلمة بعد العدد
                  <input
                    type="text"
                    placeholder="صفحة / صفحة مصورة"
                    value={draft.pageLabel}
                    onChange={(e) => patch({ pageLabel: e.target.value })}
                  />
                </label>
              </div>
              <label className="cms-field">
                رابط الغلاف (يُملأ تلقائياً بعد الرفع، أو الصقي رابطاً)
                <input type="text" dir="ltr" value={draft.coverUrl} onChange={(e) => patch({ coverUrl: e.target.value })} />
              </label>
              <div className="grid-2" style={{ gap: 12 }}>
                <label className="cms-field">
                  الترتيب
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => patch({ sortOrder: e.target.value })}
                  />
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

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button
                  type="button"
                  className="mock-btn mock-btn--primary"
                  disabled={saving || uploadingPdf || uploadingCover}
                  onClick={onSave}
                >
                  {saving ? 'جاري الحفظ…' : 'حفظ'}
                </button>
                <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)}>
                  <X size={14} /> إلغاء
                </button>
              </div>
            </div>

            <div>
              <p className="text-caption" style={{ marginTop: 0 }}>معاينة الكارت في التطبيق</p>
              <PdfCardPreview pdf={draft} accent={accentByIndex[Number(draft.sortOrder) % 3] ?? accentByIndex[0]} />
            </div>
          </div>
        </AdminCard>
      )}

      <AdminCard>
        <SectionHeader title="الملفات" />
        {loading ? (
          <MockLoading label="جاري تحميل ملفات المكتبة…" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="لا توجد ملفات"
            description="اضغطي «ملف جديد» وارفعي أول ملف PDF."
            compact
          />
        ) : (
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الغلاف</th>
                  <th>العنوان</th>
                  <th>التصنيف</th>
                  <th>الصفحات</th>
                  <th>الحجم</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((pdf) => (
                  <tr key={pdf.id} className={draft?.id === pdf.id ? 'selected' : ''}>
                    <td>
                      {pdf.coverUrl ? (
                        <img
                          src={pdf.coverUrl}
                          alt=""
                          style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <FileText size={20} />
                      )}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 200 }}>
                      {pdf.title}
                      {!pdf.filePath && (
                        <div className="text-caption" style={{ color: '#C45C5C' }}>بدون ملف</div>
                      )}
                    </td>
                    <td>{categoryLabel(pdf.category)}</td>
                    <td>{pdf.pageCount || '—'}</td>
                    <td>{formatBytes(pdf.fileSizeBytes)}</td>
                    <td>
                      <StatusBadge tone={publishTone[pdf.publishStatus] ?? 'muted'}>
                        {publishLabel(pdf.publishStatus)}
                      </StatusBadge>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="تعديل"
                        onClick={() => startEdit(pdf)}
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="حذف"
                        onClick={() => onDelete(pdf)}
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

function PdfCardPreview({ pdf, accent }) {
  const pages = pdf.pageCount ? `${pdf.pageCount} ${pdf.pageLabel || 'صفحة'}` : null;
  const size = pdf.fileSizeBytes ? formatBytes(pdf.fileSizeBytes) : null;

  return (
    <div
      dir="rtl"
      style={{
        background: '#FFFFFF',
        borderRadius: 28,
        padding: 16,
        boxShadow: '0 8px 24px rgba(183,123,114,0.10)',
        fontFamily: 'inherit',
        maxWidth: 380,
      }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div
          style={{
            position: 'relative',
            width: 96,
            height: 128,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#F6E8E5',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pdf.coverUrl ? (
            <img src={pdf.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FileText size={36} color={accent} />
          )}
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: '#C45C5C',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            PDF
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: accent, fontWeight: 700, fontSize: 13 }}>{pdf.tagLabel || 'الوسم'}</div>
            <div
              style={{
                color: '#493732',
                fontWeight: 800,
                fontSize: 18,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pdf.title || 'عنوان الملف'}
            </div>
            <div
              style={{
                color: '#6E5A52',
                fontSize: 13,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pdf.description || 'وصف قصير للملف'}
            </div>
          </div>
          <div style={{ color: '#7A6A62', fontSize: 12, fontWeight: 700 }}>
            {[pages, size].filter(Boolean).join(' • ') || '—'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div
          style={{
            flex: 1,
            background: accent,
            color: '#fff',
            borderRadius: 16,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          فتح الـ PDF
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 16, background: '#F8EDE3' }} />
      </div>
    </div>
  );
}
