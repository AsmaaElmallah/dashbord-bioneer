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

      <InfoBanner tone="warning">
        UI فقط — رفع mock للأصوات (شرائح m4a، جلسات mp3). لا upload حقيقي · متوافق مع{' '}
        <Link to="/assets">صفحة الأصول</Link>.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="أمثلة سريعة" />
        <div className="content-entry-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getSlideAudioMock());
              showMock('تحميل m4a شريحة mock — UI فقط');
            }}
          >
            m4a شريحة slide_001
          </button>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getQuranSessionAudioMock());
              showMock('تحميل mp3 قرآن mock — UI فقط');
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
