import { Link } from 'react-router-dom';
import { ContentLibraryManager } from '../components/ContentLibraryManager';
import { AdminCard } from '../components/AdminCard';
import { PageHeader } from '../components/PageHeader';

export function LibraryPage() {
  return (
    <div className="page-stack">
      <PageHeader title="مكتبة المحتوى" />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/library" className="mock-btn mock-btn--outline">
            محرر Content Studio (تفصيلي)
          </Link>
          <Link to="/library?tab=exercises" className="mock-btn mock-btn--outline">
            الرياضة (تبويب مباشر)
          </Link>
          <Link to="/library?tab=activities" className="mock-btn mock-btn--outline">
            الأنشطة
          </Link>
        </p>
      </AdminCard>

      <ContentLibraryManager />
    </div>
  );
}
