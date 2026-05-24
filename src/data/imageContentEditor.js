import { targetingAudiences } from './mockData';

export const imageUsageOptions = [
  { id: 'slide_asset', label: 'أصل شريحة (PNG)' },
  { id: 'cover', label: 'غلاف محتوى' },
  { id: 'cms', label: 'CMS / مقال' },
  { id: 'curriculum', label: 'منهج — package' },
  { id: 'icon', label: 'أيقونة / badge' },
];

export const imagePublishStatusOptions = ['مسودة', 'يحتاج مراجعة', 'منشور'];

export function createEmptyImageContent(overrides = {}) {
  return {
    title: '',
    imageFile: null,
    altText: '',
    caption: '',
    usageId: 'slide_asset',
    placement: '',
    targetAudience: targetingAudiences[0] ?? 'كل الأعمار',
    publishStatus: 'مسودة',
    assetPath: '',
    dimensions: '',
    ...overrides,
  };
}

export function getImageContentValidation(content) {
  const issues = [];
  if (!content.imageFile) {
    issues.push({ id: 'noImage', message: 'لا توجد صورة — اختر ملف PNG/JPG mock.' });
  }
  if (!content.altText?.trim()) {
    issues.push({ id: 'noAlt', message: 'alt text مطلوب لإمكانية الوصول.' });
  }
  if (!content.title?.trim()) {
    issues.push({ id: 'noTitle', message: 'أضف عنواناً للصورة في المكتبة.' });
  }
  return issues;
}

export function getUsageLabel(usageId) {
  return imageUsageOptions.find((u) => u.id === usageId)?.label ?? usageId;
}

/** مثال: غلاف mock من assets */
export function getCoverImageMock() {
  return createEmptyImageContent({
    title: 'غلاف بيانور — cover-bayanour.jpg',
    imageFile: { name: 'cover-bayanour.jpg', sizeMock: '124 KB', notUploaded: true },
    altText: 'غلاف تطبيق بيانour للأمهات',
    caption: 'صورة غلاف رئيسية — mock',
    usageId: 'cover',
    placement: 'assets/covers/cover-bayanour.jpg',
    assetPath: 'assets/covers/cover-bayanour.jpg',
    dimensions: '1200×630',
    publishStatus: 'منشور',
  });
}

/** مثال: PNG شريحة */
export function getSlideAssetImageMock() {
  return createEmptyImageContent({
    title: 'math-slide-05.png',
    imageFile: { name: 'math-slide-05.png', sizeMock: '842 KB', notUploaded: true },
    altText: 'شريحة حساب — عدّ خرزات',
    caption: 'package q_129_132 · slide 5',
    usageId: 'slide_asset',
    placement: 'assets/math/slides/math-slide-05.png',
    assetPath: 'assets/math/slides/math-slide-05.png',
    dimensions: '1024×768',
    targetAudience: '6-12 شهر',
    publishStatus: 'مسودة',
  });
}
