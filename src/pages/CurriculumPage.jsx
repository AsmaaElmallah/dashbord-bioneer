import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminCard } from '../components/AdminCard';
import { PageHeader } from '../components/PageHeader';

const tracks = [
  { id: 'quran', name: 'القرآن', path: '/quran' },
  { id: 'math', name: 'الحساب النقطي', path: '/math' },
  { id: 'visual', name: 'التحفيز البصري', path: '/visual' },
  { id: 'emotional', name: 'الذكاء العاطفي', path: '/emotional' },
];

export function CurriculumPage() {
  return (
    <div className="page-stack">
      <PageHeader title="المناهج" />
      <div className="grid-2">
        {tracks.map((t) => (
          <AdminCard key={t.id}>
            <h3 style={{ marginTop: 0 }}>{t.name}</h3>
            <Link
              to={t.path}
              className="mock-btn mock-btn--primary"
              style={{ display: 'inline-flex', marginTop: 14, alignItems: 'center', gap: 6 }}
            >
              فتح إدارة المسار
              <ArrowLeft size={16} />
            </Link>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
