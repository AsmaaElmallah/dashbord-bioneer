import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LessonBuilder } from '../components/LessonBuilder';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { createEmptyLesson, getVisualLessonMock } from '../data/lessonBuilder';

export function LessonBuilderPage() {
  const [lesson, setLesson] = useState(() => createEmptyLesson());

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="منشئ الدروس — المناهج" extraBadges={['درس']} />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setLesson(getVisualLessonMock())}
        >
          تحميل درس بصري mock (درس 1)
        </button>
      </AdminCard>

      <LessonBuilder value={lesson} onChange={setLesson} />
    </div>
  );
}
