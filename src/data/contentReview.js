export const reviewWorkflowStates = [
  { id: 'draft', label: 'مسودة', tone: 'muted' },
  { id: 'review', label: 'يحتاج مراجعة', tone: 'warning' },
  { id: 'ready', label: 'جاهز للنشر', tone: 'info' },
  { id: 'published', label: 'منشور', tone: 'success' },
  { id: 'archived', label: 'مؤرشف', tone: 'muted' },
  { id: 'missing_assets', label: 'ناقص ملفات', tone: 'error' },
];

export const reviewCheckLabels = [
  { id: 'hasText', label: 'النص موجود' },
  { id: 'ageSet', label: 'العمر محدد' },
  { id: 'placementSet', label: 'مكان الظهور محدد' },
  { id: 'filesOk', label: 'الملفات موجودة' },
  { id: 'linksOk', label: 'لا توجد روابط معطلة' },
];

export function getReviewStateMeta(statusId) {
  return reviewWorkflowStates.find((s) => s.id === statusId) ?? reviewWorkflowStates[0];
}

export function buildReviewChecks(item) {
  return reviewCheckLabels.map((c) => ({
    ...c,
    ok: Boolean(item.checks?.[c.id]),
  }));
}

export function allChecksPassed(checks) {
  return reviewCheckLabels.every((c) => checks?.[c.id]);
}

/** عناصر mock — حالات متنوعة من محررات Content Studio */
export function createInitialReviewQueue() {
  return [
    {
      id: 'rev_slide_237',
      title: 'شريحة حساب — خرزات (g237)',
      contentType: 'شريحة',
      section: 'الحساب',
      ageLabel: '6-12 شهر',
      lastModified: '2026-05-23 14:20',
      reviewer: '—',
      notes: 'صوت m4a ناقص في assets',
      status: 'missing_assets',
      summary: 'شريحة عددية — package q_129_132 · duration 45s · alt text موجود.',
      reviewReason: 'ملف الصوت غير مرفق — manifest فقط.',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: false, linksOk: true },
    },
    {
      id: 'rev_quran_s1',
      title: 'جلسة قرآن — ختمة 1 جلسة 1',
      contentType: 'جلسة قرآن',
      section: 'القرآن',
      ageLabel: 'كل الأعمار',
      lastModified: '2026-05-22 09:15',
      reviewer: 'سارة (Curriculum)',
      notes: 'mp3 غير موجود — يحتاج رفع mock',
      status: 'review',
      summary: 'نصف حزب 1 · آيات 1:1→2:31 · قارئ أحمد خضر.',
      reviewReason: 'ملف mp3 ناقص — manifest موجود.',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: false, linksOk: true },
    },
    {
      id: 'rev_lullaby',
      title: 'أغنية الخروف الصغير — تهويدات',
      contentType: 'فيديو',
      section: 'المكتبة',
      ageLabel: 'كل الأعمار',
      lastModified: '2026-05-21 16:40',
      reviewer: 'أمينة',
      notes: 'YouTube videoId تم التحقق mock',
      status: 'ready',
      summary: 'videoId UHVcRjfufic · mood: هادئة جداً · deep link library/lullabies.',
      reviewReason: 'اكتملت الفحوصات — بانتظار النشر.',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: true, linksOk: true },
    },
    {
      id: 'rev_article_draft',
      title: 'مقال — كيف أدرّس طفلي (مسودة)',
      contentType: 'مقال',
      section: 'محتوى ثابت',
      ageLabel: '—',
      lastModified: '2026-05-20 11:00',
      reviewer: '—',
      notes: '',
      status: 'draft',
      summary: '3 أقسام نصية — بدون placement نهائي.',
      reviewReason: 'مسودة — لم تُرسل للمراجعة بعد.',
      checks: { hasText: true, ageSet: false, placementSet: false, filesOk: true, linksOk: true },
    },
    {
      id: 'rev_notif_quran',
      title: 'تذكير جلسة قرآن — مساء',
      contentType: 'إشعار',
      section: 'القرآن',
      ageLabel: 'كل الأعمار',
      lastModified: '2026-05-23 08:30',
      reviewer: '—',
      notes: 'بانتظار مراجعة النص',
      status: 'review',
      summary: 'push يومي 18:00 · deep link bayanour://quran/journey.',
      reviewReason: 'نص الإشعار يحتاج موافقة Content Manager.',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: true, linksOk: true },
    },
    {
      id: 'rev_exercise_46',
      title: 'تمرين 4-6 أشهر — تنشيط مبكر',
      contentType: 'تمرين',
      section: 'الرياضة',
      ageLabel: '4-6 أشهر',
      lastModified: '2026-05-19 13:45',
      reviewer: 'Curriculum Reviewer',
      notes: 'منشور في tamareen mock',
      status: 'published',
      summary: 'videoId puUzPozUdP0 · إشراف ولي الأمر مطلوب.',
      reviewReason: '—',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: true, linksOk: true },
    },
    {
      id: 'rev_visual_old',
      title: 'درس بصري 8 — نسخة قديمة',
      contentType: 'درس',
      section: 'التحفيز البصري',
      ageLabel: '9-12 شهر',
      lastModified: '2026-04-10 10:00',
      reviewer: 'أمينة',
      notes: 'استُبدل بدرس محدّث',
      status: 'archived',
      summary: '16 شريحة — archived بعد تحديث manifest.',
      reviewReason: 'محتوى قديم — لم يعد يظهر في التطبيق.',
      checks: { hasText: true, ageSet: true, placementSet: true, filesOk: true, linksOk: true },
    },
    {
      id: 'rev_library_broken',
      title: 'قائمة YouTube قديمة — مراجعة',
      contentType: 'Playlist',
      section: 'المكتبة',
      ageLabel: '—',
      lastModified: '2026-05-18 17:20',
      reviewer: '—',
      notes: 'embed error 153 mock',
      status: 'missing_assets',
      summary: 'playlistId PLxxxxxxxx — رابط embed معطل في Flutter.',
      reviewReason: 'رابط YouTube يحتاج Referer fix أو استبدال.',
      checks: { hasText: true, ageSet: false, placementSet: true, filesOk: false, linksOk: false },
    },
  ];
}

