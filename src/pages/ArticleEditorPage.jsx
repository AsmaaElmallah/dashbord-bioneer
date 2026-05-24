import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArticleEditor } from '../components/ArticleEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { createEmptyArticle, getArticleTemplate } from '../data/articleEditor';
import { cmsContentItems } from '../data/mockData';
import { useSnackbar } from '../context/SnackbarContext';

export function ArticleEditorPage() {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const [article, setArticle] = useState(() =>
    templateParam ? getArticleTemplate(templateParam) : createEmptyArticle(),
  );
  const { showMock } = useSnackbar();

  const templates = useMemo(
    () =>
      cmsContentItems.filter((i) => i.contentType === 'مقال' || i.contentType === 'دليل' || i.contentType === 'قاعدة'),
    [],
  );

  const loadSample = (sectionId) => {
    setArticle(getArticleTemplate(sectionId));
    showMock('تحميل نموذج mock — UI فقط');
  };

  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر المقالات والنصوص الثابتة" extraBadges={['مقال / نص ثابت']} />

      <InfoBanner tone="warning">
        UI فقط — لا حفظ حقيقي ولا Backend. المحتوى المستهدف: المنهج، كيف أدرّس طفلي، ثقافة ولي الأمر،
        الثقافة الصحية، قوانين المجتمع، رسائل الدعم، نصوص الاشتراك.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="تحميل نموذج mock" />
        <div className="content-entry-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {templates.slice(0, 6).map((t) => (
            <button
              key={t.id}
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={() => loadSample(t.sectionId)}
            >
              {t.title.slice(0, 28)}
              {t.title.length > 28 ? '…' : ''}
            </button>
          ))}
        </div>
      </AdminCard>

      <ArticleEditor value={article} onChange={setArticle} />
    </div>
  );
}
