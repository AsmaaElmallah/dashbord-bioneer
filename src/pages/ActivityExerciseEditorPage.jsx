import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActivityExerciseEditor } from '../components/ActivityExerciseEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyActivityExercise,
  getExercise46MonthsMock,
} from '../data/activityExerciseEditor';

export function ActivityExerciseEditorPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  const [item, setItem] = useState(() =>
    createEmptyActivityExercise({
      itemType: typeParam === 'exercise' ? 'exercise' : typeParam === 'activity' ? 'activity' : 'activity',
    }),
  );
  const [draftItems, setDraftItems] = useState([]);

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر الأنشطة والرياضة" extraBadges={['MediaAgeHub']} />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setItem(getExercise46MonthsMock())}
        >
          تحميل تمرين 4-6 أشهر
        </button>
      </AdminCard>

      <ActivityExerciseEditor
        value={item}
        onChange={setItem}
        draftItems={draftItems}
        onAddDraft={(draft) => setDraftItems((prev) => [...prev, draft])}
        onSelectDraft={setItem}
      />
    </div>
  );
}
