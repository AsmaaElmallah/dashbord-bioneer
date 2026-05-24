import { useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  activityAgeGroups,
  activityMediaItems,
  exerciseAgeGroups,
  exerciseMediaItems,
  incompleteMediaAgeGroups,
  mediaAgeGroupsUnified,
} from '../data/mockData';

const statusTone = {
  مكتمل: 'success',
  'قيد الإضافة': 'warning',
  'قيد الإضافة (أنشطة)': 'warning',
  ناقص: 'error',
};

const tabs = [
  ['activities', 'الأنشطة'],
  ['exercises', 'الرياضة والتمارين'],
  ['ages', 'الفئات العمرية'],
  ['missing', 'المحتوى الناقص'],
];

export function ActivitiesPage() {
  const [tab, setTab] = useState('activities');
  const [selectedId, setSelectedId] = useState(null);

  const ageGroupsForTab = useMemo(() => {
    if (tab === 'activities') return activityAgeGroups;
    if (tab === 'exercises') return exerciseAgeGroups;
    if (tab === 'missing') return incompleteMediaAgeGroups;
    return mediaAgeGroupsUnified;
  }, [tab]);

  const itemsForTab = useMemo(() => {
    if (tab === 'activities') return activityMediaItems;
    if (tab === 'exercises') return exerciseMediaItems;
    return [];
  }, [tab]);

  const previewItem = itemsForTab.find((i) => i.id === selectedId) ?? itemsForTab[0] ?? null;
  const previewGroup =
    ageGroupsForTab.find((g) => g.id === selectedId) ??
    (previewItem
      ? [...activityAgeGroups, ...exerciseAgeGroups].find((g) => g.id === previewItem.ageGroupId)
      : null);

  const showItemsTable = tab === 'activities' || tab === 'exercises';
  const showEmpty =
    (tab === 'missing' && incompleteMediaAgeGroups.length === 0) ||
    (tab === 'activities' && activityMediaItems.length === 0);

  return (
    <div className="page-stack">
      <PageHeader title="الأنشطة والرياضة" />

      <InfoBanner tone="info">
        UI فقط — بيانات من <code>activities_catalog.dart</code> و{' '}
        <code>exercises_catalog.dart</code> و MediaAgeHub. لا فتح YouTube فعلي.
      </InfoBanner>

      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setSelectedId(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {showEmpty && tab === 'missing' ? (
        <EmptyState
          title="لا فئات ناقصة"
          description="جميع الفئات العمرية تحتوي على محتوى في كatalog التمارين — الأنشطة للأعمار 0–9 شهر ما زالت قيد الإضافة."
        />
      ) : (
        <div className="grid-2">
          <AdminCard>
            <SectionHeader
              title={
                tab === 'ages'
                  ? 'جدول الفئات العمرية'
                  : tab === 'missing'
                    ? 'فئات بلا محتوى (أنشطة)'
                    : tab === 'activities'
                      ? 'فئات الأنشطة'
                      : 'فئات التمارين'
              }
            />
            {tab === 'missing' && incompleteMediaAgeGroups.length > 0 && (
              <InfoBanner tone="warning" style={{ marginBottom: 12 }}>
                الفئات التالية بلا عناصر في catalog الأنشطة — الحالة «قيد الإضافة» في التطبيق.
              </InfoBanner>
            )}
            <AdminTableContainer style={{ maxHeight: tab === 'ages' ? 360 : 220 }}>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>العنوان</th>
                    <th>subtitle</th>
                    {tab === 'ages' ? (
                      <>
                        <th>أنشطة</th>
                        <th>تمارين</th>
                      </>
                    ) : (
                      <th>عناصر</th>
                    )}
                    <th>parent note</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {ageGroupsForTab.map((g) => (
                    <tr
                      key={`${g.track ?? 'u'}_${g.id}`}
                      className={selectedId === g.id ? 'selected' : ''}
                      onClick={() => setSelectedId(g.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <code style={{ fontSize: '0.7rem' }}>{g.id}</code>
                      </td>
                      <td>{g.title}</td>
                      <td style={{ fontSize: '0.78rem' }}>{g.subtitle}</td>
                      {tab === 'ages' ? (
                        <>
                          <td>{g.activityCount}</td>
                          <td>{g.exerciseCount}</td>
                        </>
                      ) : (
                        <td>{g.itemCount}</td>
                      )}
                      <td style={{ fontSize: '0.72rem', maxWidth: 140 }}>
                        {g.parentNote ?? '—'}
                      </td>
                      <td>
                        <StatusBadge tone={statusTone[g.status] ?? 'muted'}>
                          {g.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>

            {showItemsTable && (
              <>
                <SectionHeader title="جدول العناصر" />
                {itemsForTab.length === 0 ? (
                  <EmptyState title="لا عناصر منشورة" description="اختر فئة عمرية قيد الإضافة في تبويب المحتوى الناقص." />
                ) : (
                  <AdminTableContainer style={{ maxHeight: 280 }}>
                    <table className="admin-table admin-table--compact">
                      <thead>
                        <tr>
                          <th>العنوان</th>
                          <th>العمر</th>
                          <th>videoId</th>
                          <th>playlist</th>
                          <th>mood</th>
                          <th>يظهر في</th>
                          <th>النشر</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsForTab.map((item) => (
                          <tr
                            key={item.id}
                            className={previewItem?.id === item.id ? 'selected' : ''}
                            onClick={() => setSelectedId(item.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{item.title}</td>
                            <td>{item.ageLabel}</td>
                            <td>
                              <code style={{ fontSize: '0.68rem' }}>{item.videoId ?? '—'}</code>
                            </td>
                            <td>
                              <code style={{ fontSize: '0.65rem' }}>
                                {item.playlistId ? `${item.playlistId.slice(0, 10)}…` : '—'}
                              </code>
                            </td>
                            <td>{item.moodTag}</td>
                            <td style={{ fontSize: '0.72rem' }}>{item.showsIn}</td>
                            <td>
                              <StatusBadge tone="success">{item.publishStatus}</StatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </AdminTableContainer>
                )}
              </>
            )}
          </AdminCard>

          <AdminCard>
            <SectionHeader title="من سيظهر لهذا المحتوى؟" />
            {previewItem ? (
              <>
                <h4 style={{ margin: '0 0 8px' }}>{previewItem.title}</h4>
                <p>
                  <strong>الفئة العمرية:</strong> {previewItem.ageLabel} (
                  <code>{previewItem.ageGroupId}</code>)
                </p>
                <p>
                  <strong>القسم:</strong> {previewItem.section}
                </p>
                <p>
                  <strong>الاشتراك المطلوب (mock):</strong> باقة{' '}
                  {previewItem.subscriptionRequired} فأعلى
                </p>
                <p>
                  <strong>يظهر في التطبيق:</strong> {previewItem.showsIn}
                </p>
                {previewItem.videoId && (
                  <p>
                    <strong>videoId:</strong> <code>{previewItem.videoId}</code>
                  </p>
                )}
                {previewItem.playlistId && (
                  <p>
                    <strong>playlistId:</strong>{' '}
                    <code style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
                      {previewItem.playlistId}
                    </code>
                  </p>
                )}
                <StatusBadge tone="success">{previewItem.publishStatus}</StatusBadge>
              </>
            ) : previewGroup ? (
              <>
                <h4 style={{ margin: '0 0 8px' }}>{previewGroup.title}</h4>
                <p>{previewGroup.subtitle}</p>
                <p>
                  <strong>عدد العناصر:</strong> {previewGroup.itemCount ?? 0}
                </p>
                {previewGroup.itemCount === 0 ? (
                  <EmptyState
                    title="لا محتوى بعد"
                    description={previewGroup.parentNote ?? 'ستُضاف عناصر YouTube لاحقاً.'}
                  />
                ) : (
                  <p className="text-caption">اختر عنصراً من الجدول لمعاينة التفاصيل.</p>
                )}
              </>
            ) : (
              <p className="text-caption">اختر فئة أو عنصراً من الجداول.</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
