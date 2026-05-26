import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioContentEditor } from '../components/AudioContentEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyAudioContent,
  getQuranSessionAudioMock,
  getSlideAudioMock,
} from '../data/audioContentEditor';
import { useSnackbar } from '../context/SnackbarContext';

export function AudioContentEditorPage() {
  const [content, setContent] = useState(() => createEmptyAudioContent());
  const { showMock } = useSnackbar();

  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر الصوت" extraBadges={['mp3 / m4a', 'Assets']} />

      <AdminCard>
        <SectionHeader title="أمثلة سريعة" />
        <div className="content-entry-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getSlideAudioMock());
              showMock('تم تحميل مثال الشريحة');
            }}
          >
            m4a شريحة slide_001
          </button>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getQuranSessionAudioMock());
              showMock('تم تحميل مثال الجلسة');
            }}
          >
            mp3 جلسة session_001
          </button>
        </div>
      </AdminCard>

      <AudioContentEditor value={content} onChange={setContent} />
    </div>
  );
}
