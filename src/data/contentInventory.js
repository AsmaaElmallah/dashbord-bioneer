import { getReviewStateMeta, reviewWorkflowStates } from './contentReview';

export const inventoryBulkMessages = {
  changeStatus: 'تغيير الحالة (mock) — لم يُحفظ',
  sendReview: 'إرسال للمراجعة (mock) — أُضيف للطابور',
  archive: 'أرشفة (mock) — العناصر المحددة مؤرشفة محلياً',
  exportCsv: 'تصدير CSV (mock) — لم يُنزَّل ملف',
};

export const inventoryContentTypes = [
  { id: 'all', label: 'كل الأنواع' },
  { id: 'article', label: 'مقال' },
  { id: 'lesson', label: 'درس' },
  { id: 'slide', label: 'شريحة' },
  { id: 'quran_session', label: 'جلسة قرآن' },
  { id: 'library_video', label: 'فيديو مكتبة' },
  { id: 'library_playlist', label: 'Playlist' },
  { id: 'activity', label: 'نشاط' },
  { id: 'exercise', label: 'تمرين' },
  { id: 'assessment', label: 'اختبار' },
  { id: 'question', label: 'سؤال تقييم' },
  { id: 'notification', label: 'إشعار' },
];

export const inventorySections = [
  { id: 'all', label: 'كل الأقسام' },
  { id: 'math', label: 'الحساب' },
  { id: 'visual', label: 'التحفيز البصري' },
  { id: 'emotional', label: 'الذكاء العاطفي' },
  { id: 'quran', label: 'القرآن' },
  { id: 'library', label: 'المكتبة' },
  { id: 'activities', label: 'الأنشطة' },
  { id: 'sports', label: 'الرياضة' },
  { id: 'cms', label: 'محتوى ثابت' },
  { id: 'assessments', label: 'التقييمات' },
];

export const inventoryAgeOptions = [
  { id: 'all', label: 'كل الأعمار' },
  { id: 'all_ages', label: 'كل الأعمار (محتوى)' },
  { id: '0-6', label: '0-6 أشهر' },
  { id: '4-6', label: '4-6 أشهر' },
  { id: '6-12', label: '6-12 شهر' },
  { id: '9-12', label: '9-12 شهر' },
  { id: '9-36', label: '9-36 شهر' },
  { id: 'unset', label: 'غير محدد' },
];

export const inventoryPublishOptions = [
  { id: 'all', label: 'كل حالات النشر' },
  ...reviewWorkflowStates.map((s) => ({ id: s.id, label: s.label })),
];

const fileStatusTone = {
  كامل: 'success',
  ناقص: 'error',
  '—': 'muted',
};

export function getFileStatusTone(status) {
  return fileStatusTone[status] ?? 'muted';
}

