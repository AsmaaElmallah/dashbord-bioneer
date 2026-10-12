import { AdminCard } from '../components/AdminCard';
import { CurriculumJourneyExplorer } from '../components/journey/CurriculumJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { emotionalTrackConfig } from '../data/curriculumTrackConfigs';

export function EmotionalPage() {
  return (
    <div className="page-stack">
      <PageHeader title="إدارة الذكاء العاطفي" />
      <AdminCard className="quran-journey-panel curriculum-journey-panel--emotional">
        <SectionHeader title="رحلة الدروس — إدارة الشرائح" />
        <CurriculumJourneyExplorer trackConfig={emotionalTrackConfig} />
      </AdminCard>
    </div>
  );
}
