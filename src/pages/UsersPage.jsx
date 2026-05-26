import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { MockLoading } from '../components/MockLoading';
import { ActiveFilters } from '../components/ActiveFilters';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { FilterChips } from '../components/FilterChips';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  children,
  followUpProfiles,
  matchesPublishChip,
  publishFilterChips,
  users,
} from '../data/mockData';

function UserDetailPanel({ user }) {
  const userChildren = children.filter((c) => c.parentId === user.id);
  return (
    <>
      <p><strong>البريد:</strong> {user.email}</p>
      <p><strong>الباقة:</strong> {user.plan} — <StatusBadge tone={user.status === 'نشط' ? 'success' : 'muted'}>{user.status}</StatusBadge></p>
      <p><strong>عدد الأطفال:</strong> {user.childrenCount}</p>
      {userChildren.length > 0 && (
        <>
          <SectionHeader title="أطفال ولي الأمر" />
          <ul>
            {userChildren.map((c) => (
              <li key={c.id}>{c.name} — {c.age} — {c.curriculumStatus}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function ChildDetailPanel({ child }) {
  return (
    <>
      <p><strong>ولي الأمر:</strong> {child.parent}</p>
      <p><strong>العمر:</strong> {child.age} — <strong>النوع:</strong> {child.gender}</p>
      <p><strong>التغذية:</strong> {child.nutrition}</p>
      <p><strong>النوم:</strong> {child.sleep}</p>
      <p><strong>نشاط بدني:</strong> {child.physicalActivity}</p>
      <SectionHeader title="تقدم المناهج (mock)" />
      <ul>
        <li>القرآن: {child.progress.quran}</li>
        <li>الحساب: {child.progress.math}</li>
        <li>البصري: {child.progress.visual}</li>
        <li>العاطفي: {child.progress.emotional}</li>
      </ul>
      <p><strong>ملاحظات السلوك:</strong> {child.behaviorNotes || '—'}</p>
      <p><strong>احتياجات خاصة:</strong> {child.specialNeeds ? child.specialNeedsDetails : 'لا'}</p>
    </>
  );
}

export function UsersPage() {
  const { showMock } = useSnackbar();
  const [tab, setTab] = useState('users');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterAge, setFilterAge] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  const [filterCurriculum, setFilterCurriculum] = useState('all');
  const [statusChip, setStatusChip] = useState('all');
  const [pageQuery, setPageQuery] = useState('');

  const matchesQuery = (text) => !pageQuery.trim() || text.toLowerCase().includes(pageQuery.trim().toLowerCase());

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!matchesPublishChip(u, statusChip)) return false;
      if (filterPlan !== 'all' && u.plan !== filterPlan) return false;
      if (filterActivity !== 'all' && u.lastActiveKey !== filterActivity) return false;
      if (!matchesQuery(`${u.name} ${u.email}`)) return false;
      return true;
    });
  }, [filterPlan, filterActivity, statusChip, pageQuery]);

  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      if (!matchesPublishChip(c, statusChip)) return false;
      if (filterAge !== 'all' && c.ageKey !== filterAge) return false;
      if (filterCurriculum !== 'all' && c.curriculumKey !== filterCurriculum) return false;
      if (filterPlan !== 'all') {
        const parent = users.find((u) => u.id === c.parentId);
        if (!parent || parent.plan !== filterPlan) return false;
      }
      if (!matchesQuery(`${c.name} ${c.parent} ${c.curriculumStatus}`)) return false;
      return true;
    });
  }, [filterAge, filterCurriculum, filterPlan, statusChip, pageQuery]);

  const filteredFollowUp = useMemo(() => {
    return followUpProfiles.filter((f) => {
      const child = children.find((c) => c.name === f.childName);
      if (child && !matchesPublishChip(child, statusChip)) return false;
      if (!matchesQuery(`${f.childName} ${f.parent} ${f.reason}`)) return false;
      return true;
    });
  }, [statusChip, pageQuery]);

  const activeFilterItems = useMemo(() => {
    const items = [];
    if (statusChip !== 'all') {
      const chip = publishFilterChips.find((c) => c.id === statusChip);
      items.push({ id: 'chip', label: chip?.label ?? statusChip, onRemove: () => setStatusChip('all') });
    }
    if (pageQuery.trim()) {
      items.push({ id: 'q', label: `بحث: ${pageQuery.trim()}`, onRemove: () => setPageQuery('') });
    }
    if (filterPlan !== 'all') {
      items.push({ id: 'plan', label: `باقة: ${filterPlan}`, onRemove: () => setFilterPlan('all') });
    }
    if (filterActivity !== 'all' && tab === 'users') {
      items.push({ id: 'activity', label: 'فلتر النشاط', onRemove: () => setFilterActivity('all') });
    }
    if (filterAge !== 'all' && tab !== 'users') {
      items.push({ id: 'age', label: `عمر: ${filterAge}`, onRemove: () => setFilterAge('all') });
    }
    if (filterCurriculum !== 'all' && tab !== 'users') {
      items.push({ id: 'curr', label: 'فلتر المنهج', onRemove: () => setFilterCurriculum('all') });
    }
    return items;
  }, [statusChip, pageQuery, filterPlan, filterActivity, filterAge, filterCurriculum, tab]);

  const clearAllFilters = () => {
    setStatusChip('all');
    setPageQuery('');
    setFilterPlan('all');
    setFilterActivity('all');
    setFilterAge('all');
    setFilterCurriculum('all');
  };

  const handleView = (row, e) => {
    e?.stopPropagation();
    setSelected(row);
  };

  const simulateLoad = () => {
    setLoading(true);
    setSelected(null);
    window.setTimeout(() => setLoading(false), 800);
  };

  const statusTone = (s) => {
    if (s === 'نشط' || s === 'تجربة') return s === 'نشط' ? 'success' : 'info';
    return 'muted';
  };

  return (
    <div className="page-stack">
      <PageHeader title="المستخدمون والأطفال" extraBadges={['mock data']} />

      <div className="tabs">
        {[
          ['users', 'المستخدمون'],
          ['children', 'الأطفال'],
          ['follow', 'ملفات تحتاج متابعة'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setSelected(null);
              if (id === 'children') {
                const first = children.find((c) => matchesPublishChip(c, statusChip));
                if (first) setSelected(first);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterChips value={statusChip} onChange={setStatusChip} />
      <ActiveFilters items={activeFilterItems} onClearAll={activeFilterItems.length ? clearAllFilters : undefined} />

      <div className="filters-row">
        <input
          type="search"
          className="page-search-input"
          placeholder="بحث في هذه الصفحة (اسم، بريد، ولي أمر…)"
          value={pageQuery}
          onChange={(e) => setPageQuery(e.target.value)}
        />
        {(tab === 'children' || tab === 'follow') && (
          <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
            <option value="all">كل الأعمار</option>
            <option value="0-3">0-3 شهور</option>
            <option value="3-6">3-6 شهور</option>
            <option value="6-12">6-12 شهر</option>
            <option value="12-18">1-1.5 سنة</option>
          </select>
        )}
        {tab !== 'follow' && (
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">كل الباقات</option>
            <option value="ذهبية">ذهبية</option>
            <option value="فضية">فضية</option>
            <option value="شهرية">شهرية</option>
            <option value="برونزية">برونزية</option>
          </select>
        )}
        {tab === 'users' && (
          <select value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
            <option value="all">آخر نشاط</option>
            <option value="recent">آخر 24 ساعة</option>
            <option value="week">آخر أسبوع</option>
            <option value="old">أقدم</option>
          </select>
        )}
        {(tab === 'children' || tab === 'follow') && (
          <select value={filterCurriculum} onChange={(e) => setFilterCurriculum(e.target.value)}>
            <option value="all">حالة المنهج</option>
            <option value="new">بداية</option>
            <option value="active">نشط</option>
            <option value="paused">متوقف</option>
          </select>
        )}
        <MockActionButton variant="outline" onClick={simulateLoad}>
          محاكاة تحميل
        </MockActionButton>
      </div>

      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل المستخدمين…" />
        </AdminCard>
      )}

      {!loading && tab === 'users' && (
        <AdminCard>
          {filteredUsers.length === 0 ? (
            <EmptyState title="لا مستخدمين" description="جرّبي تغيير الفلاتر" />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--cards">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد</th>
                    <th>حالة الحساب</th>
                    <th>الباقة</th>
                    <th>عدد الأطفال</th>
                    <th>آخر نشاط</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={selected?.id === u.id && !selected?.progress ? 'selected' : ''}
                      onClick={() => setSelected(u)}
                    >
                      <td data-label="الاسم">{u.name}</td>
                      <td data-label="البريد">{u.email}</td>
                      <td data-label="حالة الحساب"><StatusBadge tone={statusTone(u.status)}>{u.status}</StatusBadge></td>
                      <td data-label="الباقة">{u.plan}</td>
                      <td data-label="عدد الأطفال">{u.childrenCount}</td>
                      <td data-label="آخر نشاط">{u.lastActive}</td>
                      <td data-label="إجراء">
                        <button
                          type="button"
                          className="mock-btn mock-btn--outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={(e) => handleView(u, e)}
                        >
                          <Eye size={14} /> عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>
      )}

      {!loading && tab === 'children' && (
        <AdminCard>
          {filteredChildren.length === 0 ? (
            <EmptyState title="لا أطفال" description="لا نتائج لهذه الفلاتر" />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--cards">
                <thead>
                  <tr>
                    <th>اسم الطفل</th>
                    <th>العمر</th>
                    <th>النوع</th>
                    <th>ولي الأمر</th>
                    <th>التغذية</th>
                    <th>النوم</th>
                    <th>النشاط البدني</th>
                    <th>حالة المنهج</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((c) => (
                    <tr
                      key={c.id}
                      className={selected?.id === c.id && selected?.progress ? 'selected' : ''}
                      onClick={() => setSelected(c)}
                    >
                      <td data-label="اسم الطفل">{c.name}</td>
                      <td data-label="العمر">{c.age}</td>
                      <td data-label="النوع">{c.gender}</td>
                      <td data-label="ولي الأمر">{c.parent}</td>
                      <td data-label="التغذية">{c.nutrition}</td>
                      <td data-label="النوم">{c.sleep}</td>
                      <td data-label="النشاط البدني">{c.physicalActivity}</td>
                      <td data-label="حالة المنهج">{c.curriculumStatus}</td>
                      <td data-label="إجراء">
                        <button
                          type="button"
                          className="mock-btn mock-btn--outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={(e) => handleView(c, e)}
                        >
                          <Eye size={14} /> عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>
      )}

      {!loading && tab === 'follow' && (
        <AdminCard>
          {filteredFollowUp.length === 0 ? (
            <EmptyState title="لا ملفات معلّقة" description="جرّبي تغيير الفلاتر أو البحث" />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--cards">
                <thead>
                  <tr>
                    <th>الطفل</th>
                    <th>ولي الأمر</th>
                    <th>السبب</th>
                    <th>الأولوية</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFollowUp.map((f) => {
                    const child = children.find((c) => c.name === f.childName);
                    return (
                      <tr
                        key={f.id}
                        className={selected?.id === child?.id ? 'selected' : ''}
                        onClick={() => child && setSelected(child)}
                      >
                        <td data-label="الطفل">{f.childName}</td>
                        <td data-label="ولي الأمر">{f.parent}</td>
                        <td data-label="السبب">{f.reason}</td>
                        <td data-label="الأولوية">
                          <StatusBadge tone={f.priority === 'عالية' ? 'error' : 'warning'}>
                            {f.priority}
                          </StatusBadge>
                        </td>
                        <td data-label="إجراء">
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={(e) => child && handleView(child, e)}
                          >
                            عرض
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>
      )}

      {selected && !loading && (
        <AdminCard className="detail-panel">
          <SectionHeader
            title={`تفاصيل: ${selected.name}`}
            action={<MockActionButton variant="outline" onClick={() => showMock()}>تعديل (mock)</MockActionButton>}
          />
          {selected.progress ? <ChildDetailPanel child={selected} /> : <UserDetailPanel user={selected} />}
        </AdminCard>
      )}
    </div>
  );
}
