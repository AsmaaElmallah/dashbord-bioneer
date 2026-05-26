import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { emotionalTrackConfig } from '../data/curriculumTrackConfigs';
import { emotionalOverview, emotionalPackages } from '../data/mockData';

const assetTone = { موجود: 'success', ناقص: 'error', 'يحتاج مراجعة': 'warning' };

export function EmotionalPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة الذكاء العاطفي"
        extraBadges={[
          `${emotionalOverview.lessonCount} درس`,
          `${emotionalOverview.slideCount} شريحة`,
          `${emotionalOverview.packageCount} حزمة مصدر`,
        ]}
      />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/slide" className="mock-btn mock-btn--primary">
            محرر الشريحة
          </Link>
          <Link to="/content-studio/lesson" className="mock-btn mock-btn--outline">
            منشئ الدرس
          </Link>
        </p>
      </AdminCard>

      <div className="grid-4">
        <StatCard label="إجمالي الدروس" value={String(emotionalOverview.lessonCount)} />
        <StatCard label="إجمالي الشرائح" value={String(emotionalOverview.slideCount)} />
        <StatCard label="أيام محتوى جديد" value={String(emotionalOverview.lastNewContentDay)} />
        <StatCard
          label="بداية المراجعة"
          value={String(emotionalOverview.reviewCycleStartDay)}
          sub="دورة تكرار الدروس 1–17"
        />
      </div>

      <AdminCard className="quran-journey-panel curriculum-journey-panel--emotional">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={emotionalTrackConfig} />
      </AdminCard>

      <details className="admin-details-fold">
        <summary>جدول الحزم المصدر — مرجع</summary>
        <AdminCard style={{ marginTop: 12 }}>
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الحزمة</th>
                  <th>شرائح</th>
                  <th>صور</th>
                  <th>صوت</th>
                </tr>
              </thead>
              <tbody>
                {emotionalPackages.slice(0, 16).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code>{p.id}</code>
                    </td>
                    <td>{p.slideCount}</td>
                    <td>
                      <StatusBadge tone={assetTone[p.imageStatus]}>{p.imageStatus}</StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={assetTone[p.audioStatus]}>{p.audioStatus}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      </details>
    </div>
  );
}
