import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { mathTrackConfig } from '../data/curriculumTrackConfigs';
import { mathOverview, mathPackages } from '../data/mockData';

const roleTone = { core: 'success', archive: 'muted' };

export function MathPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة منهج الحساب النقطي"
        extraBadges={[
          `${mathOverview.lessonCount} درس`,
          `${mathOverview.coreSlideCount} شريحة في التسلسل الأساسي`,
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
        <StatCard
          label="حزم manifest"
          value={String(mathOverview.manifestPackageCount)}
          sub="22 معرّفة في manifest.json"
        />
        <StatCard
          label="الشرائح الأساسية"
          value={String(mathOverview.coreSlideCount)}
          sub="100 + 100 + 37"
        />
        <StatCard
          label="أيام محتوى جديد"
          value={String(mathOverview.lastNewContentDay)}
          sub="آخر يوم بكل الشرائح لأول مرة"
        />
        <StatCard
          label="بداية المراجعة"
          value={String(mathOverview.reviewCycleStartDay)}
          sub={`برنامج ${mathOverview.totalProgramDays} يوم`}
        />
      </div>

      <AdminCard className="quran-journey-panel curriculum-journey-panel--math">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={mathTrackConfig} />
      </AdminCard>

      <details className="admin-details-fold">
        <summary>جدول الحزم (manifest) — مرجع</summary>
        <AdminCard style={{ marginTop: 12 }}>
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>package id</th>
                  <th>slide count</th>
                  <th>في التسلسل</th>
                  <th>الدور</th>
                </tr>
              </thead>
              <tbody>
                {mathPackages.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code>{p.id}</code>
                    </td>
                    <td>{p.slideCount}</td>
                    <td>{p.inCoreSequence > 0 ? p.inCoreSequence : '—'}</td>
                    <td>
                      <StatusBadge tone={roleTone[p.roleKey]}>{p.role}</StatusBadge>
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
