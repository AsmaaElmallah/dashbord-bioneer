import {
  AlertTriangle,
  Heading,
  List,
  Pilcrow,
  Quote,
} from 'lucide-react';
import { AppContentPreview } from './AppContentPreview';
import { AdminCard } from './AdminCard';
import { fromArticle } from '../data/appContentPreview';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import {
  ARTICLE_TOOLBAR,
  articleStaticSections,
  createBlock,
  nextBlockId,
} from '../data/articleEditor';
import { contentWizardLanguages, targetingAudiences } from '../data/mockData';

const toolbarIcon = {
  heading: Heading,
  paragraph: Pilcrow,
  list: List,
  alert: AlertTriangle,
  quote: Quote,
};

const publishTone = {
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
  منشور: 'success',
};

function BlockEditor({ block, onChange, onRemove }) {
  if (block.type === 'list') {
    return (
      <div className="article-block article-block--list">
        <div className="article-block__head">
          <StatusBadge tone="info">قائمة</StatusBadge>
          <button type="button" className="article-block__remove" onClick={onRemove}>
            حذف
          </button>
        </div>
        {block.items.map((item, i) => (
          <label key={i} className="cms-field">
            نقطة {i + 1}
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = e.target.value;
                onChange({ ...block, items });
              }}
            />
          </label>
        ))}
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => onChange({ ...block, items: [...block.items, ''] })}
        >
          + نقطة
        </button>
      </div>
    );
  }

  const typeLabel = {
    heading: 'عنوان',
    paragraph: 'فقرة',
    alert: 'تنبيه',
    quote: 'اقتباس',
  }[block.type];

  return (
    <div className={`article-block article-block--${block.type}`}>
      <div className="article-block__head">
        <StatusBadge tone={block.type === 'alert' ? 'warning' : 'info'}>{typeLabel}</StatusBadge>
        <button type="button" className="article-block__remove" onClick={onRemove}>
          حذف
        </button>
      </div>
      {block.type === 'heading' ? (
        <input
          type="text"
          className="article-block__input article-block__input--heading"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      ) : (
        <textarea
          rows={block.type === 'paragraph' ? 4 : 2}
          className="article-block__input"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      )}
    </div>
  );
}

