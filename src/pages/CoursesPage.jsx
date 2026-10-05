import { GraduationCap, ListVideo, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { CourseEnrollmentsPanel } from '../components/CourseEnrollmentsPanel';
import { CourseLessonsManager } from '../components/CourseLessonsManager';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MediaCoverPick } from '../components/MediaCoverPick';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  accessLabel,
  courseAccessOptions,
  coursePublishLabel,
  coursePublishOptions,
  deleteCourse,
  emptyCourseDraft,
  listCourses,
  saveCourse,
  translateCoursesError,
  validateCourse,
} from '../services/supabase/coursesService';

const publishTone = { published: 'success', draft: 'muted', archived: 'muted' };
const accessTone = { free: 'success', subscription: 'info', paid: 'warning' };

export function CoursesPage() {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listCourses();
    setLoading(false);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر تحميل الدورات');
    else setCourses(data);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selected = courses.find((c) => c.id === selectedId) ?? null;
  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const onSave = async () => {
    const issue = validateCourse(draft);
    if (issue) {
      showError(issue);
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setSaving(true);
    const { data, error } = await saveCourse(draft);
    setSaving(false);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showSuccess(draft.publishStatus === 'published' ? 'تم حفظ الدورة ونشرها في التطبيق' : 'تم حفظ الدورة');
    setDraft(null);
    await reload();
    if (data?.id) setSelectedId(data.id);
  };

  const onDelete = async (course) => {
    if (!window.confirm(`حذف دورة «${course.title}» وكل دروسها وفيديوهاتها نهائياً؟`)) return;
    const { error } = await deleteCourse(course.id);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر الحذف');
      return;
    }
    showSuccess('تم حذف الدورة');
    if (selectedId === course.id) setSelectedId(null);
    if (draft?.id === course.id) setDraft(null);
    await reload();
  };

  return (
    <div className="page-stack">
      <PageHeader title="الدورات" extraBadges={[`${courses.length} دورة`]} />
      <InfoBanner tone="info">
        كل دورة ليها صورة ووصف ودروس فيديو. فيديو الدرس يترفع على Supabase (حد أقصى 50 ميجا للملف في الباقة
        المجانية — اضغطي الفيديو ببرنامج HandBrake على 720p)، أو حطي رابط YouTube «غير مُدرج» للفيديوهات الطويلة.
        الدورات المدفوعة تتفتح للأم من هنا يدوياً لحد ما نربط الشراء من المتجر.
      </InfoBanner>

      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SectionHeader title="كل الدورات" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => setDraft(emptyCourseDraft(courses.length))}
            >
              <Plus size={16} /> دورة جديدة
            </button>
          </div>
        </div>

        {loading ? (
          <MockLoading label="جاري تحميل الدورات…" />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="لا توجد دورات بعد"
            description="اضغطي «دورة جديدة» لإضافة أول دورة."
            compact
          />
        ) : (
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الدورة</th>
                  <th>الوصول</th>
                  <th>الدروس</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className={selectedId === course.id ? 'selected' : ''}
                    onClick={() => setSelectedId(course.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      {course.coverUrl ? (
                        <img
                          src={course.coverUrl}
                          alt=""
                          style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {course.title}
                      <div className="text-caption text-truncate">
                        {course.instructorName || course.subtitle}
                      </div>
                    </td>
                    <td>
                      <StatusBadge tone={accessTone[course.accessType] ?? 'muted'}>
                        {accessLabel(course.accessType)}
                      </StatusBadge>
                    </td>
                    <td>{course.lessonCount}</td>
                    <td>
                      <StatusBadge tone={publishTone[course.publishStatus] ?? 'muted'}>
                        {coursePublishLabel(course.publishStatus)}
                      </StatusBadge>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="الدروس"
                        title="الدروس"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(course.id);
                        }}
                      >
                        <ListVideo size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="تعديل"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraft({ ...course });
                        }}
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="حذف"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(course);
                        }}
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

      {draft && (
        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={draft.id ? `تعديل — ${draft.title}` : 'دورة جديدة'} />
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <MediaCoverPick
            label="صورة الدورة (تظهر في قائمة الدورات)"
            value={draft.coverUrl}
            onChange={(url) => patch({ coverUrl: url })}
          />
          <label className="cms-field">
            اسم الدورة
            <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              سطر قصير تحت الاسم
              <input
                type="text"
                placeholder="مثال: 6 دروس عن نوم الرضيع"
                value={draft.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
              />
            </label>
            <label className="cms-field">
              اسم المدرّبة
              <input
                type="text"
                value={draft.instructorName}
                onChange={(e) => patch({ instructorName: e.target.value })}
              />
            </label>
          </div>
          <label className="cms-field">
            وصف الدورة
            <textarea
              rows={4}
              placeholder="الدورة دي هتتعلمي فيها…"
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              الوصول
              <select value={draft.accessType} onChange={(e) => patch({ accessType: e.target.value })}>
                {courseAccessOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              حالة النشر
              <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                {coursePublishOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {draft.accessType === 'paid' && (
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                السعر (يظهر للأم)
                <input
                  type="text"
                  placeholder="مثال: 199 جنيه"
                  value={draft.priceLabel}
                  onChange={(e) => patch({ priceLabel: e.target.value })}
                />
              </label>
              <label className="cms-field">
                كود المنتج في Google Play (لو فاضي: زرار واتساب بدل الشراء)
                <input
                  type="text"
                  dir="ltr"
                  placeholder="course_sleep_basics"
                  value={draft.storeProductIdAndroid}
                  onChange={(e) => patch({ storeProductIdAndroid: e.target.value })}
                />
              </label>
            </div>
          )}
          <label className="cms-field">
            الترتيب
            <input type="number" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ الدورة'}
            </button>
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)}>
              <X size={14} /> إلغاء
            </button>
          </div>
        </AdminCard>
      )}

      {selected && (
        <CourseLessonsManager key={selected.id} course={selected} onLessonsChanged={reload} />
      )}

      {selected && selected.accessType !== 'free' && (
        <CourseEnrollmentsPanel key={`enroll_${selected.id}`} course={selected} />
      )}
    </div>
  );
}
