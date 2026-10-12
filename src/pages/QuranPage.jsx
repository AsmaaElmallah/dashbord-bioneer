import { AdminCard } from '../components/AdminCard';
import { QuranJourneyExplorer } from '../components/journey/QuranJourneyExplorer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';

export function QuranPage() {
  return (
    <div className="page-stack">
      <PageHeader title="إدارة القرآن الكريم" />
      <AdminCard className="quran-journey-panel">
        <SectionHeader title="رحلة الختمات — إدارة المحتوى" />
        <QuranJourneyExplorer />
      </AdminCard>
    </div>
  );
}