export function createInitialInventory() {
  return [
    {
      id: 'inv_slide_g237',
      title: 'شريحة حساب — خرزات (g237)',
      contentTypeId: 'slide',
      contentType: 'شريحة',
      sectionId: 'math',
      section: 'الحساب',
      ageId: '6-12',
      ageLabel: '6-12 شهر',
      language: 'العربية',
      publishStatusId: 'missing_assets',
      publishStatus: 'ناقص ملفات',
      fileStatus: 'ناقص',
      missingFiles: true,
      needsReview: true,
      lastModified: '2026-05-23 14:20',
      owner: 'سارة (Curriculum)',
      summary: 'PNG موجود · m4a ناقص · package q_129_132',
      editorPath: '/content-studio/slide',
      placement: 'الحساب > يوم 56',
    },
    {
      id: 'inv_quran_s1',
      title: 'جلسة قرآن — ختمة 1 جلسة 1',
      contentTypeId: 'quran_session',
      contentType: 'جلسة قرآن',
      sectionId: 'quran',
      section: 'القرآن',
      ageId: 'all_ages',
      ageLabel: 'كل الأعمار',
      language: 'العربية',
      publishStatusId: 'review',
      publishStatus: 'يحتاج مراجعة',
      fileStatus: 'ناقص',
      missingFiles: true,
      needsReview: true,
      lastModified: '2026-05-22 09:15',
      owner: 'أمينة',
      summary: 'نصف حزب 1 · mp3 غير مرفوع',
      editorPath: '/content-studio/quran-session',
      placement: 'القرآن > ختمة 1',
    },
    {
      id: 'inv_lullaby',
      title: 'أغنية الخروف الصغير — تهويدات',
      contentTypeId: 'library_video',
      contentType: 'فيديو مكتبة',
      sectionId: 'library',
      section: 'المكتبة',
      ageId: 'all_ages',
      ageLabel: 'كل الأعمار',
      language: 'العربية',
      publishStatusId: 'ready',
      publishStatus: 'جاهز للنشر',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-21 16:40',
      owner: 'أمينة',
      summary: 'YouTube UHVcRjfufic · mood هادئة',
      editorPath: '/content-studio/library',
      placement: 'المكتبة > تهويدات',
    },
    {
      id: 'inv_article_draft',
      title: 'مقال — كيف أدرّس طفلي (مسودة)',
      contentTypeId: 'article',
      contentType: 'مقال',
      sectionId: 'cms',
      section: 'محتوى ثابت',
      ageId: 'unset',
      ageLabel: '—',
      language: 'العربية',
      publishStatusId: 'draft',
      publishStatus: 'مسودة',
      fileStatus: '—',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-20 11:00',
      owner: 'Content Manager',
      summary: '3 كتل نص · بدون placement نهائي',
      editorPath: '/content-studio/article',
      placement: '—',
    },
    {
      id: 'inv_notif_quran',
      title: 'تذكير جلسة قرآن — مساء',
      contentTypeId: 'notification',
      contentType: 'إشعار',
      sectionId: 'quran',
      section: 'القرآن',
      ageId: 'all_ages',
      ageLabel: 'كل الأعمار',
      language: 'العربية',
      publishStatusId: 'review',
      publishStatus: 'يحتاج مراجعة',
      fileStatus: '—',
      missingFiles: false,
      needsReview: true,
      lastModified: '2026-05-23 08:30',
      owner: 'Marketing',
      summary: 'push 18:00 · deep link quran/journey',
      editorPath: '/content-studio/notification',
      placement: 'push + القرآن',
    },
    {
      id: 'inv_exercise_46',
      title: 'تمرين 4-6 أشهر — تنشيط مبكر',
      contentTypeId: 'exercise',
      contentType: 'تمرين',
      sectionId: 'sports',
      section: 'الرياضة',
      ageId: '4-6',
      ageLabel: '4-6 أشهر',
      language: 'العربية',
      publishStatusId: 'published',
      publishStatus: 'منشور',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-19 13:45',
      owner: 'Curriculum Reviewer',
      summary: 'videoId puUzPozUdP0 · tamareen',
      editorPath: '/content-studio/activity-exercise',
      placement: 'الرياضة > tamareen',
    },
    {
      id: 'inv_visual_old',
      title: 'درس بصري 8 — نسخة قديمة',
      contentTypeId: 'lesson',
      contentType: 'درس',
      sectionId: 'visual',
      section: 'التحفيز البصري',
      ageId: '9-12',
      ageLabel: '9-12 شهر',
      language: 'العربية',
      publishStatusId: 'archived',
      publishStatus: 'مؤرشف',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-04-10 10:00',
      owner: 'أمينة',
      summary: '16 شريحة — استُبدل بدرس محدّث',
      editorPath: '/content-studio/lesson',
      placement: 'visual > lesson 8',
    },
    {
      id: 'inv_library_broken',
      title: 'قائمة YouTube قديمة — مراجعة',
      contentTypeId: 'library_playlist',
      contentType: 'Playlist',
      sectionId: 'library',
      section: 'المكتبة',
      ageId: 'unset',
      ageLabel: '—',
      language: 'العربية',
      publishStatusId: 'missing_assets',
      publishStatus: 'ناقص ملفات',
      fileStatus: 'ناقص',
      missingFiles: true,
      needsReview: true,
      lastModified: '2026-05-18 17:20',
      owner: '—',
      summary: 'embed error 153 · playlistId PLxxxxxxxx',
      editorPath: '/content-studio/library',
      placement: 'المكتبة > موسيقى',
    },
    {
      id: 'inv_math_lesson_12',
      title: 'درس 12 — الحساب (عدّ خرزات)',
      contentTypeId: 'lesson',
      contentType: 'درس',
      sectionId: 'math',
      section: 'الحساب',
      ageId: '6-12',
      ageLabel: '6-12 شهر',
      language: 'العربية',
      publishStatusId: 'published',
      publishStatus: 'منشور',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-15 12:00',
      owner: 'سارة (Curriculum)',
      summary: '5 شرائح · يوم 56 · manifest v1.2',
      editorPath: '/content-studio/lesson',
      placement: 'math > day 56',
    },
    {
      id: 'inv_activity_creative',
      title: 'لعب إبداعي (9–36 شهر)',
      contentTypeId: 'activity',
      contentType: 'نشاط',
      sectionId: 'activities',
      section: 'الأنشطة',
      ageId: '9-36',
      ageLabel: '9-36 شهر',
      language: 'العربية',
      publishStatusId: 'published',
      publishStatus: 'منشور',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-17 10:30',
      owner: 'Curriculum Reviewer',
      summary: 'MediaAgeHub playlist mock',
      editorPath: '/content-studio/activity-exercise',
      placement: 'الأنشطة > MediaAgeHub',
    },
    {
      id: 'inv_assessment_motor',
      title: 'اختبار — النمو البدني 6-12 شهر',
      contentTypeId: 'assessment',
      contentType: 'اختبار',
      sectionId: 'assessments',
      section: 'التقييمات',
      ageId: '6-12',
      ageLabel: '6-12 شهر',
      language: 'العربية',
      publishStatusId: 'draft',
      publishStatus: 'مسودة',
      fileStatus: '—',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-16 09:00',
      owner: 'Content Manager',
      summary: '12 سؤال · 3 محاور',
      editorPath: '/content-studio/assessment',
      placement: 'تقييمنا',
    },
    {
      id: 'inv_question_stand',
      title: 'هل يقف مع دعم؟',
      contentTypeId: 'question',
      contentType: 'سؤال تقييم',
      sectionId: 'assessments',
      section: 'التقييمات',
      ageId: '6-12',
      ageLabel: '6-12 شهر',
      language: 'العربية',
      publishStatusId: 'review',
      publishStatus: 'يحتاج مراجعة',
      fileStatus: '—',
      missingFiles: false,
      needsReview: true,
      lastModified: '2026-05-14 15:20',
      owner: 'Curriculum Reviewer',
      summary: 'محور النمو البدني · yes/no',
      editorPath: '/content-studio/assessment',
      placement: 'اختبار النمو البدني',
    },
    {
      id: 'inv_emotional_lesson',
      title: 'درس عاطفي 3 — التعبير عن المشاعر',
      contentTypeId: 'lesson',
      contentType: 'درس',
      sectionId: 'emotional',
      section: 'الذكاء العاطفي',
      ageId: '9-12',
      ageLabel: '9-12 شهر',
      language: 'العربية',
      publishStatusId: 'ready',
      publishStatus: 'جاهز للنشر',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-22 11:45',
      owner: 'سارة (Curriculum)',
      summary: '4 شرائح · emotional_pkg_03',
      editorPath: '/content-studio/lesson',
      placement: 'emotional > week 3',
    },
    {
      id: 'inv_nature_rain',
      title: 'أصوات مطر — فيديو طبيعة',
      contentTypeId: 'library_video',
      contentType: 'فيديو مكتبة',
      sectionId: 'library',
      section: 'المكتبة',
      ageId: '0-6',
      ageLabel: '0-6 أشهر',
      language: 'العربية',
      publishStatusId: 'published',
      publishStatus: 'منشور',
      fileStatus: 'كامل',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-10 08:00',
      owner: 'أمينة',
      summary: 'nature · mood calm · videoId rain4k01',
      editorPath: '/content-studio/library',
      placement: 'المكتبة > أصوات الطبيعة',
    },
    {
      id: 'inv_slide_visual_missing',
      title: 'شريحة بصرية v12 — PNG ناقص',
      contentTypeId: 'slide',
      contentType: 'شريحة',
      sectionId: 'visual',
      section: 'التحفيز البصري',
      ageId: '9-12',
      ageLabel: '9-12 شهر',
      language: 'العربية',
      publishStatusId: 'missing_assets',
      publishStatus: 'ناقص ملفات',
      fileStatus: 'ناقص',
      missingFiles: true,
      needsReview: true,
      lastModified: '2026-05-23 16:00',
      owner: '—',
      summary: 'm4a موجود · PNG v12.png مفقود',
      editorPath: '/content-studio/slide',
      placement: 'visual > pkg visual_src_08',
    },
    {
      id: 'inv_article_en',
      title: 'Parenting tips — English numbering',
      contentTypeId: 'article',
      contentType: 'مقال',
      sectionId: 'cms',
      section: 'محتوى ثابت',
      ageId: '9-36',
      ageLabel: '9-36 شهر',
      language: 'English',
      publishStatusId: 'published',
      publishStatus: 'منشور',
      fileStatus: '—',
      missingFiles: false,
      needsReview: false,
      lastModified: '2026-05-08 14:00',
      owner: 'Content Manager',
      summary: 'EN article · parenting_article block',
      editorPath: '/content-studio/article',
      placement: 'CMS > teach_math',
    },
  ];
}