export function applyReviewAction(item, action) {
  const now = '2026-05-23 (mock)';
  switch (action) {
    case 'approve':
      return {
        ...item,
        status: 'ready',
        reviewer: 'Curriculum Reviewer (mock)',
        lastModified: now,
        notes: item.notes ? `${item.notes} · اعتُمد` : 'اعتُمد للنشر',
        reviewReason: 'اكتملت المراجعة — جاهز للنشر.',
      };
    case 'request_edit':
      return {
        ...item,
        status: 'review',
        reviewer: 'Content Manager (mock)',
        lastModified: now,
        notes: 'طُلب تعديل — UI فقط',
        reviewReason: 'يحتاج تعديلات قبل الاعتماد.',
      };
    case 'publish':
      return {
        ...item,
        status: 'published',
        reviewer: item.reviewer === '—' ? 'Content Manager (mock)' : item.reviewer,
        lastModified: now,
        notes: item.notes ? `${item.notes} · نُشر` : 'نُشر (mock)',
        reviewReason: '—',
      };
    case 'archive':
      return {
        ...item,
        status: 'archived',
        lastModified: now,
        notes: item.notes ? `${item.notes} · أُرشف` : 'أُرشف (mock)',
        reviewReason: 'مؤرشف — لا يظهر للمستخدمين.',
      };
    default:
      return item;
  }
}

export const reviewActionMessages = {
  approve: 'اعتمد (UI فقط) — الحالة → جاهز للنشر',
  request_edit: 'طلب تعديل (UI فقط) — الحالة → يحتاج مراجعة',
  publish: 'نشر (UI فقط) — الحالة → منشور — لا Backend',
  archive: 'أرشفة (UI فقط) — الحالة → مؤرشف',
};