function ArticlePreview({ article }) {
  const tags = article.tags
    .split(/،|,/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <article className="article-preview" dir="rtl">
      <div className="article-preview__meta">
        <StatusBadge tone="info">{article.templateLabel}</StatusBadge>
        <StatusBadge tone="success">{article.ageLabel || article.targetAudience}</StatusBadge>
        <StatusBadge tone={publishTone[article.publishStatus]}>{article.publishStatus}</StatusBadge>
      </div>
      <h1 className="article-preview__title">{article.title || 'عنوان المقال'}</h1>
      {article.subtitle && <p className="article-preview__subtitle">{article.subtitle}</p>}
      <div className="article-preview__body">
        {article.blocks.map((block) => {
          if (block.type === 'heading') {
            return (
              <h2 key={block.id} className="article-preview__h2">
                {block.text || '…'}
              </h2>
            );
          }
          if (block.type === 'list') {
            return (
              <ul key={block.id} className="article-preview__list">
                {block.items.filter(Boolean).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          }
          if (block.type === 'alert') {
            return (
              <div key={block.id} className="article-preview__alert">
                {block.text || '…'}
              </div>
            );
          }
          if (block.type === 'quote') {
            return (
              <blockquote key={block.id} className="article-preview__quote">
                {block.text || '…'}
              </blockquote>
            );
          }
          return (
            <p key={block.id} className="article-preview__p">
              {block.text || '…'}
            </p>
          );
        })}
      </div>
      {tags.length > 0 && (
        <p className="article-preview__tags">
          {tags.map((t) => (
            <span key={t} className="page-header__chip">
              #{t}
            </span>
          ))}
        </p>
      )}
      {article.placement && (
        <p className="text-caption article-preview__placement">يظهر في: {article.placement}</p>
      )}
    </article>
  );
}

export function ArticleEditor({ value, onChange }) {
  const article = value;

  const patch = (partial) => onChange({ ...article, ...partial });

  const updateBlock = (id, next) => {
    patch({ blocks: article.blocks.map((b) => (b.id === id ? next : b)) });
  };

  const removeBlock = (id) => {
    patch({ blocks: article.blocks.filter((b) => b.id !== id) });
  };

  const addBlock = (type) => {
    patch({ blocks: [...article.blocks, createBlock(type, nextBlockId(article.blocks))] });
  };

  const loadSection = (sectionId) => {
    const section = articleStaticSections.find((s) => s.id === sectionId);
    onChange({
      ...article,
      templateId: sectionId,
      templateLabel: section?.label ?? sectionId,
      placement: section?.label ? `الرئيسية > ${section.label}` : article.placement,
    });
  };

  return (
    <div className="article-editor">
      <div className="grid-2 article-editor__layout">
        <div className="article-editor__form">
          <AdminCard>
            <SectionHeader title="نوع النص الثابت" />
            <div className="chip-grid">
              {articleStaticSections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip-btn${article.templateId === s.id ? ' chip-btn--active' : ''}`}
                  onClick={() => loadSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="البيانات الأساسية" />
            <label className="cms-field">
              العنوان
              <input
                type="text"
                value={article.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label className="cms-field">
              العنوان الفرعي
              <input
                type="text"
                value={article.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
              />
            </label>
            <label className="cms-field">
              الوسوم (Tags)
              <input
                type="text"
                value={article.tags}
                onChange={(e) => patch({ tags: e.target.value })}
                placeholder="منهج، ثقافة"
              />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                اللغة
                <select value={article.language} onChange={(e) => patch({ language: e.target.value })}>
                  {contentWizardLanguages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                حالة النشر
                <select
                  value={article.publishStatus}
                  onChange={(e) => patch({ publishStatus: e.target.value })}
                >
                  <option value="مسودة">مسودة</option>
                  <option value="يحتاج مراجعة">يحتاج مراجعة</option>
                  <option value="منشور">منشور</option>
                </select>
              </label>
            </div>
            <label className="cms-field">
              الجمهور المستهدف
              <select
                value={article.targetAudience}
                onChange={(e) => patch({ targetAudience: e.target.value, ageLabel: e.target.value })}
              >
                {targetingAudiences.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              مكان الظهور
              <input
                type="text"
                value={article.placement}
                onChange={(e) => patch({ placement: e.target.value })}
                placeholder="الرئيسية > ما هو المنهج"
              />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="المحتوى — كتل" />
            <div className="article-toolbar">
              {ARTICLE_TOOLBAR.map((t) => {
                const Icon = toolbarIcon[t.id] ?? Pilcrow;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className="mock-btn mock-btn--outline article-toolbar__btn"
                    onClick={() => addBlock(t.blockType)}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="article-blocks">
              {article.blocks.map((block) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={(next) => updateBlock(block.id, next)}
                  onRemove={() => removeBlock(block.id)}
                />
              ))}
            </div>
          </AdminCard>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ مسودة</MockActionButton>
            <MockActionButton
              action="check"
              message="إرسال للمراجعة (UI فقط) — لم يُرسل لأي فريق"
            >
              إرسال للمراجعة
            </MockActionButton>
            <MockActionButton action="publish">نشر</MockActionButton>
          </div>
        </div>

        <AdminCard className="article-editor__preview-wrap">
          <SectionHeader title="معاينة — كما في التطبيق" />
          <ArticlePreview article={article} />
          <SectionHeader title="شاشة التطبيق (mock)" />
          <AppContentPreview preview={fromArticle(article)} compact />
        </AdminCard>
      </div>
    </div>
  );
}
