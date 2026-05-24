import { cmsContentItems, cmsSections } from './mockData';

/** قوالب المقالات والنصوص الثابتة — من CMS mock */
export const articleStaticSections = cmsSections;

export function getArticleTemplate(sectionId) {
  const section = cmsSections.find((s) => s.id === sectionId);
  const sample = cmsContentItems.find((i) => i.sectionId === sectionId);
  if (!sample) {
    return createEmptyArticle({ templateId: sectionId, templateLabel: section?.label ?? sectionId });
  }
  return createEmptyArticle({
    templateId: sectionId,
    templateLabel: section?.label ?? sectionId,
    title: sample.title,
    subtitle: sample.subtitle,
    blocks: bodyToBlocks(sample.body),
    tags: sample.tags.join('، '),
    targetAudience: sample.targetAudience,
    placement: sample.placement,
    publishStatus: sample.status,
    ageLabel: sample.targetAudience,
  });
}

export function createEmptyArticle(overrides = {}) {
  return {
    templateId: 'curriculum',
    templateLabel: 'ما هو المنهج',
    title: '',
    subtitle: '',
    blocks: [{ id: 'b1', type: 'paragraph', text: '' }],
    tags: '',
    language: 'ar',
    targetAudience: 'كل الأمهات',
    ageLabel: '0-3 شهور',
    placement: '',
    publishStatus: 'مسودة',
    ...overrides,
  };
}

export function bodyToBlocks(body) {
  if (!body?.trim()) return [{ id: 'b1', type: 'paragraph', text: '' }];
  return body.split('\n\n').map((text, i) => ({
    id: `b${i + 1}`,
    type: 'paragraph',
    text: text.trim(),
  }));
}

export const ARTICLE_TOOLBAR = [
  { id: 'heading', label: 'عنوان', blockType: 'heading' },
  { id: 'paragraph', label: 'فقرة', blockType: 'paragraph' },
  { id: 'list', label: 'قائمة', blockType: 'list' },
  { id: 'alert', label: 'تنبيه', blockType: 'alert' },
  { id: 'quote', label: 'اقتباس', blockType: 'quote' },
];

export function createBlock(type, id) {
  const base = { id, type };
  if (type === 'list') return { ...base, items: [''] };
  if (type === 'alert') return { ...base, text: 'تنبيه للأمهات: …' };
  if (type === 'quote') return { ...base, text: 'اقتباس…' };
  if (type === 'heading') return { ...base, text: 'عنوان فرعي' };
  return { ...base, text: '' };
}

export function nextBlockId(blocks) {
  return `b${Date.now()}-${blocks.length}`;
}
