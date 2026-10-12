import { AssessmentsManager } from '../components/AssessmentsManager';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';

export function AssessmentsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="التقييمات والاختبارات" />
      <InfoBanner tone="warning">
        التقييمات ليست تشخيصاً طبياً — للمتابعة والتوجيه فقط.
      </InfoBanner>
      <AssessmentsManager />
    </div>
  );
}
