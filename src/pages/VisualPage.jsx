import { AdminCard } from '../components/AdminCard';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { visualTrackConfig } from '../data/curriculumTrackConfigs';

export function VisualPage() {
  return (
    <div className="page-stack">
      <PageHeader title="إدارة التحفيز البصري" />
      <AdminCard className="quran-journey-panel curriculum-journey-panel--visual">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={visualTrackConfig} />
      </AdminCard>
    </div>
  );
}
