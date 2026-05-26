import { Link } from 'react-router-dom';
import { AssessmentsManager } from '../components/AssessmentsManager';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  assessmentOverview,
  assessmentRecommendations,
  assessmentResults,
} from '../data/mockData';

export function AssessmentsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="التقييمات والاختبارات" />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/assessment" className="mock-btn mock-btn--outline">
            محرر Content Studio (تفصيلي)
          </Link>
        </p>
      </AdminCard>

      <InfoBanner tone="warning">
        التقييمات ليست تشخيصاً طبياً — للمتابعة والتوجيه فقط.
      </InfoBanner>

      <div className="grid-4">
        <StatCard
          label="اختبار القدرات"
          value={`${assessmentOverview.aptitude} سؤال`}
          sub="٠–٢ سنة — 4 محاور"
        />
        <StatCard label="اختبار المهارات" value={`${assessmentOverview.skills} أسئلة`} />
        <StatCard label="فحص الميول" value={`${assessmentOverview.interests} أسئلة`} />
        <StatCard label="اختبارات الطفل" value={`${assessmentOverview.child} أسئلة`} />
      </div>

      <AssessmentsManager />

      <details className="admin-details-block">
        <summary>نتائج وتوصيات (عرض)</summary>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <AdminCard>
            <SectionHeader title="نتائج Mock" />
            <AdminTableContainer>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>الطفل</th>
                    <th>الاختبار</th>
                    <th>نعم/لا</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentResults.map((r) => (
                    <tr key={r.id}>
                      <td>{r.child}</td>
                      <td>{r.test}</td>
                      <td>
                        {r.yesCount}/{r.noCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>
          <AdminCard>
            <SectionHeader title="توصيات UI" />
            <ul style={{ margin: 0, paddingRight: 20 }}>
              {assessmentRecommendations.map((rec) => (
                <li key={rec.id} style={{ marginBottom: 12 }}>
                  <StatusBadge tone={rec.priority === 'عالية' ? 'warning' : 'info'}>
                    {rec.priority}
                  </StatusBadge>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>{rec.text}</p>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </details>
    </div>
  );
}
