import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LibraryContentEditor } from '../components/LibraryContentEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyLibraryContent,
  getLullabyYoutubeMock,
} from '../data/libraryContentEditor';

export function LibraryContentEditorPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  const [content, setContent] = useState(() =>
    createEmptyLibraryContent({
      contentType: typeParam === 'playlist' ? 'playlist' : 'video',
    }),
  );

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر محتوى المكتبة" extraBadges={['YouTube']} />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setContent(getLullabyYoutubeMock())}
        >
          تحميل تهويدة YouTube mock
        </button>
      </AdminCard>

      <LibraryContentEditor value={content} onChange={setContent} />
    </div>
  );
}
