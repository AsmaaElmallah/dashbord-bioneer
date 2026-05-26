import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SlideEditor } from '../components/SlideEditor';
import { AdminCard } from '../components/AdminCard';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { createEmptySlideContent, getSlideMissingAudioMock } from '../data/slideEditor';

export function SlideEditorPage() {
  const [slide, setSlide] = useState(() => createEmptySlideContent());

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر الشريحة" extraBadges={['شريحة']} />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setSlide(getSlideMissingAudioMock())}
        >
          تحميل شريحة ناقصة صوت
        </button>
      </AdminCard>

      <SlideEditor value={slide} onChange={setSlide} />
    </div>
  );
}
