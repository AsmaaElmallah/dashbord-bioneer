import { UserPlus, UserX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  grantCourseByEmail,
  listEnrollments,
  revokeCourse,
  translateCoursesError,
} from '../services/supabase/coursesService';

const sourceLabel = { admin: 'تفعيل يدوي', store: 'شراء من المتجر', paypal: 'PayPal' };

/** فتح الدورة لأم معيّنة بالإيميل (للدورات المدفوعة، أو ضمن الباقة لأم مش مشتركة). */
export function CourseEnrollmentsPanel({ course }) {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listEnrollments(course.id);
    setLoading(false);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر تحميل الملتحقين');
    else setItems(data);
  }, [course.id, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const onGrant = async () => {
    if (!email.trim()) {
      showError('اكتبي إيميل الأم.');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setBusy(true);
    const { error } = await grantCourseByEmail(course.id, email);
    setBusy(false);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر فتح الدورة');
      return;
    }
    showSuccess('تم فتح الدورة للأم');
    setEmail('');
    await reload();
  };

  const onRevoke = async (item) => {
    if (!window.confirm(`قفل الدورة عن ${item.email || item.name}؟`)) return;
    const { error } = await revokeCourse(course.id, item.userId);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر القفل');
      return;
    }
    showSuccess('تم قفل الدورة');
    await reload();
  };

  return (
    <AdminCard>
      <SectionHeader title={`الأمهات اللي معاهم الدورة — ${course.title}`} />
      <p className="text-caption" style={{ margin: '4px 0 12px' }}>
        {course.accessType === 'paid'
          ? 'لو الأم دفعت بالتحويل اليدوي، اكتبي إيميلها هنا علشان الدورة تتفتح لها. الدفع بـ PayPal بيفتحها لوحده.'
          : 'الدورة متاحة لكل المشتركات في الباقة. تقدري تفتحيها هنا لأم مش مشتركة.'}
      </p>
      <div className="filters-row">
        <input
          type="email"
          dir="ltr"
          placeholder="mom@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: '1 1 220px' }}
        />
        <button type="button" className="mock-btn mock-btn--primary" disabled={busy} onClick={onGrant}>
          <UserPlus size={14} /> {busy ? 'جاري الفتح…' : 'فتح الدورة'}
        </button>
      </div>

      {loading ? (
        <MockLoading label="جاري التحميل…" />
      ) : items.length === 0 ? (
        <p className="text-caption">لسه مفيش أمهات اتفتحت لهم الدورة.</p>
      ) : (
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>الإيميل</th>
                <th>الاسم</th>
                <th>الطريقة</th>
                <th>التاريخ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.userId}>
                  <td dir="ltr">{item.email || '—'}</td>
                  <td>{item.name || '—'}</td>
                  <td>{sourceLabel[item.source] ?? item.source}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '4px 8px' }}
                      aria-label="قفل"
                      onClick={() => onRevoke(item)}
                    >
                      <UserX size={14} />
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
