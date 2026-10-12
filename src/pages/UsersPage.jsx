import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { ActiveFilters } from '../components/ActiveFilters';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { fetchAppProfiles, fetchAppChildren } from '../services/supabase/usersService';

function UserDetailPanel({ user, childrenList }) {
  const userChildren = childrenList.filter((c) => c.parentId === user.id);
  return (
    <>
      {user.role && (
        <p>
          <strong>الدور:</strong> {user.role}
        </p>
      )}
      <p>
        <strong>الحالة:</strong>{' '}
        <StatusBadge tone={user.status === 'مسجّل' ? 'success' : 'muted'}>{user.status}</StatusBadge>
      </p>
      <p>
        <strong>عدد الأطفال:</strong> {user.childrenCount}
      </p>
      {userChildren.length > 0 && (
        <>
          <SectionHeader title="أطفال ولي الأمر" />
          <ul>
            {userChildren.map((c) => (
              <li key={c.id}>
                {c.name} — {c.age} — {c.curriculumStatus}
              </li>
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
      <p>
        <strong>ولي الأمر:</strong> {child.parent}
      </p>
      <p>
        <strong>العمر:</strong> {child.age} — <strong>النوع:</strong> {child.gender}
      </p>
      <p>
        <strong>حالة الحساب:</strong> {child.curriculumStatus}
      </p>
    </>
  );
}

export function UsersPage() {
  const { showError } = useSnackbar();
  const [tab, setTab] = useState('users');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [remoteChildren, setRemoteChildren] = useState([]);
  const [filterAge, setFilterAge] = useState('all');
  const [pageQuery, setPageQuery] = useState('');

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const [profilesRes, childrenRes] = await Promise.all([
        fetchAppProfiles(),
        fetchAppChildren(),
      ]);
      if (!cancelled) {
        setRemoteUsers(profilesRes.data ?? []);
        setRemoteChildren(childrenRes.data ?? []);
        if (profilesRes.error || childrenRes.error) {
          showError('تعذّر تحميل المستخدمين من السحابة');
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const matchesQuery = (text) =>
    !pageQuery.trim() || text.toLowerCase().includes(pageQuery.trim().toLowerCase());

  const filteredUsers = useMemo(() => {
    return remoteUsers.filter((u) => matchesQuery(`${u.name} ${u.email ?? ''} ${u.role ?? ''}`));
  }, [remoteUsers, pageQuery]);

  const filteredChildren = useMemo(() => {
    return remoteChildren.filter((c) => {
      if (filterAge !== 'all' && c.ageKey !== filterAge) return false;
      return matchesQuery(`${c.name} ${c.parent} ${c.curriculumStatus}`);
    });
  }, [remoteChildren, filterAge, pageQuery]);

  const activeFilterItems = useMemo(() => {
    const items = [];
    if (pageQuery.trim()) {
      items.push({ id: 'q', label: `بحث: ${pageQuery.trim()}`, onRemove: () => setPageQuery('') });
    }
    if (filterAge !== 'all' && tab === 'children') {
      items.push({ id: 'age', label: `عمر: ${filterAge}`, onRemove: () => setFilterAge('all') });
    }
    return items;
  }, [pageQuery, filterAge, tab]);

  const handleView = (row, e) => {
    e?.stopPropagation();
    setSelected(row);
  };

  return (
    <div className="page-stack">
      <PageHeader title="المستخدمون والأطفال" />

      {!isSupabaseEnabled && (
        <EmptyState title="السحابة غير مفعّلة" description="فعّلي الاتصال لعرض الحسابات الحقيقية." />
      )}

      <div className="tabs">
        {[
          ['users', 'المستخدمون'],
          ['children', 'الأطفال'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setSelected(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ActiveFilters
        items={activeFilterItems}
        onClearAll={
          activeFilterItems.length
            ? () => {
                setPageQuery('');
                setFilterAge('all');
              }
            : undefined
        }
      />

      <div className="filters-row">
        <input
          type="search"
          className="page-search-input"
          placeholder="بحث بالاسم…"
          value={pageQuery}
          onChange={(e) => setPageQuery(e.target.value)}
        />
        {tab === 'children' && (
          <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
            <option value="all">كل الأعمار</option>
            <option value="0-3">0-3 شهور</option>
            <option value="3-6">3-6 شهور</option>
            <option value="6-12">6-12 شهر</option>
            <option value="12-18">1-1.5 سنة</option>
          </select>
        )}
      </div>

      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل المستخدمين…" />
        </AdminCard>
      )}

      {!loading && tab === 'users' && (
        <AdminCard>
          {filteredUsers.length === 0 ? (
            <EmptyState title="لا مستخدمين" description="مافيش حسابات مطابقة للبحث." />
          ) : (
            <AdminTableContainer>
              <table className="admin-table admin-table--cards">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الدور</th>
                    <th>عدد الأطفال</th>
                    <th>تاريخ التسجيل</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={selected?.id === u.id && !selected?.ageKey ? 'selected' : ''}
                      onClick={() => setSelected(u)}
                    >
                      <td data-label="الاسم">{u.name}</td>
                      <td data-label="الدور">{u.role ?? '—'}</td>
                      <td data-label="عدد الأطفال">{u.childrenCount}</td>
                      <td data-label="تاريخ التسجيل">{u.lastActive}</td>
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
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((c) => (
                    <tr
                      key={c.id}
                      className={selected?.id === c.id && selected?.ageKey ? 'selected' : ''}
                      onClick={() => setSelected(c)}
                    >
                      <td data-label="اسم الطفل">{c.name}</td>
                      <td data-label="العمر">{c.age}</td>
                      <td data-label="النوع">{c.gender}</td>
                      <td data-label="ولي الأمر">{c.parent}</td>
                      <td data-label="الحالة">{c.curriculumStatus}</td>
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

      {selected && !loading && (
        <AdminCard className="detail-panel">
          <SectionHeader title={`تفاصيل: ${selected.name}`} />
          {selected.ageKey ? (
            <ChildDetailPanel child={selected} />
          ) : (
            <UserDetailPanel user={selected} childrenList={remoteChildren} />
          )}
        </AdminCard>
      )}
    </div>
  );
}
