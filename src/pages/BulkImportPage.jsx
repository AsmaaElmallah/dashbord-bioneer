import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BulkImportPanel } from '../components/BulkImportPanel';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';

export function BulkImportPage() {
  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="استيراد جماعي" extraBadges={['Bulk Import', 'mock']} />

      <InfoBanner tone="warning">
        UI فقط — PPTX · صور/صوت · CSV أسئلة · CSV YouTube · Quran mp3 · manifest JSON. لا رفع ولا Backend.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="استخدام مستقبلي" />
        <ul className="bulk-import-future-list">
          <li>شرائح PPTX → مسارات الدروس</li>
          <li>صور وصوت دروس → packages</li>
          <li>CSV للأسئلة → التقييمات</li>
          <li>CSV روابط YouTube → المكتبة</li>
          <li>Quran mp3 sessions → 120 جلسة/ختمة</li>
          <li>manifest JSON → مناهج الحساب/بصري/عاطفي</li>
        </ul>
      </AdminCard>

      <BulkImportPanel initialTypeId="csv_questions" />
    </div>
  );
}
