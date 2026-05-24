import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageContentEditor } from '../components/ImageContentEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyImageContent,
  getCoverImageMock,
  getSlideAssetImageMock,
} from '../data/imageContentEditor';
import { useSnackbar } from '../context/SnackbarContext';

export function ImageContentEditorPage() {
  const [content, setContent] = useState(() => createEmptyImageContent());
  const { showMock } = useSnackbar();

  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر الصورة" extraBadges={['PNG / JPG', 'Assets']} />

      <InfoBanner tone="warning">
        UI فقط — رفع mock للصور (غلاف، شريحة، CMS). لا upload حقيقي · متوافق مع{' '}
        <Link to="/assets">صفحة الأصول</Link>.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="أمثلة سريعة" />
        <div className="content-entry-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getCoverImageMock());
              showMock('تحميل غلاف mock — UI فقط');
            }}
          >
            غلاف cover-bayanour.jpg
          </button>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setContent(getSlideAssetImageMock());
              showMock('تحميل PNG شريحة mock — UI فقط');
            }}
          >
            PNG شريحة math-slide-05
          </button>
        </div>
      </AdminCard>

      <ImageContentEditor value={content} onChange={setContent} />
    </div>
  );
}
