import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { QuranJourneyExplorer } from '../components/journey/QuranJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  quranKhatmahPlan,
  quranOverview,
  quranReciters,
} from '../data/mockData';

export function QuranPage() {
  return (
    <div className="page-stack">
      <PageHeader title="إدارة القرآن الكريم" />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/quran-session" className="mock-btn mock-btn--primary">
            محرر جلسة قرآن (Content Studio)
          </Link>
        </p>
      </AdminCard>

      <div className="grid-4">
        <StatCard label="ختمات مستهدفة" value={String(quranOverview.targetKhatmah)} />
        <StatCard label="جلسة لكل ختمة" value={String(quranOverview.sessionsPerKhatmah)} />
        <StatCard
          label="نصف حزب / جلسة"
          value={String(quranOverview.halfHizbPerSession)}
          sub="60 حزب × 2"
        />
        <StatCard
          label="مدة تقريبية"
          value={`${quranOverview.durationMinutes} د`}
          sub={`القارئ: ${quranOverview.activeReciter}`}
        />
      </div>

      <AdminCard className="quran-journey-panel">
        <SectionHeader title="رحلة الختمات — إدارة المحتوى" />
        <QuranJourneyExplorer />
      </AdminCard>

      <details className="admin-details-fold">
        <summary>خطة الختمات والقراء (مرجع)</summary>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <AdminCard>
            <SectionHeader title="خطة الختمات" />
            <div className="quran-plan-grid">
              {quranKhatmahPlan.map((row) => (
                <div key={row.khatmah} className="quran-plan-card">
                  <strong>
                    {row.khatmah === 4 ? 'الختمة 4 وما بعدها' : `الختمة ${row.khatmah}`}
                  </strong>
                  <p style={{ margin: '6px 0' }}>
                    {row.dailySessions} {row.dailySessions === 2 ? 'جلستان' : 'جلسات'} يومياً
                  </p>
                  <span className="text-caption">
                    ~{row.daysToFinish} يوم — {row.note}
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="القراء" />
            <AdminTableContainer>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>القارئ</th>
                    <th>نشط</th>
                    <th>ملفات الصوت</th>
                  </tr>
                </thead>
                <tbody>
                  {quranReciters.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                        <br />
                        <code style={{ fontSize: '0.7rem' }}>{r.id}</code>
                      </td>
                      <td>
                        {r.active ? (
                          <StatusBadge tone="success">القارئ النشط</StatusBadge>
                        ) : (
                          <StatusBadge tone="muted">—</StatusBadge>
                        )}
                      </td>
                      <td>
                        <StatusBadge tone={r.audioAvailable ? 'success' : 'error'}>
                          {r.audioAvailable ? 'متوفرة' : 'غير متوفرة'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>
        </div>
      </details>
    </div>
  );
}
