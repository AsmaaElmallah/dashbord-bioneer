import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuranSessionEditor } from '../components/QuranSessionEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyQuranSession,
  getQuranSessionMissingMp3Mock,
} from '../data/quranSessionEditor';

export function QuranSessionEditorPage() {
  const [session, setSession] = useState(() => createEmptyQuranSession());

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر جلسة القرآن" extraBadges={['جلسة قرآن']} />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setSession(getQuranSessionMissingMp3Mock())}
        >
          تحميل جلسة ناقصة mp3 (mock)
        </button>
      </AdminCard>

      <QuranSessionEditor value={session} onChange={setSession} />
    </div>
  );
}
