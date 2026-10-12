import { AdminCard } from '../components/AdminCard';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { mathTrackConfig } from '../data/curriculumTrackConfigs';

export function MathPage() {
  return (
    <div className="page-stack">
      <PageHeader title="إدارة منهج الحساب النقطي" />
      <AdminCard className="quran-journey-panel curriculum-journey-panel--math">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={mathTrackConfig} />
      </AdminCard>
    </div>
  );
}