export function filterInventory(items, filters) {
  return items.filter((item) => {
    if (filters.contentType !== 'all' && item.contentTypeId !== filters.contentType) return false;
    if (filters.section !== 'all' && item.sectionId !== filters.section) return false;
    if (filters.age !== 'all' && item.ageId !== filters.age) return false;
    if (filters.publishStatus !== 'all' && item.publishStatusId !== filters.publishStatus) return false;
    if (filters.missingFilesOnly && !item.missingFiles) return false;
    if (filters.needsReviewOnly && !item.needsReview) return false;
    return true;
  });
}

export function searchInventory(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.contentType,
      item.section,
      item.ageLabel,
      item.owner,
      item.publishStatus,
      item.placement,
      item.summary,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getPublishStatusTone(statusId) {
  return getReviewStateMeta(statusId).tone;
}

export function applyBulkStatusChange(items, ids, newStatusId) {
  const meta = getReviewStateMeta(newStatusId);
  return items.map((item) => {
    if (!ids.includes(item.id)) return item;
    return {
      ...item,
      publishStatusId: newStatusId,
      publishStatus: meta.label,
      needsReview: newStatusId === 'review',
      missingFiles: newStatusId === 'missing_assets' ? true : item.missingFiles,
      fileStatus: newStatusId === 'missing_assets' ? 'ناقص' : item.fileStatus,
      lastModified: '2026-05-23 (bulk mock)',
    };
  });
}

export function applyBulkSendReview(items, ids) {
  return applyBulkStatusChange(items, ids, 'review');
}

export function applyBulkArchive(items, ids) {
  return applyBulkStatusChange(items, ids, 'archived');
}

export function countInventoryStats(items) {
  return {
    total: items.length,
    missingFiles: items.filter((i) => i.missingFiles).length,
    needsReview: items.filter((i) => i.needsReview).length,
    published: items.filter((i) => i.publishStatusId === 'published').length,
  };
}
