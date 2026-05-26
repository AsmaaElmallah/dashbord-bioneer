import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { visualTrackConfig } from '../data/curriculumTrackConfigs';
import { visualOverview, visualPackages } from '../data/mockData';

const assetTone = { موجود: 'success', ناقص: 'error', 'يحتاج مراجعة': 'warning' };

export function VisualPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة التحفيز البصري"
        extraBadges={[
          `${visualOverview.lessonCount} درس`,
          `${visualOverview.slideCount} شريحة`,
          `${visualOverview.packageCount} حزمة مصدر`,
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
        <StatCard label="الدروس" value={String(visualOverview.lessonCount)} />
        <StatCard label="الشرائح" value={String(visualOverview.slideCount)} sub="تسلسل عالمي" />
        <StatCard label="الحزم" value={String(visualOverview.packageCount)} sub="visual_src_01–18" />
        <StatCard
          label="محتوى جديد / مراجعة"
          value={`${visualOverview.lastNewContentDay} → ${visualOverview.reviewCycleStartDay}`}
        />
      </div>

      <AdminCard className="quran-journey-panel curriculum-journey-panel--visual">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={visualTrackConfig} />
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
                {visualPackages.map((p) => (
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
