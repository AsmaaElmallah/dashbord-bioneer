import { BookOpen, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentLibraryManager } from '../components/ContentLibraryManager';
import { AdminCard } from '../components/AdminCard';
import { LibraryPaidBooksManager } from '../components/LibraryPaidBooksManager';
import { LibraryPdfManager } from '../components/LibraryPdfManager';
import { LibraryVisualVideosManager } from '../components/LibraryVisualVideosManager';
import { LibraryWhatsappSettings } from '../components/LibraryWhatsappSettings';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';

const sections = [
  { id: 'pdf', label: 'كتب PDF', icon: FileText },
  { id: 'paid', label: 'كتب مدفوعة', icon: BookOpen },
  { id: 'visual', label: 'فيديوهات تحفيز بصري', icon: Eye },
];

export function LibraryPage() {
  const [section, setSection] = useState('pdf');

  return (
    <div className="page-stack">
      <PageHeader title="مكتبة المحتوى" />

      <AdminCard>
        <SectionHeader title="تبويب المكتبة في التطبيق" />
        <p className="text-caption" style={{ marginTop: 0 }}>
          المكتبة في التطبيق مقسّمة بالعمر (0–3 / 3–6 / 6–12 / 12–18 / 18–24 شهر)، وكل عمر فيه الأقسام الثلاثة دي.
        </p>
        <div className="library-section-tabs">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`mock-btn ${section === id ? 'mock-btn--primary' : 'mock-btn--outline'}`}
              onClick={() => setSection(id)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </AdminCard>

      {section === 'pdf' && <LibraryPdfManager />}
      {section === 'paid' && (
        <>
          <LibraryWhatsappSettings />
          <LibraryPaidBooksManager />
        </>
      )}
      {section === 'visual' && <LibraryVisualVideosManager />}

      <AdminCard>
        <SectionHeader title="الصوتيات والرياضة والأنشطة (فيديو YouTube)" />
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
