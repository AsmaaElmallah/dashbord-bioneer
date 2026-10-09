import { FileText, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  addResource,
  deleteResource,
  listResources,
  translateCoursesError,
  updateResource,
} from '../services/supabase/coursesService';

const MAX_BYTES = 50 * 1024 * 1024;
const emptyForm = { title: '', subtitle: '', isPreview: false, file: null };

/** ملفات PDF للدورة — تظهر للأم في تبويب «ملفات PDF». */
export function CourseResourcesPanel({ course }) {
  const { showError, showSuccess } = useSnackbar();
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const reload = useCallback(async () => {
    const { data, error } = await listResources(course.id);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر تحميل الملفات');
    else setFiles(data);
  }, [course.id, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const onAdd = async () => {
    if (!form.title.trim()) {
      showError('اسم الملف مطلوب.');
      return;
    }
    if (!form.file) {
      showError('اختاري ملف PDF.');
      return;
    }
    if (form.file.size > MAX_BYTES) {
      showError('الملف أكبر من 50 ميجا.');
      return;
    }
    setBusy(true);
    const { error } = await addResource(course.id, { ...form, sortOrder: files.length });
    setBusy(false);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر رفع الملف');
      return;
    }
    showSuccess('تم رفع الملف');
    setForm(emptyForm);
    setInputKey((k) => k + 1);
    reload();
  };

  const onTogglePreview = async (file) => {
    const { error } = await updateResource({ ...file, isPreview: !file.isPreview });
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر التحديث');
    else reload();
  };

  const onDelete = async (file) => {
    if (!window.confirm(`حذف «${file.title}»؟`)) return;
    const { error } = await deleteResource(file);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر الحذف');
    else reload();
  };

  return (
    <AdminCard>
      <SectionHeader title={`ملفات PDF — ${course.title}`} />
      {files.length === 0 ? (
        <p className="text-caption">مفيش ملفات لسه. الملفات بتظهر للأم في تبويب «ملفات PDF» في صفحة الدورة.</p>
      ) : (
        <ul className="live-requests">
          {files.map((f) => (
            <li key={f.id}>
              <FileText size={14} />
              <span style={{ flex: 1 }}>
                {f.title}
                {f.subtitle && <span className="text-caption"> — {f.subtitle}</span>}
              </span>
              {f.isPreview && <StatusBadge tone="success">مجاني للكل</StatusBadge>}
              <button
                type="button"
                className="mock-btn mock-btn--outline"
                style={{ padding: '4px 10px' }}
                onClick={() => onTogglePreview(f)}
              >
                {f.isPreview ? 'خليه للمشتركات بس' : 'خليه مجاني للكل'}
              </button>
              <button
                type="button"
                className="mock-btn mock-btn--outline"
                style={{ padding: '4px 8px' }}
                aria-label="حذف"
                onClick={() => onDelete(f)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
        <label className="cms-field">
          اسم الملف
          <input
            type="text"
            placeholder="مثال: حقيبة التدريب وبطاقات الأنشطة"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        <label className="cms-field">
          وصف قصير (اختياري)
          <input
            type="text"
            placeholder="مثال: 14 صفحة ملونة للطباعة"
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <input
          key={inputKey}
          type="file"
          accept="application/pdf"
          onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={form.isPreview}
            onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))}
          />
          مجاني للكل (حتى لو الدورة مقفولة)
        </label>
        <button type="button" className="mock-btn mock-btn--primary" disabled={busy} onClick={onAdd}>
          <Upload size={14} /> {busy ? 'جاري الرفع…' : 'ارفعي الملف'}
        </button>
      </div>
    </AdminCard>
  );
}
