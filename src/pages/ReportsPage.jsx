import { useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import {
  reportsCurriculumPerformance,
  reportsKpis,
  reportsSubscriptionPerformance,
  reportsTopComplaints,
  reportsTopContent,
  reportsTopYoutube,
  reportsTrends,
  reportsWeeklySessions,
} from '../data/mockData';

export function ReportsPage() {
  const [period, setPeriod] = useState('7');
  const [ageFilter, setAgeFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const weekly = useMemo(() => {
    const factor = period === '30' ? 1.15 : 1;
    return reportsWeeklySessions.map((w) => ({
      ...w,
      val: Math.round(w.val * factor),
    }));
  }, [period]);

  const maxWeekly = Math.max(...weekly.map((w) => w.val));

  return (
    <div className="page-stack">
      <PageHeader title="التقارير والتحليلات" />

      <InfoBanner tone="info">
        بيانات mock — لا analytics SDK ولا Backend. الرسوم CSS فقط (بدون Chart.js).
      </InfoBanner>

      <div className="filters-row">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7">آخر 7 أيام</option>
          <option value="30">آخر 30 يوم</option>
        </select>
        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
          <option value="all">كل الأعمار</option>
          <option value="0-3">0-3 شهور</option>
          <option value="6-12">6-12 شهر</option>
          <option value="12-18">1-1.5 سنة</option>
        </select>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="all">كل الباقات</option>
          <option value="gold">ذهبية</option>
          <option value="silver">فضية</option>
          <option value="trial">تجربة</option>
        </select>
        <MockActionButton variant="outline" action="export">تصدير CSV</MockActionButton>
      </div>

      <div className="grid-4">
        <StatCard label="مستخدمون نشطون يومياً" value={reportsKpis.dau} sub={`فترة ${period} أيام`} />
        <StatCard label="متوسط الجلسات" value={reportsKpis.avgSessions} sub="لكل طفل / يوم" />
        <StatCard label="إكمال الدروس" value={reportsKpis.lessonCompletionPct} />
        <StatCard label="أكثر عمر" value={reportsKpis.topAge} sub="استخدام" />
      </div>
      <StatCard label="أكثر منهج استخداماً" value={reportsKpis.topCurriculum} />

      <div className="grid-4">
        {reportsTrends.map((t) => (
          <AdminCard key={t.label} className="mini-trend-card">
            <span className="text-caption">{t.label}</span>
            <strong
              style={{
                fontSize: '1.25rem',
                color:
                  t.tone === 'up'
                    ? 'var(--tertiary)'
                    : t.tone === 'down'
                      ? 'var(--error)'
                      : 'var(--on-surface)',
              }}
            >
              {t.value}
            </strong>
          </AdminCard>
        ))}
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="جلسات مكتملة — أسبوع (bar chart)" />
          <div className="bar-chart">
            {weekly.map((w) => (
              <div key={w.label} className="bar-chart__col">
                <div
                  className="bar-chart__bar"
                  style={{ height: `${(w.val / maxWeekly) * 100}%` }}
                  title={String(w.val)}
                />
                <span className="bar-chart__label">{w.label}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="أداء المناهج" />
          {reportsCurriculumPerformance.map((c) => (
            <div key={c.name} className="progress-row">
              <span className="progress-row__label">{c.name}</span>
              <div className="progress-row__bar">
                <div
                  className="progress-row__fill"
                  style={{ width: `${c.completion}%`, background: c.color }}
                />
              </div>
              <span className="progress-row__pct">{c.completion}%</span>
            </div>
          ))}
        </AdminCard>
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="أداء الاشتراكات" />
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الباقة</th>
                  <th>نشط</th>
                  <th>إلغاء mock</th>
                </tr>
              </thead>
              <tbody>
                {reportsSubscriptionPerformance.map((r) => (
                  <tr key={r.plan}>
                    <td>{r.plan}</td>
                    <td>{r.active}</td>
                    <td>{r.churn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="أكثر المحتوى مشاهدة" />
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>المحتوى</th>
                  <th>المسار</th>
                  <th>مشاهدات</th>
                </tr>
              </thead>
              <tbody>
                {reportsTopContent.map((r, i) => (
                  <tr key={i}>
                    <td>{r.title}</td>
                    <td>{r.track}</td>
                    <td>{r.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="روابط YouTube الأكثر فتحاً" />
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>المعرّف</th>
                  <th>فتح</th>
                </tr>
              </thead>
              <tbody>
                {reportsTopYoutube.map((r, i) => (
                  <tr key={i}>
                    <td>{r.title}</td>
                    <td>
                      <code style={{ fontSize: '0.7rem' }}>
                        {r.videoId ?? `${r.playlistId?.slice(0, 12)}…`}
                      </code>
                    </td>
                    <td>{r.opens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="أعلى شكاوى متكررة" />
          {reportsTopComplaints.map((c) => (
            <div key={c.subject} className="progress-row">
              <span className="progress-row__label" style={{ flex: '1 1 140px' }}>
                {c.subject}
              </span>
              <div className="progress-row__bar">
                <div
                  className="progress-row__fill"
                  style={{ width: `${(c.count / 14) * 100}%`, background: 'var(--secondary)' }}
                />
              </div>
              <span className="progress-row__pct">{c.count}</span>
            </div>
          ))}
        </AdminCard>
      </div>
    </div>
  );
}
