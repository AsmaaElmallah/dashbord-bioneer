import { Pencil, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminTableContainer } from './AdminTableContainer';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { deleteClubGroup, fetchClubGroups, saveClubGroup } from '../services/supabase/communityService';
import { listCourses } from '../services/supabase/coursesService';

/** Same names as AppArt in the app (3D icons). */
export const groupIcons = [
  ['graduationCap', '🎓 قبعة تخرج (دورات)'],
  ['people', '👥 ناس (مجتمع)'],
  ['books', '📚 كتب'],
  ['calendar', '🗓️ نتيجة (مواعيد)'],
  ['megaphone', '📣 ميكروفون (إعلانات)'],
  ['heart', '❤️ قلب'],
  ['star', '⭐ نجمة'],
  ['lightBulb', '💡 لمبة (أفكار)'],
  ['babyBottle', '🍼 رضاعة'],
  ['teddyBear', '🧸 دبدوب'],
  ['quran', '📖 قرآن'],
  ['abacus', '🧮 حساب'],
];

const emptyDraft = {
  id: null,
  title: '',
  description: '',
  iconKey: 'graduationCap',
  courseId: '',
  infoNote: '',
  sortOrder: 0,
  published: true,
};

/** جروبات نادي الأمهات: إنشاء وتعديل وحذف. */
export function ClubGroupsPanel({ notify, onChanged }) {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [g, c] = await Promise.all([fetchClubGroups(), listCourses()]);
    if (g.error) notify('تعذّر تحميل الجروبات — اتأكدي إن SQL الجروبات (047) اتشغّل');
    setGroups(g.data ?? []);
    setCourses(c.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = async () => {
    if (draft.title.trim().length < 3) {
      notify('اكتبي اسم الجروب');
      return;
    }
    setSaving(true);
    const { error } = await saveClubGroup(draft);
    setSaving(false);
    if (error) {
      notify(error.message ?? 'تعذّر حفظ الجروب');
      return;
    }
    notify(draft.id ? 'الجروب اتعدّل ✓' : 'الجروب اتعمل وظاهر للأمهات ✓');
    setDraft(emptyDraft);
    await load();
    await onChanged?.();
  };

  const edit = (g) =>
    setDraft({
      id: g.id,
      title: g.title,
      description: g.description ?? '',
      iconKey: g.icon_key ?? 'people',
      courseId: g.course_id ?? '',
      infoNote: g.info_note ?? '',
      sortOrder: g.sort_order ?? 0,
      published: g.publish_status === 'published',
    });

  const remove = async (g) => {
    if (!window.confirm(`حذف جروب «${g.title}» نهائياً مع كل منشوراته؟`)) return;
    const { error } = await deleteClubGroup(g.id);
    if (error) {
      notify(error.message ?? 'تعذّر الحذف');
      return;
    }
    notify('الجروب اتحذف');
    if (draft.id === g.id) setDraft(emptyDraft);
    await load();
    await onChanged?.();
  };

  const courseTitle = (id) => courses.find((c) => c.id === id)?.title ?? '';

  return (
    <div style={{ marginBottom: 24 }}>
      <SectionHeader title="جروبات النادي" />
      <p className="text-caption" style={{ margin: '4px 0 12px' }}>
        الجروب مفتوح لكل الأمهات، ومنشوراتهم فيه بتتنشر على طول. لو ربطتيه بدورة، هيظهر في الجروب ميعاد اللايف الجاي
        للدورة بعداد تنازلي.
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <strong>{draft.id ? `تعديل «${draft.title}»` : 'جروب جديد'}</strong>
        <input type="text" placeholder="اسم الجروب (مثلاً: جروب دورة النوم)" value={draft.title} onChange={set('title')} />
        <textarea rows={2} placeholder="وصف قصير يظهر تحت الاسم" value={draft.description} onChange={set('description')} />
        <textarea
          rows={4}
          placeholder="عن الجروب: المواعيد وإيه هيتدرس… (بيظهر مثبّت فوق في الجروب)"
          value={draft.infoNote}
          onChange={set('infoNote')}
        />
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <label className="cms-field">
            الأيقونة
            <select value={draft.iconKey} onChange={set('iconKey')}>
              {groupIcons.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="cms-field">
            مربوط بدورة؟
            <select value={draft.courseId} onChange={set('courseId')}>
              <option value="">لأ — جروب عام</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="cms-field">
            الترتيب
            <input type="number" value={draft.sortOrder} onChange={set('sortOrder')} />
          </label>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={draft.published} onChange={set('published')} />
          ظاهر للأمهات
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn--primary" disabled={saving} onClick={save}>
            {saving ? 'جاري الحفظ…' : draft.id ? 'حفظ التعديل' : 'إنشاء الجروب'}
          </button>
          {draft.id && (
            <button type="button" className="btn" onClick={() => setDraft(emptyDraft)}>
              إلغاء
            </button>
          )}
        </div>
      </div>

      <AdminTableContainer>
        <table className="admin-table">
          <thead>
            <tr>
              <th>الجروب</th>
              <th>الدورة</th>
              <th>الأعضاء</th>
              <th>المنشورات</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6}>لسه مفيش جروبات</td>
              </tr>
            ) : (
              groups.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{g.title}</div>
                    <div className="text-caption">{g.description}</div>
                  </td>
                  <td>{g.course_id ? courseTitle(g.course_id) || '—' : '—'}</td>
                  <td>
                    <Users size={14} style={{ verticalAlign: 'middle' }} /> {g.members_count ?? 0}
                  </td>
                  <td>{g.posts_count ?? 0}</td>
                  <td>
                    <StatusBadge tone={g.publish_status === 'published' ? 'success' : 'muted'}>
                      {g.publish_status === 'published' ? 'ظاهر' : 'مخفي'}
                    </StatusBadge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="mock-btn mock-btn--outline" style={{ padding: '4px 10px' }} onClick={() => edit(g)}>
                        <Pencil size={14} /> تعديل
                      </button>
                      <button type="button" className="mock-btn mock-btn--danger" style={{ padding: '4px 10px' }} onClick={() => remove(g)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableContainer>
    </div>
  );
}
