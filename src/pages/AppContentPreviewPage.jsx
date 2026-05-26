import { ArrowRight, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContentPreview } from '../components/AppContentPreview';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  appPreviewContentTypes,
  getAllPreviewExamples,
  getArticlePreviewExample,
  getLibraryVideoPreviewExample,
} from '../data/appContentPreview';

export function AppContentPreviewPage() {
  const examples = useMemo(() => getAllPreviewExamples(), []);
  const [selectedType, setSelectedType] = useState('article');
  const preview = examples[selectedType] ?? getArticlePreviewExample();

  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="معاينة شاشة التطبيق" extraBadges={['AppContentPreview', 'Flutter mock']} />

      <AdminCard>
        <SectionHeader title="أمثلة سريعة" />
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 12px' }}>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => setSelectedType('article')}
          >
            مثال مقال
          </button>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => setSelectedType('library_video')}
          >
            مثال فيديو مكتبة
          </button>
        </p>
        <label className="cms-field">
          نوع المحتوى
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {appPreviewContentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </AdminCard>

      <div className="grid-2 app-preview-page__layout">
        <AdminCard>
          <SectionHeader title="بيانات المعاينة" />
          <ul className="app-preview-page__fields">
            <li>
              <strong>العنوان:</strong> {preview.title || '—'}
            </li>
            <li>
              <strong>القسم:</strong> {preview.section || '—'}
            </li>
            <li>
              <strong>العمر:</strong> {preview.ageLabel || '—'}
            </li>
            <li>
              <strong>الحالة:</strong> {preview.status || '—'}
            </li>
            <li>
              <strong>الظهور:</strong> {preview.placement || '—'}
            </li>
          </ul>
          <p className="text-caption">
            <Smartphone size={12} style={{ verticalAlign: 'middle' }} /> يُستخدم أيضاً داخل محرر المقال
            ومحتوى المكتبة أثناء التحرير.
          </p>
        </AdminCard>

        <AdminCard className="app-preview-page__phone-wrap">
          <SectionHeader title="AppContentPreview" />
          <AppContentPreview preview={preview} />
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="مقارنة: مقال vs فيديو" />
        <div className="grid-2 app-preview-page__compare">
          <div>
            <p className="text-caption">مقال — {getArticlePreviewExample().title}</p>
            <AppContentPreview preview={getArticlePreviewExample()} compact />
          </div>
          <div>
            <p className="text-caption">فيديو — {getLibraryVideoPreviewExample().title}</p>
            <AppContentPreview preview={getLibraryVideoPreviewExample()} compact />
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
