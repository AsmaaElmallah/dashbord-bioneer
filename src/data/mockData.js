export const overviewStats = [
  { label: 'المستخدمون', value: '1,284' },
  { label: 'الأطفال المسجلون', value: '1,517' },
  { label: 'الاشتراكات النشطة', value: '642' },
  { label: 'جلسات اليوم المكتملة', value: '3,890' },
  { label: 'الشكاوى المفتوحة', value: '18' },
  { label: 'عناصر محتوى تحتاج مراجعة', value: '27' },
];

export const contentStatus = [
  { type: 'صور وشرائح', ready: 3726, total: 3800, pct: 98 },
  { type: 'أصوات (m4a/mp3)', ready: 0, total: 6000, pct: 0 },
  { type: 'فيديوهات onboarding', ready: 0, total: 7, pct: 0 },
  { type: 'روابط YouTube', ready: 48, total: 52, pct: 92 },
];

export const topSectionsUsage = [
  { name: 'القرآن', sessions: 1240, color: 'var(--track-quran)' },
  { name: 'الحساب النقطي', sessions: 980, color: 'var(--track-math)' },
  { name: 'التحفيز البصري', sessions: 720, color: 'var(--track-visual)' },
  { name: 'المكتبة (موسيقى هادئة)', sessions: 610, color: 'var(--primary)' },
  { name: 'الذكاء العاطفي', sessions: 540, color: 'var(--track-emotional)' },
  { name: 'الأنشطة والرياضة', sessions: 410, color: 'var(--tertiary)' },
];

export const curriculumProgress = [
  { name: 'القرآن', pct: 72, color: 'var(--track-quran)' },
  { name: 'الحساب', pct: 58, color: 'var(--track-math)' },
  { name: 'البصري', pct: 64, color: 'var(--track-visual)' },
  { name: 'العاطفي', pct: 51, color: 'var(--track-emotional)' },
];

export const users = [
  { id: 1, name: 'أمينة محمد', email: 'amina@example.com', status: 'نشط', plan: 'ذهبية', childrenCount: 2, lastActive: 'منذ ساعتين', lastActiveKey: 'recent', publishStatus: 'published' },
  { id: 2, name: 'سارة أحمد', email: 'sara@example.com', status: 'نشط', plan: 'فضية', childrenCount: 1, lastActive: 'أمس', lastActiveKey: 'week', publishStatus: 'published' },
  { id: 3, name: 'نورا خالد', email: 'nora@example.com', status: 'تجربة', plan: 'شهرية', childrenCount: 1, lastActive: 'منذ 3 أيام', lastActiveKey: 'week', publishStatus: 'draft' },
  { id: 4, name: 'هند علي', email: 'hind@example.com', status: 'موقوف', plan: 'برونزية', childrenCount: 1, lastActive: 'منذ شهر', lastActiveKey: 'old', publishStatus: 'review' },
];

export const children = [
  {
    id: 1,
    name: 'يوسف',
    age: '6-12 شهر',
    ageKey: '6-12',
    gender: 'ذكر',
    parent: 'أمينة محمد',
    parentId: 1,
    nutrition: 'رضاعة طبيعية',
    sleep: 'منتظم',
    physicalActivity: 'نعم',
    curriculumStatus: 'يوم 12 — نشط',
    curriculumKey: 'active',
    behaviorNotes: 'مستجيب جيداً للجلسات الصباحية.',
    specialNeeds: false,
    specialNeedsDetails: '',
    progress: { quran: '12 جلسة هذا الأسبوع', math: 'يوم 12 — 3 جولات', visual: 'درس 8', emotional: 'درس 6' },
    publishStatus: 'published',
  },
  {
    id: 2,
    name: 'ليان',
    age: '3-6 شهور',
    ageKey: '3-6',
    gender: 'أنثى',
    parent: 'سارة أحمد',
    parentId: 2,
    nutrition: 'حليب صناعي',
    sleep: 'متقطع — نوم متقطع',
    physicalActivity: 'نعم',
    curriculumStatus: 'يوم 5 — بصري',
    curriculumKey: 'active',
    behaviorNotes: 'تحتاج تهدئة قبل النوم.',
    specialNeeds: false,
    specialNeedsDetails: '',
    progress: { quran: '6 جلسات', math: 'لم يبدأ بعد', visual: 'درس 5', emotional: 'درس 2' },
    publishStatus: 'published',
  },
  {
    id: 3,
    name: 'آدم',
    age: '0-3 شهور',
    ageKey: '0-3',
    gender: 'ذكر',
    parent: 'نورا خالد',
    parentId: 3,
    nutrition: 'نظام متوازن',
    sleep: 'منتظم',
    physicalActivity: 'لا',
    curriculumStatus: 'بداية المنهج',
    curriculumKey: 'new',
    behaviorNotes: '',
    specialNeeds: true,
    specialNeedsDetails: 'متابعة نوم — بكاء مستمر أحياناً',
    progress: { quran: 'جلستان', math: '—', visual: '—', emotional: '—' },
    publishStatus: 'missing_assets',
  },
  {
    id: 4,
    name: 'مريم',
    age: '1-1.5 سنة',
    ageKey: '12-18',
    gender: 'أنثى',
    parent: 'أمينة محمد',
    parentId: 1,
    nutrition: 'رضاعة طبيعية',
    sleep: 'غير منتظم',
    physicalActivity: 'نعم',
    curriculumStatus: 'متوقف مؤقتاً',
    curriculumKey: 'paused',
    behaviorNotes: 'يحتاج تشجيع إضافي.',
    specialNeeds: false,
    specialNeedsDetails: '',
    progress: { quran: 'متوقف', math: 'يوم 3', visual: 'درس 1', emotional: '—' },
    publishStatus: 'review',
  },
];

export const followUpProfiles = [
  { id: 'f1', childName: 'مريم', parent: 'أمينة محمد', reason: 'توقف مؤقت في المنهج', priority: 'عالية' },
  { id: 'f2', childName: 'آدم', parent: 'نورا خالد', reason: 'احتياجات خاصة — نوم', priority: 'عالية' },
  { id: 'f3', childName: 'ليان', parent: 'سارة أحمد', reason: 'نوم متقطع — متابعة', priority: 'متوسطة' },
];

const planFeatures = [
  'منهج تعليمي متخصص لمرحلة طفلك العمرية بدقة',
  'أنشطة متخصصة مناسبة لعمره',
  'تمارين رياضية متخصصة بعمره',
  'توجيه ومتابعة ورقابة منا ومنكم أولاً بأول',
  'استشارات خاصة',
];

export const plans = [
  {
    id: 'monthly',
    title: 'الباقة الشهرية',
    price: '$5',
    priceSuffix: '/ شهر',
    duration: 'شهر واحد',
    subscribers: 210,
    revenue: '$1,050',
    status: 'منشورة',
    accent: 'var(--primary-container)',
  },
  {
    id: 'bronze',
    title: 'الباقة البرونزية',
    price: '$15',
    priceSuffix: '/ 3 أشهر',
    duration: '3 أشهر',
    subscribers: 180,
    revenue: '$2,700',
    status: 'منشورة',
    accent: '#fde8d4',
  },
  {
    id: 'silver',
    title: 'الباقة الفضية',
    price: '$30',
    priceSuffix: '/ 6 أشهر',
    duration: '6 أشهر',
    subscribers: 142,
    revenue: '$4,260',
    status: 'منشورة',
    accent: '#e8eef5',
  },
  {
    id: 'gold',
    title: 'الباقة الذهبية',
    price: '$60',
    priceSuffix: '/ سنة',
    duration: 'سنة كاملة',
    subscribers: 110,
    revenue: '$6,600',
    status: 'منشورة',
    badge: 'الأكثر توفيراً',
    accent: '#fef3c7',
  },
].map((p) => ({ ...p, features: planFeatures }));

export const subscriptions = [
  {
    id: 1,
    parent: 'أمينة محمد',
    child: 'يوسف',
    plan: 'ذهبية',
    planId: 'gold',
    start: '2025-01-01',
    end: '2026-01-01',
    status: 'نشط',
    statusKey: 'active',
    payment: 'Apple',
    expiringSoon: false,
  },
  {
    id: 2,
    parent: 'سارة أحمد',
    child: 'ليان',
    plan: 'فضية',
    planId: 'silver',
    start: '2025-06-01',
    end: '2026-06-15',
    status: 'نشط',
    statusKey: 'active',
    payment: 'Visa',
    expiringSoon: true,
  },
  {
    id: 3,
    parent: 'نورا خالد',
    child: 'آدم',
    plan: 'شهرية',
    planId: 'monthly',
    start: '2026-04-01',
    end: '2026-05-01',
    status: 'تجربة',
    statusKey: 'trial',
    payment: 'Google',
    expiringSoon: true,
  },
  {
    id: 4,
    parent: 'هند علي',
    child: 'رنا',
    plan: 'برونزية',
    planId: 'bronze',
    start: '2024-08-01',
    end: '2025-02-01',
    status: 'منتهي',
    statusKey: 'expired',
    payment: 'Apple',
    expiringSoon: false,
  },
  {
    id: 5,
    parent: 'مريم سعد',
    child: 'عمر',
    plan: 'ذهبية',
    planId: 'gold',
    start: '2025-03-01',
    end: '2026-03-01',
    status: 'موقوف',
    statusKey: 'paused',
    payment: 'Visa',
    expiringSoon: false,
  },
];

export const tracks = [
  {
    id: 'quran',
    name: 'القرآن الكريم',
    lessonsLabel: '50 ختمة',
    lessons: 50,
    sessions: 6000,
    newContentDays: '1 — 50+ (ختمات)',
    days: '1–50+',
    repeat: '2–5 جلسات/يوم',
    completion: 72,
    contentStatus: 'منشور — mp3 ناقص',
    contentTone: 'warning',
    contentType: 'جلسات صوت + نصف حزب',
    source: 'assets/audio/quran + manifest',
    reviewStatus: 'يحتاج مراجعة',
    reviewTone: 'warning',
    color: 'var(--track-quran)',
    adminPath: '/quran',
  },
  {
    id: 'math',
    name: 'الحساب النقطي',
    lessonsLabel: '66+ درس',
    lessons: 66,
    sessions: 1200,
    newContentDays: '1–160 ثم مراجعة',
    days: '1–66 (تدريب)',
    repeat: '5 مرات/يوم',
    completion: 58,
    contentStatus: 'منشور',
    contentTone: 'success',
    contentType: 'شرائح PPTX → PNG + m4a',
    source: 'assets/math/manifest.json',
    reviewStatus: 'جاهز',
    reviewTone: 'success',
    color: 'var(--track-math)',
    adminPath: '/math',
  },
  {
    id: 'visual',
    name: 'التحفيز البصري',
    lessonsLabel: '25 درساً',
    lessons: 25,
    sessions: 400,
    newContentDays: '1–25',
    days: '1–25',
    repeat: '3 مرات/يوم',
    completion: 64,
    contentStatus: 'منشور',
    contentTone: 'success',
    contentType: 'شرائح + صوت',
    source: 'assets/visual/manifest.json',
    reviewStatus: 'جاهز',
    reviewTone: 'success',
    color: 'var(--track-visual)',
    adminPath: '/visual',
  },
  {
    id: 'emotional',
    name: 'الذكاء العاطفي',
    lessonsLabel: '20 درساً',
    lessons: 20,
    sessions: 320,
    newContentDays: '1–20',
    days: '1–20',
    repeat: '3 مرات/يوم',
    completion: 51,
    contentStatus: 'منشور',
    contentTone: 'success',
    contentType: 'شرائح + صوت',
    source: 'assets/emotional/manifest.json',
    reviewStatus: 'جاهز',
    reviewTone: 'info',
    color: 'var(--track-emotional)',
    adminPath: '/emotional',
  },
];

export const curriculumPhases = [
  { id: 'a', label: 'يوم 1–25', desc: 'مرحلة A — بداية المنهج', width: 18, color: 'var(--primary)' },
  { id: 'b', label: 'يوم 26–42', desc: 'مرحلة B — توسّع', width: 14, color: 'var(--tertiary)' },
  { id: 'c', label: 'يوم 43–50', desc: 'مرحلة C', width: 10, color: 'var(--track-visual)' },
  { id: 'd', label: 'يوم 51–55', desc: 'مرحلة D', width: 8, color: 'var(--track-math)' },
  { id: 'e', label: 'يوم 56+', desc: 'مراحل E–G — محتوى جديد', width: 22, color: 'var(--secondary)' },
  { id: 'r', label: 'مراجعة', desc: 'دورة مراجعة (بعد يوم 160 للماث)', width: 28, color: 'var(--primary-dim)' },
];

export const quranOverview = {
  targetKhatmah: 50,
  sessionsPerKhatmah: 120,
  halfHizbPerSession: 1,
  durationMinutes: 15,
  activeReciter: 'أحمد خضر',
  activeReciterId: 'ahmed_khader',
};

export const quranKhatmahPlan = [
  { khatmah: 1, dailySessions: 2, daysToFinish: 60, note: 'بداية الرحلة' },
  { khatmah: 2, dailySessions: 3, daysToFinish: 40, note: 'تسريع تدريجي' },
  { khatmah: 3, dailySessions: 4, daysToFinish: 30, note: '4 جلسات يومياً' },
  { khatmah: 4, dailySessions: 5, daysToFinish: 24, note: 'الختمة 4 وما بعدها: 5 جلسات/يوم' },
];

export const quranReciters = [
  {
    id: 'ahmed_khader',
    name: 'أحمد خضر',
    active: true,
    audioAvailable: false,
    audioNote: 'manifest موجود — mp3 غير مضمّنة في assets',
  },
  {
    id: 'abdul_basit',
    name: 'عبد الباسط (mock)',
    active: false,
    audioAvailable: false,
    audioNote: 'غير مفعّل في التطبيق',
  },
  {
    id: 'minshawi',
    name: 'المنشاوي (mock)',
    active: false,
    audioAvailable: false,
    audioNote: 'مخطط لاحقاً',
  },
];

export const quranSessions = [
  {
    id: 'k01_s001',
    khatmah: 1,
    session: 1,
    hizb: 1,
    half: 1,
    title: 'نصف حزب 1 (الأول)',
    file: 'session_001.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    durationMinutes: 15,
    status: 'ناقص',
    statusKey: 'missing',
  },
  {
    id: 'k01_s002',
    khatmah: 1,
    session: 2,
    hizb: 1,
    half: 2,
    title: 'نصف حزب 1 (الثاني)',
    file: 'session_002.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_002.mp3',
    durationMinutes: 15,
    status: 'ناقص',
    statusKey: 'missing',
  },
  {
    id: 'k01_s003',
    khatmah: 1,
    session: 3,
    hizb: 2,
    half: 1,
    title: 'نصف حزب 2 (الأول)',
    file: 'session_003.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_003.mp3',
    durationMinutes: 15,
    status: 'يحتاج مراجعة',
    statusKey: 'review',
  },
  {
    id: 'k01_s060',
    khatmah: 1,
    session: 60,
    hizb: 30,
    half: 2,
    title: 'نصف حزب 30 (الثاني)',
    file: 'session_060.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_060.mp3',
    durationMinutes: 15,
    status: 'موجود',
    statusKey: 'ok',
  },
  {
    id: 'k02_s001',
    khatmah: 2,
    session: 1,
    hizb: 1,
    half: 1,
    title: 'نصف حزب 1 (الأول)',
    file: 'session_001.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    durationMinutes: 15,
    status: 'ناقص',
    statusKey: 'missing',
  },
  {
    id: 'k03_s010',
    khatmah: 3,
    session: 10,
    hizb: 5,
    half: 2,
    title: 'نصف حزب 5 (الثاني)',
    file: 'session_010.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_010.mp3',
    durationMinutes: 15,
    status: 'يحتاج مراجعة',
    statusKey: 'review',
  },
  {
    id: 'k05_s120',
    khatmah: 5,
    session: 120,
    hizb: 60,
    half: 2,
    title: 'نصف حزب 60 (الثاني)',
    file: 'session_120.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_120.mp3',
    durationMinutes: 15,
    status: 'موجود',
    statusKey: 'ok',
  },
  {
    id: 'k50_s001',
    khatmah: 50,
    session: 1,
    hizb: 1,
    half: 1,
    title: 'نصف حزب 1 (الأول) — ختمة 50',
    file: 'session_001.mp3',
    audioPath: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    durationMinutes: 15,
    status: 'ناقص',
    statusKey: 'missing',
  },
];

export const mathOverview = {
  lessonCount: 25,
  coreSlideCount: 237,
  manifestPackageCount: 22,
  lastNewContentDay: 160,
  reviewCycleStartDay: 161,
  totalProgramDays: 730,
};

function mathLessonSlideRange(lesson) {
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 11) return { slideCount: 5, globalStart: 96, globalEnd: 100 };
  if (lesson === 25) return { slideCount: 7, globalStart: 231, globalEnd: 237 };
  if (lesson >= 2 && lesson <= 10) {
    const globalStart = 6 + 10 * (lesson - 2);
    return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
  }
  const globalStart = 101 + 10 * (lesson - 12);
  return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
}

function mathLessonDaysLabel(lesson) {
  if (lesson === 1) return '1–25 (+ مراجعة من 161)';
  if (lesson === 2) return '26–42';
  if (lesson === 3) return '43–50';
  if (lesson === 4) return '51–55';
  const start = 56 + 5 * (lesson - 5);
  const end = start + 4;
  if (lesson === 25) return `${start}–${end} (آخر محتوى جديد)`;
  return `${start}–${end}`;
}

function mathLessonRepeat(lesson) {
  if (lesson === 1) return '2×/يوم';
  if (lesson === 2) return '3×/يوم';
  if (lesson === 3) return '4×/يوم';
  return '5×/يوم';
}

export const mathLessons = Array.from({ length: 25 }, (_, i) => {
  const lesson = i + 1;
  const { slideCount, globalStart, globalEnd } = mathLessonSlideRange(lesson);
  return {
    id: `lesson_${lesson}`,
    lesson,
    globalRange: `${globalStart}–${globalEnd}`,
    slideCount,
    days: mathLessonDaysLabel(lesson),
    dailyRepeat: mathLessonRepeat(lesson),
    contentStatus: 'منشور',
  };
});

export const mathPackages = [
  {
    id: 'q_129_132',
    sourceFile: 'الدرس 20 من 129-132 يوم-التكرار للدرس ٥ مرات باليوم.pptx',
    slideCount: 100,
    inCoreSequence: 100,
    trackLabel: 'حساب كمي',
    role: 'منهج أساسي',
    roleKey: 'core',
  },
  {
    id: 'dot_numeric_133_136',
    sourceFile: 'الدرس1حساب عددي كمي -من  133-136-يوم تكرار الدرس ٥ مرات باليوم.pptx',
    slideCount: 101,
    inCoreSequence: 100,
    trackLabel: 'حساب نقطي عددي',
    role: 'منهج أساسي (100 في التسلسل)',
    roleKey: 'core',
  },
  {
    id: 'beads_numeric',
    sourceFile: 'الحساب العددي معا الخرزات.pptx',
    slideCount: 37,
    inCoreSequence: 37,
    trackLabel: 'حساب عددي وخرزات',
    role: 'منهج أساسي',
    roleKey: 'core',
  },
  {
    id: 'lesson_01_10',
    sourceFile: null,
    slideCount: 5,
    inCoreSequence: 0,
    trackLabel: 'حساب كمي',
    role: 'أرشيف manifest',
    roleKey: 'archive',
  },
  {
    id: 'q_11_20',
    sourceFile: null,
    slideCount: 15,
    inCoreSequence: 0,
    trackLabel: 'حساب كمي',
    role: 'أرشيف manifest',
    roleKey: 'archive',
  },
  {
    id: 'lesson_51_60',
    sourceFile: null,
    slideCount: 35,
    inCoreSequence: 0,
    trackLabel: 'حساب كمي',
    role: 'أرشيف manifest',
    roleKey: 'archive',
  },
];

export const mathSlideSamples = [
  {
    id: 'slide_g001',
    lesson: 1,
    globalIndex: 1,
    packageId: 'q_129_132',
    slideIndex: 1,
    assetPath: 'assets/math/packages/q_129_132/slides/slide_001.png',
    durationSec: 45,
    audioPath: 'assets/math/packages/q_129_132/audio/slide_001.m4a',
    audioStatus: 'موجود',
  },
  {
    id: 'slide_g096',
    lesson: 11,
    globalIndex: 96,
    packageId: 'dot_numeric_133_136',
    slideIndex: 96,
    assetPath: 'assets/math/packages/dot_numeric_133_136/slides/slide_096.png',
    durationSec: 52,
    audioPath: 'assets/math/packages/dot_numeric_133_136/audio/slide_096.m4a',
    audioStatus: 'موجود',
  },
  {
    id: 'slide_g237',
    lesson: 25,
    globalIndex: 237,
    packageId: 'beads_numeric',
    slideIndex: 37,
    assetPath: 'assets/math/packages/beads_numeric/slides/slide_037.png',
    durationSec: 60,
    audioPath: 'assets/math/packages/beads_numeric/audio/slide_037.m4a',
    audioStatus: 'ناقص',
  },
];

export const visualOverview = {
  lessonCount: 30,
  slideCount: 292,
  packageCount: 18,
  lastNewContentDay: 185,
  reviewCycleStartDay: 186,
};

function visualLessonSlideRange(lesson) {
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 30) return { slideCount: 7, globalStart: 286, globalEnd: 292 };
  const globalStart = 6 + 10 * (lesson - 2);
  return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
}

function visualLessonDaysLabel(lesson) {
  if (lesson === 1) return '1–25 (+ مراجعة من 186)';
  if (lesson === 2) return '26–42';
  if (lesson === 3) return '43–50';
  if (lesson === 4) return '51–55';
  const start = 56 + 5 * (lesson - 5);
  const end = start + 4;
  if (lesson === 30) return `${start}–${end} (آخر محتوى جديد)`;
  return `${start}–${end}`;
}

export const visualLessons = Array.from({ length: 30 }, (_, i) => {
  const lesson = i + 1;
  const { slideCount, globalStart, globalEnd } = visualLessonSlideRange(lesson);
  return {
    id: `visual_lesson_${lesson}`,
    lesson,
    globalRange: `${globalStart}–${globalEnd}`,
    slideCount,
    days: visualLessonDaysLabel(lesson),
    contentStatus: 'منشور',
  };
});

export const visualPackages = [
  { id: 'visual_src_01', slideCount: 5, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_02', slideCount: 5, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_03', slideCount: 5, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_04', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_05', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_06', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_07', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_08', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_09', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_10', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_11', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_12', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_13', slideCount: 5, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_14', slideCount: 5, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_15', slideCount: 10, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_16', slideCount: 46, imageStatus: 'موجود', audioStatus: 'موجود' },
  { id: 'visual_src_17', slideCount: 72, imageStatus: 'موجود', audioStatus: 'يحتاج مراجعة' },
  { id: 'visual_src_18', slideCount: 49, imageStatus: 'موجود', audioStatus: 'موجود' },
];

export const visualSlideSamples = [
  {
    id: 'v_slide_001',
    lesson: 1,
    globalIndex: 1,
    packageId: 'visual_src_01',
    slideIndex: 1,
    assetPath: 'assets/visual/packages/visual_src_01/slide_001/slide.png',
    durationSec: 40,
    audioStatus: 'موجود',
  },
  {
    id: 'v_slide_150',
    lesson: 16,
    globalIndex: 150,
    packageId: 'visual_src_16',
    slideIndex: 20,
    assetPath: 'assets/visual/packages/visual_src_16/slide_020/slide.png',
    durationSec: 55,
    audioStatus: 'موجود',
  },
  {
    id: 'v_slide_292',
    lesson: 30,
    globalIndex: 292,
    packageId: 'visual_src_18',
    slideIndex: 49,
    assetPath: 'assets/visual/packages/visual_src_18/slide_049/slide.png',
    durationSec: 48,
    audioStatus: 'موجود',
  },
];

export const emotionalOverview = {
  lessonCount: 17,
  slideCount: 162,
  packageCount: 32,
  lastNewContentDay: 120,
  reviewCycleStartDay: 121,
};

function emotionalLessonSlideRange(lesson) {
  if (lesson === 1) return { slideCount: 5, globalStart: 1, globalEnd: 5 };
  if (lesson === 17) return { slideCount: 7, globalStart: 156, globalEnd: 162 };
  const globalStart = 6 + 10 * (lesson - 2);
  return { slideCount: 10, globalStart, globalEnd: globalStart + 9 };
}

function emotionalLessonDaysLabel(lesson) {
  if (lesson === 1) return '1–25 (+ مراجعة من 121)';
  if (lesson === 2) return '26–42';
  if (lesson === 3) return '43–50';
  if (lesson === 4) return '51–55';
  const start = 56 + 5 * (lesson - 5);
  const end = start + 4;
  if (lesson === 17) return `${start}–${end} (آخر محتوى جديد)`;
  return `${start}–${end}`;
}

const emotionalLessonMeta = [
  { title: 'التواصل البصري الأول', goal: 'تعزيز التركيز البصري والابتسامة', ageFit: 'من الولادة — بداية اجتماعية' },
  { title: 'توسيع التفاعل', goal: 'مشاركة الانتباه مع مقدّم الرعاية', ageFit: '3–6 أشهر' },
  { title: 'التعرف على المشاعر', goal: 'ربط التعبيرات بالمشاعر الأساسية', ageFit: '6–12 شهر' },
  { title: 'الطمأنينة والارتباط', goal: 'تعزيز الشعور بالأمان', ageFit: '6–12 شهر' },
  { title: 'التكثيف الاجتماعي', goal: 'زيادة مدة التفاعل الاجتماعي', ageFit: '9–15 شهر' },
  { title: 'التقليد واللعب', goal: 'تشجيع التقليد البسيط', ageFit: '9–15 شهر' },
  { title: 'التعاون المبكر', goal: 'مهارات انتظار الدور البسيطة', ageFit: '12–18 شهر' },
  { title: 'التعبير عن الرغبة', goal: 'الإشارة والتواصل غير اللفظي', ageFit: '12–18 شهر' },
  { title: 'فهم مشاعر الآخرين', goal: 'قراءة تعابير الوجه', ageFit: '12–18 شهر' },
  { title: 'اللعب التعاوني', goal: 'مشاركة لعبة بسيطة', ageFit: '15–21 شهر' },
  { title: 'ضبط الانفعال', goal: 'استراتيجيات تهدئة بسيطة', ageFit: '15–21 شهر' },
  { title: 'التواصل الاجتماعي', goal: 'التواصل مع أقران أو إخوة', ageFit: '15–21 شهر' },
  { title: 'حل النزاعات البسيط', goal: 'التعبير بدل الانسحاب', ageFit: '18–24 شهر' },
  { title: 'التعاطف المبكر', goal: 'الاهتمام بمشاعر الآخر', ageFit: '18–24 شهر' },
  { title: 'مهارات المجتمع', goal: 'قواعد جماعية بسيطة', ageFit: 'حتى سنتين' },
  { title: 'الثقة بالنفس', goal: 'تشجيع المحاولة والإصرار', ageFit: 'حتى سنتين' },
  { title: 'خاتمة المسار العاطفي', goal: 'مراجعة وتعزيز المهارات', ageFit: 'حتى سنتين — مرحلة ختامية' },
];

export const emotionalLessons = Array.from({ length: 17 }, (_, i) => {
  const lesson = i + 1;
  const { slideCount, globalStart, globalEnd } = emotionalLessonSlideRange(lesson);
  const meta = emotionalLessonMeta[i];
  return {
    id: `emotional_lesson_${lesson}`,
    lesson,
    slideCount,
    globalStart,
    globalEnd,
    globalRange: `${globalStart}–${globalEnd}`,
    days: emotionalLessonDaysLabel(lesson),
    publishStatus: 'منشور',
    ageFit: meta.ageFit,
    title: meta.title,
    goal: meta.goal,
    linkedFiles: [
      `assets/emotional/packages/emotional_src_${String(Math.min(lesson, 32)).padStart(2, '0')}/`,
      'assets/emotional/manifest.json',
    ],
  };
});

const emotionalPackageSlideCounts = [
  6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5,
];

export const emotionalPackages = emotionalPackageSlideCounts.map((slideCount, i) => {
  const id = `emotional_src_${String(i + 1).padStart(2, '0')}`;
  return {
    id,
    slideCount,
    imageStatus: 'موجود',
    audioStatus: i === 22 ? 'يحتاج مراجعة' : 'موجود',
  };
});

export const libraryTabs = [
  { id: 'nature', title: 'أصوات الطبيعة' },
  { id: 'calm', title: 'موسيقى هادئة' },
  { id: 'lullabies', title: 'تهويدات' },
  { id: 'review', title: 'روابط تحتاج مراجعة' },
];

const lib = (row) => {
  const publishStatus =
    row.publishStatus ??
    (row.categoryId === 'review'
      ? 'review'
      : row.linkStatus === 'معطّل (mock)'
        ? 'missing_assets'
        : 'published');
  return {
    showsWhen: `المكتبة > ${row.categoryTitle}`,
    linkStatus: row.linkStatus ?? 'سليم',
    publishStatus,
    ...row,
  };
};

export const libraryMediaItems = [
  ...[
    ['nature', 'أصوات الطبيعة', 'eKFTSSKCzWA', 'قطرات المطر', '10:00', 'مطر'],
    ['nature', 'أصوات الطبيعة', 'UZ9uyQI3pF0', 'مطر على النافذة', '08:30', 'هادئ'],
    ['nature', 'أصوات الطبيعة', 'eyez3u8rG54', 'غابة الصباح', '12:00', 'غابة'],
    ['nature', 'أصوات الطبيعة', 'R34j1kse4VU', 'طيور الغابة', '09:15', 'طبيعة'],
    ['nature', 'أصوات الطبيعة', 'wiJLU60r4gk', 'أمواج المحيط', '11:20', 'محيط'],
    ['nature', 'أصوات الطبيعة', '0iirgixp85Y', 'شاطئ هادئ', '07:45', 'مريح'],
    ['nature', 'أصوات الطبيعة', 'iBXHFjno9r0', 'نسيم عليل', '06:00', 'رياح'],
  ].map(([categoryId, categoryTitle, videoId, title, duration, moodTag]) =>
    lib({
      id: `nature_${videoId}`,
      categoryId,
      categoryTitle,
      title,
      videoId,
      playlistId: null,
      duration,
      moodTag,
      itemType: 'video',
    }),
  ),
  ...[
    ['calm', 'موسيقى هادئة', 'XXIRWAEVs8o', 'موسيقى نوم هادئة', '04:20', 'مريح'],
    ['calm', 'موسيقى هادئة', '6lEwV7hk1hk', 'بيانو للرضع', '05:10', 'نوم'],
    ['calm', 'موسيقى هادئة', 'flDO0Sgmvas', 'ألحان استرخاء', '06:30', 'هادئ'],
    ['calm', 'موسيقى هادئة', 'qVEXupgEP4Y', 'موجات دلتا', '08:00', 'عميق'],
    ['calm', 'موسيقى هادئة', 'flJo10TDHcU', 'ليل هادئ', '04:50', 'نوم'],
    ['calm', 'موسيقى هادئة', 'tDVyPiRnAEw', 'نجوم الليل', '07:15', 'مريح'],
  ].map(([categoryId, categoryTitle, videoId, title, duration, moodTag]) =>
    lib({
      id: `calm_${videoId}`,
      categoryId,
      categoryTitle,
      title,
      videoId,
      playlistId: null,
      duration,
      moodTag,
      itemType: 'video',
    }),
  ),
  lib({
    id: 'calm_draft_mock',
    categoryId: 'calm',
    categoryTitle: 'موسيقى هادئة',
    title: 'مسودة — مزيج نوم (قيد الإعداد)',
    videoId: null,
    playlistId: null,
    duration: '—',
    moodTag: 'مسودة',
    itemType: 'video',
    publishStatus: 'draft',
    linkStatus: 'سليم',
  }),
  lib({
    id: 'lullaby_1',
    categoryId: 'lullabies',
    categoryTitle: 'تهويدات',
    title: 'أغنية الخروف الصغير',
    videoId: 'UHVcRjfufic',
    playlistId: null,
    duration: '03:45',
    moodTag: 'هادئة جداً',
    itemType: 'video',
  }),
  lib({
    id: 'lullaby_playlist',
    categoryId: 'lullabies',
    categoryTitle: 'تهويدات',
    title: 'تهويدات من أنحاء العالم',
    videoId: null,
    playlistId: 'PLVdBsyVAy4VRfI-rG7LvjNSalxOdcSv-e',
    duration: 'قائمة',
    moodTag: 'كلاسيك',
    itemType: 'playlist',
  }),
  lib({
    id: 'lullaby_2',
    categoryId: 'lullabies',
    categoryTitle: 'تهويدات',
    title: 'يا نجوم الليل',
    videoId: 'de30kR5jFJ4',
    playlistId: null,
    duration: '05:12',
    moodTag: 'كلاسيك',
    itemType: 'video',
  }),
  lib({
    id: 'lullaby_3',
    categoryId: 'lullabies',
    categoryTitle: 'تهويدات',
    title: 'حلم الحوت الأزرق',
    videoId: 'EsMGye9r8eg',
    playlistId: null,
    duration: '04:20',
    moodTag: 'أصوات الطبيعة',
    itemType: 'video',
  }),
  lib({
    id: 'lullaby_4',
    categoryId: 'lullabies',
    categoryTitle: 'تهويدات',
    title: 'تهويدة القمر',
    videoId: '6u8VP_X371c',
    playlistId: null,
    duration: '04:00',
    moodTag: 'نوم',
    itemType: 'video',
  }),
  lib({
    id: 'review_embed_fail',
    categoryId: 'review',
    categoryTitle: 'روابط تحتاج مراجعة',
    title: 'فيديو تجريبي — خطأ embed محتمل',
    videoId: 'xxxxxxxxxxx',
    playlistId: null,
    duration: '—',
    moodTag: 'مراجعة',
    itemType: 'video',
    linkStatus: 'يحتاج مراجعة',
    showsWhen: 'قائمة المراجعة — لم يُختبر في التطبيق',
  }),
  lib({
    id: 'review_playlist_old',
    categoryId: 'review',
    categoryTitle: 'روابط تحتاج مراجعة',
    title: 'قائمة قديمة — مراجعة يدوية',
    videoId: null,
    playlistId: 'PLxxxxxxxxxxxxxxxx',
    duration: 'قائمة',
    moodTag: 'قديم',
    itemType: 'playlist',
    linkStatus: 'يحتاج مراجعة',
    showsWhen: 'قائمة المراجعة',
  }),
  lib({
    id: 'review_referer',
    categoryId: 'review',
    categoryTitle: 'روابط تحتاج مراجعة',
    title: 'محتوى YouTube — تحقق Referer',
    videoId: 'dQw4w9WgXcQ',
    playlistId: null,
    duration: '03:33',
    moodTag: 'اختبار',
    itemType: 'video',
    linkStatus: 'معطّل (mock)',
    showsWhen: 'يحتاج Referer: com.bayanour.bayanour',
  }),
];

/** @deprecated use libraryTabs + libraryMediaItems */
export const libraryCategories = libraryTabs
  .filter((t) => t.id !== 'review')
  .map((t) => ({
    id: t.id,
    title: t.title,
    items: libraryMediaItems.filter((i) => i.categoryId === t.id).length,
    type: 'YouTube',
  }));

const creativePlayPlaylistId = 'PLFYChdcFDqm1WqBec1DNB2VIOLRD_Mdgs';

function mediaGroupStatus(itemCount, parentNote) {
  if (itemCount > 0) return 'مكتمل';
  if (parentNote?.includes('قيد الإضافة')) return 'قيد الإضافة';
  return 'ناقص';
}

export const activityAgeGroups = [
  { id: 'age_0_3', title: '0 – 3 أشهر', subtitle: 'أنشطة حسية مبكرة', parentNote: 'محتوى هذا العمر قيد الإضافة قريباً.', items: [] },
  { id: 'age_4_6', title: '4 – 6 أشهر', subtitle: 'استكشاف وتحفيز', parentNote: 'محتوى هذا العمر قيد الإضافة قريباً.', items: [] },
  { id: 'age_6_9', title: '6 – 9 أشهر', subtitle: 'لعب تفاعلي', parentNote: 'محتوى هذا العمر قيد الإضافة قريباً.', items: [] },
  { id: 'age_9_12', title: '9 – 12 شهر', subtitle: 'لعب إبداعي', parentNote: 'أنشطة اللعب الإبداعي للرضيع والطفل الصغير — ذكريات ممتعة لكِ ولطفلك.', items: [{ id: 'act_9_12', title: 'لعب إبداعي (9–36 شهر)', playlistId: creativePlayPlaylistId, moodTag: 'لعب مشترك' }] },
  { id: 'age_12_18', title: 'سنة – سنة ونصف', subtitle: 'لعب إبداعي', parentNote: null, items: [{ id: 'act_12_18', title: 'لعب إبداعي (9–36 شهر)', playlistId: creativePlayPlaylistId, moodTag: 'إبداع' }] },
  { id: 'age_18_24', title: 'سنة ونصف – سنتين', subtitle: 'لعب إبداعي', parentNote: null, items: [{ id: 'act_18_24', title: 'لعب إبداعي (9–36 شهر)', playlistId: creativePlayPlaylistId, moodTag: 'إبداع' }] },
  { id: 'age_9_36', title: '9 – 36 شهر', subtitle: 'لعب إبداعي — كامل', parentNote: 'قائمة #9-36 months — Creative Play: أنشطة للأطفال والصغار للعب المشترك مع الأم.', items: [{ id: 'act_9_36', title: 'لعب إبداعي للرضيع والطفل', playlistId: creativePlayPlaylistId, moodTag: 'قائمة كاملة' }] },
].map((g) => ({
  ...g,
  itemCount: g.items.length,
  status: mediaGroupStatus(g.items.length, g.parentNote),
  track: 'activities',
}));

const exerciseGroupsRaw = [
  ['age_0_3', '0 – 3 أشهر', 'تمارين ومساج الرضيع', 'ملاحظة: التمارين الصينية تُمارس بالتدريج البطيء حتى يصل الطفل للشهر الثالث لهذه المرونة.', [
    ['0_3_1', 'تمرين ومساج ١', 'i1qtB9TzdGA', null, null],
    ['0_3_2', 'تمرين ومساج ٢', 'OAe1C-kAliU', null, null],
    ['0_3_3', 'تمرين قصير ١', 'Zu8jIRD4xTI', null, null],
    ['0_3_4', 'تمرين قصير ٢', 'r-w2RkQXzjM', null, null],
    ['0_3_5', 'للتنويم', 'qF83rdkkKSA', null, 'تنويم'],
    ['0_3_6', 'تمرين ٦', 'GfGxJX6KJjw', null, null],
    ['0_3_7', 'تمرين ٧', 'nLzVts5j0SI', null, null],
    ['0_3_8', 'تمرين ٨', 'RfI4l9zLGc4', null, null],
  ]],
  ['age_4_6', '4 – 6 أشهر', 'تنشيط وحركة مبكرة', null, [
    ['4_6_1', 'تمرين قصير ١', 'puUzPozUdP0', null, null],
    ['4_6_2', 'تمرين قصير ٢', 'sc8JClYxlZQ', null, null],
    ['4_6_3', 'تمرين قصير ٣', 'snf5mD8MLuQ', null, null],
    ['4_6_4', 'تمرين قصير ٤', 'FHuLEsbdMOE', null, null],
    ['4_6_5', 'تمرين ٥', 'euyou2eaLOA', null, null],
    ['4_6_6', 'تمرين ٦', '8bAGeE4sjfk', null, null],
    ['4_6_pl_1', 'تمارين 3–6 أشهر (قائمة)', null, 'PLFYChdcFDqm1OvmAgkeCIrZ-Rzevai8km', 'قائمة'],
    ['4_6_pl_2', 'سباحة الأطفال (قائمة)', null, 'PLFYChdcFDqm1c8ih6v0PK_yLK0s6S8nRY', 'قائمة'],
  ]],
  ['age_6_9', '6 – 9 أشهر', 'زحف ونشاط', null, [
    ['6_9_pl_1', 'جمباز الرضيع 6–9 (قائمة)', null, 'PLFYChdcFDqm1NGVpQlD3HJqva_nVl5KC_', 'قائمة'],
    ['6_9_2', 'تمرين ٢', '6bQKjpeQfkQ', null, null],
    ['6_9_3', 'تمرين ٣', 'OR8AI10WeyE', null, null],
    ['6_9_pl_2', 'تعليم الزحف (قائمة)', null, 'PLFYChdcFDqm39E4Ppz4aH_MjlCskhVswy', 'قائمة'],
  ]],
  ['age_9_12', '9 – 12 شهر', 'وقوف ومشي مبكر', null, [
    ['9_12_pl', 'تعليم المشي والوقوف (قائمة)', null, 'PLFYChdcFDqm0VsWxvQEbj6pL690ANPDZk', 'قائمة'],
  ]],
  ['age_12_18', 'سنة – سنة ونصف', 'توازن وحركة', null, [
    ['12_18_1', 'تمرين ١', 'qsgdOo1gcw4', null, null],
    ['12_18_2', 'تمرين ٢', 'zzgbM2woqPI', null, null],
    ['12_18_3', 'تمرين ٣', 'n9qCcDMeWGw', null, null],
  ]],
  ['age_18_24', 'سنة ونصف – سنتين', 'نشاط وتنسيق', null, [
    ['18_24_1', 'تمرين ١', 'zzgbM2woqPI', null, null],
    ['18_24_2', 'تمرين ٢', '_askVfAzqdY', null, null],
    ['18_24_3', 'تمرين ٣', 'zxiNU78BD_Q', null, null],
    ['18_24_4', 'تمرين ٤', '8_FLdwGxxPk', null, null],
    ['18_24_5', 'تمرين ٥', 'QIxIjwEB7DA', null, null],
    ['18_24_6', 'تمرين ٦', 'T67NVvu8BRk', null, null],
    ['18_24_7', 'تمرين ٧', 'xae5xvSGsWA', null, null],
    ['18_24_8', 'تمرين ٨', 'lDMvmOouXTw', null, null],
    ['18_24_9', 'تمرين ٩', 'RpNMEfKQMo8', null, null],
    ['18_24_10', 'تمرين ١٠', 'YU9DDuysUWQ', null, null],
    ['18_24_11', 'تمرين ١١', 'P0IlvsCtx3U', null, null],
    ['18_24_12', 'تمرين ١٢', '6i2tZMIk_R4', null, null],
    ['18_24_13', 'تمرين ١٣', 'U-_wGm8jPeI', null, null],
    ['18_24_14', 'تمرين ١٤', 'TFx_Ct8E_BE', null, null],
    ['18_24_15', 'تمرين ١٥', 'VDpz5EQgIyU', null, null],
    ['18_24_16', 'تمرين ١٦', '45sVmmwBoc8', null, null],
    ['18_24_17', 'تمرين ١٧', 'BYzx2Kxp1X0', null, null],
    ['18_24_18', 'تمرين ١٨', '49jUtQXMnJI', null, null],
    ['18_24_19', 'تمرين ١٩', '_K45xrc_36Y', null, null],
    ['18_24_20', 'تمرين ٢٠', 'bKwRnHSdFus', null, null],
    ['18_24_21', 'تمرين ٢١', 'hzkmIesyx_s', null, null],
    ['18_24_22', 'تمرين ٢٢', 'iVvraQVbeqo', null, null],
    ['18_24_23', 'تمرين ٢٣', 'Gn8AzfeEDUI', null, null],
  ]],
];

export const exerciseAgeGroups = exerciseGroupsRaw.map(([id, title, subtitle, parentNote, items]) => ({
  id,
  title,
  subtitle,
  parentNote,
  items: items.map(([itemId, itemTitle, videoId, playlistId, moodTag]) => ({
    id: itemId,
    title: itemTitle,
    videoId,
    playlistId,
    moodTag: moodTag ?? (playlistId ? 'قائمة' : 'تمرين'),
  })),
  itemCount: items.length,
  status: mediaGroupStatus(items.length, parentNote),
  track: 'exercises',
}));

export const mediaAgeGroupsUnified = (() => {
  const ids = new Set([
    ...activityAgeGroups.map((g) => g.id),
    ...exerciseAgeGroups.map((g) => g.id),
  ]);
  return [...ids].map((id) => {
    const act = activityAgeGroups.find((g) => g.id === id);
    const ex = exerciseAgeGroups.find((g) => g.id === id);
    const activityCount = act?.itemCount ?? 0;
    const exerciseCount = ex?.itemCount ?? 0;
    const parentNote = [act?.parentNote, ex?.parentNote].filter(Boolean).join(' | ') || '—';
    let status = 'مكتمل';
    if (activityCount === 0 && exerciseCount === 0) status = 'ناقص';
    else if (activityCount === 0 && act?.status === 'قيد الإضافة') status = 'قيد الإضافة';
    else if (activityCount === 0 && exerciseCount > 0) status = 'قيد الإضافة (أنشطة)';
    return {
      id,
      title: act?.title ?? ex?.title,
      subtitle: `${act?.subtitle ?? '—'} / ${ex?.subtitle ?? '—'}`,
      activityCount,
      exerciseCount,
      itemCount: activityCount + exerciseCount,
      parentNote,
      status,
      actStatus: act?.status ?? '—',
      exStatus: ex?.status ?? '—',
    };
  });
})();

export const activityMediaItems = activityAgeGroups.flatMap((g) =>
  g.items.map((item) => ({
    ...item,
    ageGroupId: g.id,
    ageLabel: g.title,
    section: 'الأنشطة',
    sectionKey: 'activities',
    publishStatus: 'منشور',
    showsIn: 'الأنشطة > MediaAgeHub',
    subscriptionRequired: 'فضية',
  })),
);

export const exerciseMediaItems = exerciseAgeGroups.flatMap((g) =>
  g.items.map((item) => ({
    ...item,
    ageGroupId: g.id,
    ageLabel: g.title,
    section: 'الرياضة والتمارين',
    sectionKey: 'exercises',
    publishStatus: 'منشور',
    showsIn: 'الرياضة > MediaAgeHub',
    subscriptionRequired: 'فضية',
  })),
);

export const incompleteMediaAgeGroups = [
  ...activityAgeGroups.filter((g) => g.itemCount === 0),
  ...exerciseAgeGroups.filter((g) => g.itemCount === 0),
];

export const assessmentOverview = {
  aptitude: 20,
  skills: 6,
  interests: 6,
  child: 6,
};

export const assessmentTests = [
  {
    id: 'aptitude_0_2',
    name: 'اختبار تقييم قدرات الطفل',
    description: '٤ محاور نمو — إجابات نعم/لا حسب العمر (٠–٢ سنة)',
    questionCount: 20,
    ageRange: '0–2 سنة',
    showsIn: 'تقييمنا > اختبار القدرات',
    status: 'نشط',
  },
  {
    id: 'skills_test',
    name: 'اختبار المهارات',
    description: 'ملاحظات يومية عن مهارات الطفل — تُحفظ محلياً على الجهاز',
    questionCount: 6,
    ageRange: 'حسب عمر الطفل',
    showsIn: 'تقييمنا > MotherQuiz',
    status: 'نشط',
  },
  {
    id: 'interests_test',
    name: 'فحص ميول الطفل وشغفه',
    description: 'ما يجذب انتباه الطفل لاختيار الأنشطة',
    questionCount: 6,
    ageRange: 'حسب عمر الطفل',
    showsIn: 'تقييمنا > MotherQuiz',
    status: 'نشط',
  },
  {
    id: 'child_tests',
    name: 'اختبارات الطفل',
    description: 'مؤشرات نمو مبكرة — ملاحظة أمومية وليست تشخيصاً',
    questionCount: 6,
    ageRange: 'حسب عمر الطفل',
    showsIn: 'تقييمنا > MotherQuiz',
    status: 'نشط',
  },
];

export const assessmentQuestions = [
  ...[
    ['aptitude_0_2', 'النمو البدني', 'physical_1', 'هل يرفع رأسه عندما يكون على بطنه؟', '0-3 شهور'],
    ['aptitude_0_2', 'النمو البدني', 'physical_2', 'هل يجلس بدون دعم؟', '4-7 شهور'],
    ['aptitude_0_2', 'النمو البدني', 'physical_3', 'هل يزحف أو يتحرك؟', '6-10 شهور'],
    ['aptitude_0_2', 'النمو البدني', 'physical_4', 'هل يقف مع دعم؟', '9-12 شهر'],
    ['aptitude_0_2', 'النمو البدني', 'physical_5', 'هل يمشي بدون دعم؟', '12-18 شهر'],
    ['aptitude_0_2', 'النمو اللغوي', 'language_1', 'هل يصدر أصواتًا مختلفة؟', '0-3 شهور'],
    ['aptitude_0_2', 'النمو اللغوي', 'language_2', 'هل يناغي؟', '3-6 شهور'],
    ['aptitude_0_2', 'النمو اللغوي', 'language_3', 'هل يقول كلمات بسيطة (ماما، بابا)؟', '6-12 شهر'],
    ['aptitude_0_2', 'النمو اللغوي', 'language_4', 'هل يفهم الأوامر البسيطة؟', '9-12 شهر'],
    ['aptitude_0_2', 'النمو اللغوي', 'language_5', 'هل يقول جمل قصيرة؟', '18-24 شهر'],
    ['aptitude_0_2', 'النمو الاجتماعي', 'social_1', 'هل يتبع النظر؟', '0-3 شهور'],
    ['aptitude_0_2', 'النمو الاجتماعي', 'social_2', 'هل يلعب بالألعاب؟', '3-6 شهور'],
    ['aptitude_0_2', 'النمو الاجتماعي', 'social_3', 'هل يظهر اهتمامًا بالأشخاص؟', '6-12 شهر'],
    ['aptitude_0_2', 'النمو الاجتماعي', 'social_4', 'هل يظهر مشاعر (فرح، غضب)؟', '12-18 شهر'],
    ['aptitude_0_2', 'النمو الاجتماعي', 'social_5', 'هل يلعب مع الآخرين؟', '18-24 شهر'],
    ['aptitude_0_2', 'النمو المعرفي', 'cognitive_1', 'هل يتعرف على الوجوه؟', '0-3 شهور'],
    ['aptitude_0_2', 'النمو المعرفي', 'cognitive_2', 'هل يلعب بألعاب بسيطة؟', '3-6 شهور'],
    ['aptitude_0_2', 'النمو المعرفي', 'cognitive_3', 'هل يبحث عن الأشياء المخفية؟', '6-12 شهر'],
    ['aptitude_0_2', 'النمو المعرفي', 'cognitive_4', 'هل يتعرف على الأشياء والأشخاص؟', '12-18 شهر'],
    ['aptitude_0_2', 'النمو المعرفي', 'cognitive_5', 'هل يحل مشاكل بسيطة؟', '18-24 شهر'],
  ].map(([testId, category, id, text, age]) => ({
    id,
    testId,
    testName: 'اختبار القدرات',
    category,
    text,
    age,
    answerType: 'نعم/لا',
  })),
  ...[
    ['skills_test', 's1', 'هل يمسك الطفل الأشياء الصغيرة بين الإبهام والسبابة؟', '—'],
    ['skills_test', 's2', 'هل يحاول تقليد حركات اليدين (تصفيق، تلويح)؟', '—'],
    ['skills_test', 's3', 'هل يتبع نظرةك إلى جسم متحرك؟', '—'],
    ['skills_test', 's4', 'هل ينتج أصواتاً متنوعة غير البكاء؟', '—'],
    ['skills_test', 's5', 'هل يستجيب لاسمه أو صوتك القريب؟', '—'],
    ['skills_test', 's6', 'هل يجلس بثبات لبضع ثوانٍ دون دعم؟', '—'],
  ].map(([testId, id, text, age]) => ({
    id,
    testId,
    testName: 'اختبار المهارات',
    category: 'مهارات',
    text,
    age,
    answerType: 'نعم/لا',
  })),
  ...[
    ['interests_test', 'i1', 'هل يهتم بالألوان والأضواء المتحركة؟', '—'],
    ['interests_test', 'i2', 'هل يستمتع بالأصوات الإيقاعية أو الموسيقى الهادئة؟', '—'],
    ['interests_test', 'i3', 'هل يفضّل اللعب بالماء أو الرمل؟', '—'],
    ['interests_test', 'i4', 'هل يتابع وجهك أثناء القراءة أو الغناء؟', '—'],
    ['interests_test', 'i5', 'هل يبدي فرحاً عند رؤية حيوانات أو صور طبيعة؟', '—'],
    ['interests_test', 'i6', 'هل يحب التفاعل مع أطفال آخرين أو مرآة؟', '—'],
  ].map(([testId, id, text, age]) => ({
    id,
    testId,
    testName: 'فحص الميول',
    category: 'ميول',
    text,
    age,
    answerType: 'نعم/لا',
  })),
  ...[
    ['child_tests', 'c1', 'هل يبتسم طفلك استجابة لوجهك أو صوتك؟', '—'],
    ['child_tests', 'c2', 'هل يحاول الدحرجة أو الزحف للأمام؟', '—'],
    ['child_tests', 'c3', 'هل يميّز بين صوتك وصوت غريب؟', '—'],
    ['child_tests', 'c4', 'هل يمسك لعبة ويهزّها أو يضعها في فمه بفضول؟', '—'],
    ['child_tests', 'c5', 'هل يظهر قلقاً عند غيابك لفترة قصيرة؟', '—'],
    ['child_tests', 'c6', 'هل ينام نوماً منتظماً نسبياً ليلاً؟', '—'],
  ].map(([testId, id, text, age]) => ({
    id,
    testId,
    testName: 'اختبارات الطفل',
    category: 'نمو',
    text,
    age,
    answerType: 'نعم/لا',
  })),
];

export const assessmentResults = [
  {
    id: 'r1',
    child: 'يوسف',
    test: 'اختبار القدرات',
    testId: 'aptitude_0_2',
    yesCount: 14,
    noCount: 6,
    completionPct: 100,
    recommendation: 'استمري في الأنشطة الحسية — ناقشي مع الطبيب أي «لا» متكررة لنفس المحور.',
  },
  {
    id: 'r2',
    child: 'ليان',
    test: 'اختبار المهارات',
    testId: 'skills_test',
    yesCount: 4,
    noCount: 2,
    completionPct: 100,
    recommendation: 'شجّعي التقليد الحركي واللعب أمام المرآة (mock).',
  },
  {
    id: 'r3',
    child: 'مريم',
    test: 'فحص الميول',
    testId: 'interests_test',
    yesCount: 5,
    noCount: 1,
    completionPct: 100,
    recommendation: 'يفضّل المحتوى البصري — ركّزي على التحفيز البصري في المنهج.',
  },
  {
    id: 'r4',
    child: 'آدم',
    test: 'اختبارات الطفل',
    testId: 'child_tests',
    yesCount: 3,
    noCount: 3,
    completionPct: 100,
    recommendation: 'متابعة نوم واستجابة اجتماعية — ليست تشخيصاً طبياً.',
  },
  {
    id: 'r5',
    child: 'يوسف',
    test: 'اختبار المهارات',
    testId: 'skills_test',
    yesCount: 2,
    noCount: 0,
    completionPct: 33,
    recommendation: 'غير مكتمل — ذكّري ولي الأمر بإكمال التقييم من التطبيق.',
  },
];

export const assessmentRecommendations = [
  {
    id: 'rec1',
    basedOn: 'اختبار القدرات — يوسف',
    text: 'زيادة جلسات التحفيز البصري والعاطفي حسب العمر (UI فقط).',
    priority: 'متوسطة',
  },
  {
    id: 'rec2',
    basedOn: 'فحص الميول — مريم',
    text: 'اقتراح محتوى موسيقى هادئة من المكتبة — mood: مريح.',
    priority: 'منخفضة',
  },
  {
    id: 'rec3',
    basedOn: 'اختبارات الطفل — آدم',
    text: 'متابعة مع طبيب الأطفال عند تكرار «لا» في النوم والاستجابة.',
    priority: 'عالية',
  },
];

export const supportTickets = [
  {
    id: 101,
    title: 'تأخر تحميل الفيديو في المكتبة',
    type: 'شكوى',
    user: 'أمينة محمد',
    date: '2026-05-20',
    priority: 'عالية',
    boardStatus: 'جديد',
    body: 'عند فتح موسيقى هادئة يتوقف التحميل عند 30%. جهاز Samsung A52.',
    childMock: { name: 'يوسف', age: '9-12 شهر' },
    adminReply: null,
  },
  {
    id: 102,
    title: 'إضافة محتوى نوم في المكتبة',
    type: 'اقتراح',
    user: 'سارة أحمد',
    date: '2026-05-19',
    priority: 'متوسطة',
    boardStatus: 'قيد المراجعة',
    body: 'اقترح إضافة تهويدات عربية طويلة أكثر من 10 دقائق.',
    childMock: { name: 'ليان', age: '3-6 شهور' },
    adminReply: null,
  },
  {
    id: 103,
    title: 'صوت الدرس لا يعمل',
    type: 'شكوى',
    user: 'نورا خالد',
    date: '2026-05-18',
    priority: 'عالية',
    boardStatus: 'تم الرد',
    body: 'درس الحساب اليوم 12 بدون صوت رغم رفع الصوت.',
    childMock: { name: 'آدم', age: '0-3 شهور' },
    adminReply: 'شكراً لتواصلك — جرّبي إعادة تشغيل التطبيق. نتابع مع الفريق التقني (mock).',
  },
  {
    id: 104,
    title: 'وضع ليلي للواجهة',
    type: 'اقتراح',
    user: 'هند علي',
    date: '2026-05-17',
    priority: 'منخفضة',
    boardStatus: 'تم الرد',
    body: 'وضع داكن مريح للعيون أثناء الرضاعة ليلاً.',
    childMock: { name: 'مريم', age: '12-18 شهر' },
    adminReply: 'مقترح ممتاز — مُسجّل للنسخة القادمة (mock).',
  },
  {
    id: 105,
    title: 'خطأ عند فتح القرآن',
    type: 'شكوى',
    user: 'فاطمة حسن',
    date: '2026-05-15',
    priority: 'متوسطة',
    boardStatus: 'مغلق',
    body: 'التطبيق يغلق عند الجلسة الثالثة — تم الحل بعد التحديث.',
    childMock: { name: 'زين', age: '6-12 شهر' },
    adminReply: 'تم الإغلاق بعد تأكيد التحديث 1.0.0.',
  },
  {
    id: 106,
    title: 'تذكير بجلسة القرآن',
    type: 'اقتراح',
    user: 'أمينة محمد',
    date: '2026-05-14',
    priority: 'متوسطة',
    boardStatus: 'جديد',
    body: 'إشعار لطيف قبل وقت الجلسة اليومية.',
    childMock: { name: 'يوسف', age: '9-12 شهر' },
    adminReply: null,
  },
];

export const supportTicketColumns = ['جديد', 'قيد المراجعة', 'تم الرد', 'مغلق'];

export const consultationRequests = [
  {
    id: 'c1',
    type: 'استشارات سلوكية',
    user: 'سارة أحمد',
    topic: 'نوم متقطع — 4 أشهر',
    status: 'قيد المراجعة',
    date: '2026-05-21',
    paid: false,
  },
  {
    id: 'c2',
    type: 'استشارات مدفوعة',
    user: 'أمينة محمد',
    topic: 'سلوك عدواني خفيف عند الفطام',
    status: 'مجدولة',
    date: '2026-05-22',
    paid: true,
  },
  {
    id: 'c3',
    type: 'استشارات سلوكية',
    user: 'نورا خالد',
    topic: 'رفض الطعام',
    status: 'مكتملة',
    date: '2026-05-10',
    paid: false,
  },
];

export const mothersClubPosts = [
  {
    id: 'p1',
    author: 'سارة أحمد',
    tag: '#الختمة_الأولى',
    title: 'كيف بدأتم تعليم أطفالكم السور القصيرة؟',
    likes: 24,
    comments: 12,
    status: 'منشور',
  },
  {
    id: 'p2',
    author: 'ليلى محمد',
    tag: '#تغذية_الطفل',
    title: 'وجبات خفيفة وصحية للمدرسة',
    likes: 45,
    comments: 8,
    status: 'يحتاج مراجعة',
  },
  {
    id: 'p3',
    author: 'أمينة محمد',
    tag: '#نوم_الرضيع',
    title: 'روتين نوم نجح معنا',
    likes: 18,
    comments: 5,
    status: 'منشور',
  },
  {
    id: 'p4',
    author: 'مستخدمة محذوفة',
    tag: '#إعلان',
    title: 'محتوى ترويجي — مخفي',
    likes: 0,
    comments: 0,
    status: 'مخفي',
  },
];

export const communityFaqItems = [
  {
    question: 'كيف أبدأ رحلة القرآن مع طفلي؟',
    answer:
      'من تبويب الدروس اختاري «القرآن»، ثم اتبعي خطة الختمة اليومية. التكرار القصير يومياً أفضل من جلسة طويلة نادرة.',
  },
  {
    question: 'هل يمكن تغيير عمر الطفل بعد التسجيل؟',
    answer: 'نعم — من إعدادات الحساب (قريباً) أو تواصلي مع الدعم.',
  },
  {
    question: 'ماذا أفعل إذا لم يعمل الصوت في الدرس؟',
    answer: 'تأكدي من الصوت وإعادة التشغيل. إن استمرت المشكلة أرسلي شكوى.',
  },
  {
    question: 'هل التطبيق مجاني بالكامل؟',
    answer: 'أجزاء أساسية مجانية. بعض المحتوى المتقدم قد يتطلب اشتراكاً.',
  },
  {
    question: 'كيف أحفظ تقدّم طفلي؟',
    answer: 'التقدّم يُحفظ تلقائياً على جهازك عند إكمال الجولات.',
  },
];

export const supportTopics = [
  {
    category: 'حل المشاكل',
    title: 'الصوت لا يعمل في الدرس',
    body: 'تأكدي من مستوى الصوت، أعيدي تشغيل الدرس، أغلقي التطبيقات الأخرى.',
  },
  {
    category: 'حل المشاكل',
    title: 'التطبيق بطيء أو يتوقف',
    body: 'حدّثي التطبيق، وفّري مساحة، أعيدي تشغيل الهاتف.',
  },
  {
    category: 'حل المشاكل',
    title: 'نسيت كلمة المرور',
    body: 'من تسجيل الدخول «نسيت كلمة المرور» (قريباً) أو الشكاوى.',
  },
  {
    category: 'حل المشاكل',
    title: 'المحتوى لا يناسب عمر طفلي',
    body: 'راجعي عمر الطفل في الإعدادات.',
  },
];

export const commonChildProblems = [
  {
    title: 'صعوبة النوم',
    body: 'روتين ثابت، إضاءة خافتة. استشيري الطبيب إذا استمر الأرق.',
  },
  {
    title: 'رفض الطعام',
    body: 'وجبات صغيرة دون إجبار. استشيري اختصاص تغذية عند فقدان الوزن.',
  },
  {
    title: 'بكاء متكرر',
    body: 'تحققي من الجوع والتعب. استشيري الطبيب عند حمى أو استمرار غير مبرر.',
  },
  {
    title: 'خجل من الغرباء',
    body: 'طبيعي — لا تجبري التفاعل.',
  },
  {
    title: 'إدمان الشاشة',
    body: 'حدّدي وقتاً قصيراً مع إشراف. بدّلي بأنشطة حسية.',
  },
];

/** @deprecated use supportTickets */
export const tickets = supportTickets.map((t) => ({
  id: t.id,
  user: t.user,
  type: t.type,
  subject: t.title,
  status: t.boardStatus,
  date: t.date,
}));

export const targetingContentTypes = [
  'درس',
  'شريحة',
  'صوت',
  'فيديو',
  'نشاط',
  'تمرين',
  'مقال',
  'اختبار',
  'سؤال',
  'إشعار',
];

export const targetingAudiences = [
  'كل المستخدمين',
  '0-3 أشهر',
  '3-6 أشهر',
  '6-12 شهر',
  '1-1.5 سنة',
  '1.5-2 سنة',
  'حسب الباقة',
  'حسب اللغة',
  'حسب تقدم الطفل',
  'حسب إكمال اختبار',
];

export const targetingPlacements = [
  'الرئيسية',
  'الدروس',
  'القرآن',
  'الحساب',
  'التحفيز البصري',
  'الذكاء العاطفي',
  'المكتبة',
  'الأنشطة',
  'الرياضة',
  'التقييمات',
  'المجتمع',
  'الدعم',
  'onboarding',
];

export const targetingConditionOptions = [
  { id: 'always', label: 'دائم' },
  { id: 'dateRange', label: 'تاريخ بداية ونهاية' },
  { id: 'afterLesson', label: 'بعد إكمال درس' },
  { id: 'afterTest', label: 'بعد إكمال اختبار' },
  { id: 'curriculumDay', label: 'يوم منهج معين' },
  { id: 'once', label: 'مرة واحدة' },
  { id: 'subscribersOnly', label: 'للمشتركين فقط' },
];

export const targetingExamples = [
  {
    id: 'ex_video_exercise',
    label: 'فيديو تمرين 4-6 أشهر',
    contentType: 'فيديو',
    audience: '4-6 أشهر',
    placement: 'الرياضة',
    conditions: ['دائم', 'للمشتركين فقط'],
    publishStatus: 'منشور',
  },
  {
    id: 'ex_math_slide',
    label: 'شريحة حساب — درس 5',
    contentType: 'شريحة',
    audience: 'حسب تقدم الطفل',
    placement: 'الحساب',
    conditions: ['يوم منهج معين', 'بعد إكمال درس'],
    publishStatus: 'منشور',
  },
  {
    id: 'ex_article_mothers',
    label: 'مقال للأمهات',
    contentType: 'مقال',
    audience: 'كل المستخدمين',
    placement: 'المجتمع',
    conditions: ['دائم'],
    publishStatus: 'مسودة',
  },
  {
    id: 'ex_quran_notif',
    label: 'إشعار تذكير بالقرآن',
    contentType: 'إشعار',
    audience: 'حسب الباقة',
    placement: 'القرآن',
    conditions: ['مرة واحدة', 'للمشتركين فقط'],
    publishStatus: 'منشور',
  },
];

export const targetingRules = [
  {
    id: 'r1',
    content: 'فيديو — تمرين 4-6 (قائمة YouTube)',
    audience: '4-6 أشهر',
    placement: 'الرياضة > MediaAgeHub',
    condition: 'دائم + فضية+',
    status: 'منشور',
  },
  {
    id: 'r2',
    content: 'شريحة حساب — درس 5 يوم 56',
    audience: 'تقدم منهج الحساب',
    placement: 'الحساب > جلسة اليوم',
    condition: 'يوم منهج 56',
    status: 'منشور',
  },
  {
    id: 'r3',
    content: 'مقال — نادي الأمهات',
    audience: 'كل الأمهات',
    placement: 'المجتمع > نادي الأمهات',
    condition: 'دائم',
    status: 'مسودة',
  },
  {
    id: 'r4',
    content: 'إشعار — تذكير ختمة',
    audience: 'ذهبية / فضية',
    placement: 'القرآن + إشعار push',
    condition: 'مرة واحدة / يومياً mock',
    status: 'منشور',
  },
  {
    id: 'r5',
    content: 'درس بصري — درس 12',
    audience: '6-12 شهر',
    placement: 'التحفيز البصري',
    condition: 'بعد إكمال اختبار الميول',
    status: 'منشور',
  },
];

export const cmsSections = [
  { id: 'curriculum', label: 'ما هو المنهج' },
  { id: 'howToTeach', label: 'كيف أدرس طفلي' },
  { id: 'parentingCulture', label: 'ثقافة ولي الأمر' },
  { id: 'healthCulture', label: 'الثقافة الصحية' },
  { id: 'communityRules', label: 'قوانين المجتمع' },
  { id: 'supportMessages', label: 'رسائل الدعم' },
  { id: 'subscription', label: 'نصوص الاشتراك' },
];

export const cmsContentItems = [
  {
    id: 'cms_curriculum_about',
    sectionId: 'curriculum',
    title: '🌸 ما هو المنهج ؟ ( اهدافه و اساليبه)',
    subtitle: 'منهج بيانور — الرئيسية',
    body: 'منهجنا هو جمع لعدة مناهج عالمية ومنهج دقيق بحسب المرحلة العمرية... مركز على بناء ابنتك\\ابنك بناء إسلامي بعقيدة سنية صحيحة.',
    tags: ['منهج', 'أهداف'],
    targetAudience: 'كل الأمهات',
    placement: 'الرئيسية > ما هو المنهج',
    contentType: 'مقال',
    language: 'ar',
    lastModified: '2026-05-01',
    status: 'منشور',
    showsWhen: 'فتح شاشة curriculum_about_screen',
  },
  {
    id: 'cms_how_teach',
    sectionId: 'howToTeach',
    title: '🌸 كيف ادررس طفلي ؟',
    subtitle: 'إرشادات التكرار اليومي',
    body: 'أولاً: اختيار من يشرف على تعليمه. ثانياً: الدراسة بالآيباد إن وجد. ثالثاً: تكرار الدروس حسب العمر...',
    tags: ['تعليم', 'تكرار'],
    targetAudience: 'ولي الأمر',
    placement: 'الرئيسية > how_to_teach_screen',
    contentType: 'دليل',
    language: 'ar',
    lastModified: '2026-05-10',
    status: 'منشور',
    showsWhen: 'قائمة الدروس — بطاقة كيف أدرّس',
  },
  {
    id: 'cms_social_rules',
    sectionId: 'parentingCulture',
    title: 'القواعد الاجتماعية',
    subtitle: 'ثقافة هامة للأمهات / ولي الأمر',
    body: 'قواعد الكلام والتواصل، المسافة واللمس، الاحترام والذوق، المكان والزمان...',
    tags: ['ثقافة', 'مجتمع'],
    targetAudience: 'الأمهات',
    placement: 'parenting_article_screen — social_rules',
    contentType: 'مقال',
    language: 'ar',
    lastModified: '2026-04-28',
    status: 'منشور',
    showsWhen: 'ثقافة ولي الأمر من القائمة',
  },
  {
    id: 'cms_teach_emotional',
    sectionId: 'healthCulture',
    title: 'تعليم طفلي بالممارسة العملية الفعالة',
    subtitle: '0-2 سنة — الذكاء الاجتماعي والعاطفي',
    body: 'من 0-2 سنة مخ الطفل يتعلم بالعلاقة، اللمس، الصوت، التكرار. الأمان العاطفي = أساس كل شيء...',
    tags: ['صحة', 'عاطفي'],
    targetAudience: '0-2 سنة',
    placement: 'parenting_article — teach_emotional_0_2',
    contentType: 'مقال',
    language: 'ar',
    lastModified: '2026-05-15',
    status: 'يحتاج مراجعة',
    showsWhen: 'الثقافة الصحية',
  },
  {
    id: 'cms_discover_aptitudes',
    sectionId: 'healthCulture',
    title: 'اكتشاف قدرات وميول طفلي',
    subtitle: '0-2 سنة',
    body: 'ملاحظة الميول المبكرة وتوجيه الطفل — من parenting_articles_how_to_teach (mock).',
    tags: ['قدرات', 'ميول'],
    targetAudience: '0-2 سنة',
    placement: 'parenting_article — discover_aptitudes',
    contentType: 'مقال',
    language: 'ar',
    lastModified: '2026-05-12',
    status: 'مسودة',
    showsWhen: 'الثقافة الصحية',
  },
  {
    id: 'cms_family_rules_1',
    sectionId: 'communityRules',
    title: 'قواعد المجتمع — الأخلاق',
    subtitle: 'family_rules_screen',
    body: 'التحلي بالأخلاق واحترام الجميع... من يخالف سيصله تنبيه أول.',
    tags: ['قوانين'],
    targetAudience: 'أعضاء المجتمع',
    placement: '/rules — FamilyRulesScreen',
    contentType: 'قاعدة',
    language: 'ar',
    lastModified: '2026-03-20',
    status: 'منشور',
    showsWhen: 'قبل/onboarding المجتمع',
  },
  {
    id: 'cms_support_audio',
    sectionId: 'supportMessages',
    title: 'الصوت لا يعمل في الدرس',
    subtitle: 'support_topics — حل المشاكل',
    body: '1) تأكدي من مستوى الصوت. 2) أعيدي تشغيل الدرس. 3) قسم الشكاوى.',
    tags: ['دعم'],
    targetAudience: 'كل المستخدمين',
    placement: 'الدعم > support_topics_screen',
    contentType: 'رسالة مساعدة',
    language: 'ar',
    lastModified: '2026-05-18',
    status: 'منشور',
    showsWhen: 'قسم حل المشاكل',
  },
  {
    id: 'cms_sub_gold',
    sectionId: 'subscription',
    title: 'باقة ذهبية — وصف',
    subtitle: 'subscription_screen',
    body: 'منهج تعليمي متخصص لمرحلة طفلك العمرية بدقة — من subscription_plan_model (mock).',
    tags: ['اشتراك', 'ذهبية'],
    targetAudience: 'قبل الشراء',
    placement: 'subscription_screen — بطاقة الباقة',
    contentType: 'نص تسويقي',
    language: 'ar',
    lastModified: '2026-05-22',
    status: 'منشور',
    showsWhen: 'شاشة الاشتراك',
  },
  {
    id: 'cms_sub_trial',
    sectionId: 'subscription',
    title: 'تجربة مجانية — تنبيه',
    subtitle: 'subscription_screen',
    body: 'ابدأي التجربة المجانية — UI فقط، لا دفع حقيقي في النسخة الحالية.',
    tags: ['تجربة'],
    targetAudience: 'مستخدمون جدد',
    placement: 'subscription_screen — أعلى الشاشة',
    contentType: 'نص',
    language: 'ar',
    lastModified: '2026-05-22',
    status: 'مسودة',
    showsWhen: 'أول فتح بعد التسجيل',
  },
];

export const assetManagerSummary = {
  images: { count: 0, label: 'صور', note: 'assets/images — .gitkeep فقط' },
  audio: { count: 491, label: 'أصوات', note: 'شرائح m4a في المناهج (تقدير)' },
  videos: { count: 0, label: 'فيديوهات', note: 'onboarding — غير مرفوعة' },
  manifests: { count: 4, label: 'ملفات manifest', note: 'math + visual + emotional + quran' },
  missing: { count: 6120, label: 'ملفات ناقصة', note: '6000 mp3 قرآن + onboarding' },
};

export const assetSections = [
  { id: 'appImages', label: 'صور التطبيق' },
  { id: 'curriculum', label: 'ملفات المناهج' },
  { id: 'slideAudio', label: 'أصوات الشرائح' },
  { id: 'onboardingVideos', label: 'فيديوهات onboarding' },
  { id: 'quranAudio', label: 'صوت القرآن' },
  { id: 'uploads', label: 'ملفات مرفوعة (mock)' },
];

export const assetFiles = [
  {
    id: 'a1',
    sectionId: 'appImages',
    name: 'byanour-baby.png',
    type: 'صورة',
    path: 'assets/images/byanour-baby.png',
    size: '—',
    linkedTo: 'أيقونة التطبيق / splash',
    status: 'ناقص',
    previewKind: 'image',
  },
  {
    id: 'a2',
    sectionId: 'curriculum',
    name: 'math/manifest.json',
    type: 'manifest',
    path: 'assets/math/manifest.json',
    size: '~2.1 MB',
    linkedTo: 'منهج الحساب — 22 حزمة',
    status: 'موجود',
    previewKind: 'file',
  },
  {
    id: 'a3',
    sectionId: 'curriculum',
    name: 'visual/manifest.json',
    type: 'manifest',
    path: 'assets/visual/manifest.json',
    size: '~1.8 MB',
    linkedTo: 'التحفيز البصري — 18 حزمة / 292 شريحة',
    status: 'موجود',
    previewKind: 'file',
  },
  {
    id: 'a4',
    sectionId: 'curriculum',
    name: 'emotional/manifest.json',
    type: 'manifest',
    path: 'assets/emotional/manifest.json',
    size: '~1.2 MB',
    linkedTo: 'الذكاء العاطفي — 32 حزمة / 162 شريحة',
    status: 'موجود',
    previewKind: 'file',
  },
  {
    id: 'a5',
    sectionId: 'curriculum',
    name: 'q_129_132/slide_001.png',
    type: 'شريحة PNG',
    path: 'assets/math/packages/q_129_132/slides/slide_001.png',
    size: 'mock 120 KB',
    linkedTo: 'حساب — شريحة عالمية 1',
    status: 'موجود',
    previewKind: 'image',
  },
  {
    id: 'a6',
    sectionId: 'slideAudio',
    name: 'slide_001.m4a',
    type: 'صوت m4a',
    path: 'assets/math/packages/q_129_132/audio/slide_001.m4a',
    size: 'mock 45 KB',
    linkedTo: 'حساب — درس 1',
    status: 'موجود',
    previewKind: 'audio',
  },
  {
    id: 'a7',
    sectionId: 'slideAudio',
    name: 'visual_src_01/slide_001',
    type: 'صوت m4a',
    path: 'assets/visual/packages/visual_src_01/slide_001/audio.m4a',
    size: 'mock 38 KB',
    linkedTo: 'بصري — درس 1',
    status: 'موجود',
    previewKind: 'audio',
  },
  {
    id: 'a8',
    sectionId: 'onboardingVideos',
    name: 'onboarding_1.mp4',
    type: 'فيديو',
    path: 'assets/videos/onboarding_1.mp4',
    size: '—',
    linkedTo: 'onboarding_videos_screen',
    status: 'ناقص',
    previewKind: 'video',
  },
  {
    id: 'a9',
    sectionId: 'onboardingVideos',
    name: 'onboarding_2.mp4',
    type: 'فيديو',
    path: 'assets/videos/onboarding_2.mp4',
    size: '—',
    linkedTo: 'onboarding_videos_screen',
    status: 'ناقص',
    previewKind: 'video',
  },
  {
    id: 'a10',
    sectionId: 'quranAudio',
    name: 'half_hizb_manifest.json',
    type: 'manifest',
    path: 'assets/audio/quran/ahmed_khader/half_hizb/half_hizb_manifest.json',
    size: 'mock 180 KB',
    linkedTo: 'قائمة 120 جلسة/ختمة',
    status: 'موجود',
    previewKind: 'file',
  },
  {
    id: 'a11',
    sectionId: 'quranAudio',
    name: 'session_001.mp3',
    type: 'صوت mp3',
    path: 'assets/audio/quran/ahmed_khader/half_hizb/session_001.mp3',
    size: '—',
    linkedTo: 'قرآن — جلسة 1 ختمة 1',
    status: 'ناقص',
    previewKind: 'audio',
  },
  {
    id: 'a12',
    sectionId: 'curriculum',
    name: 'beads_numeric (orphan check)',
    type: 'حزمة',
    path: 'assets/math/packages/beads_numeric/',
    size: '37 شرائح',
    linkedTo: 'تسلسل الحساب الأساسي',
    status: 'موجود',
    previewKind: 'image',
  },
  {
    id: 'a13',
    sectionId: 'curriculum',
    name: 'lesson_01_10 (archive)',
    type: 'حزمة أرشيف',
    path: 'assets/math/packages/lesson_01_10/',
    size: '5 شرائح',
    linkedTo: 'غير مستخدم في التسلسل الأساسي',
    status: 'غير مستخدم',
    previewKind: 'file',
  },
];

export const notificationOverview = {
  scheduled: 3,
  sent: 12,
  openRate: '34%',
  lessonReminders: 5,
};

export const notificationTypes = ['تذكير', 'محتوى جديد', 'اشتراك', 'دعم', 'مجتمع'];

export const notificationTemplates = [
  {
    id: 'tpl_quran',
    label: 'تذكير جلسة قرآن',
    title: 'حان وقت جلسة القرآن 🌙',
    body: 'يوسف لم يكمل جلستيه اليوم — 5 دقائق تكفي لختمة جميلة.',
    type: 'تذكير',
    audience: 'أولياء أطفال نشطون — مسار قرآن',
    deepLink: 'bayanour://quran/journey',
    sendAt: '18:00 اليوم',
  },
  {
    id: 'tpl_math',
    label: 'إكمال درس الحساب',
    title: 'درس الحساب في انتظاركم',
    body: 'اليوم 12 في منهج الحساب — 5 جولات قصيرة فقط.',
    type: 'تذكير',
    audience: 'أطفال 6-12 شهر — يوم منهج 12',
    deepLink: 'bayanour://math/lesson',
    sendAt: '09:30 صباحاً',
  },
  {
    id: 'tpl_library',
    label: 'محتوى جديد في المكتبة',
    title: 'موسيقى هادئة جديدة 🎵',
    body: 'أضفنا قائمة «نجوم الليل» في المكتبة — جرّبيها قبل النوم.',
    type: 'محتوى جديد',
    audience: 'كل المشتركين',
    deepLink: 'bayanour://library/calm',
    sendAt: 'فوري',
  },
  {
    id: 'tpl_sub',
    label: 'قرب انتهاء الاشتراك',
    title: 'اشتراكك ينتهي خلال 3 أيام',
    body: 'جدّدي الباقة الذهبية لمواصلة المنهج كاملاً — UI فقط.',
    type: 'اشتراك',
    audience: 'باقة فضية — تنتهي قريباً',
    deepLink: 'bayanour://subscription',
    sendAt: '10:00 غداً',
  },
];

export const notificationCampaigns = [
  {
    id: 'n1',
    title: 'تذكير القرآن — مساء',
    audience: 'نشطون — قرآن',
    status: 'مجدول',
    date: '2026-05-23 18:00',
    openRate: '—',
  },
  {
    id: 'n2',
    title: 'درس جديد — الحساب',
    audience: '6-12 شهر',
    status: 'مُرسل',
    date: '2026-05-20 09:00',
    openRate: '41%',
  },
  {
    id: 'n3',
    title: 'محتوى المكتبة — هادئ',
    audience: 'كل المشتركين',
    status: 'مُرسل',
    date: '2026-05-18 20:00',
    openRate: '28%',
  },
  {
    id: 'n4',
    title: 'تذكير الاشتراك',
    audience: 'تجربة منتهية',
    status: 'مجدول',
    date: '2026-05-25 10:00',
    openRate: '—',
  },
  {
    id: 'n5',
    title: 'رد على شكوى — دعم',
    audience: 'أمينة محمد',
    status: 'مُرسل',
    date: '2026-05-19 14:30',
    openRate: '62%',
  },
  {
    id: 'n6',
    title: 'منشور نادي الأمهات',
    audience: 'المجتمع',
    status: 'مسودة',
    date: '—',
    openRate: '—',
  },
];

export const reportsKpis = {
  dau: '412',
  avgSessions: '3.2',
  lessonCompletionPct: '61%',
  topAge: '6-12 شهر',
  topCurriculum: 'القرآن',
};

export const reportsWeeklySessions = [
  { label: 'السبت', val: 340 },
  { label: 'الأحد', val: 410 },
  { label: 'الإثنين', val: 420 },
  { label: 'الثلاثاء', val: 510 },
  { label: 'الأربعاء', val: 480 },
  { label: 'الخميس', val: 620 },
  { label: 'الجمعة', val: 390 },
];

export const reportsTrends = [
  { label: 'DAU', value: '+8%', tone: 'up' },
  { label: 'جلسات', value: '+12%', tone: 'up' },
  { label: 'اشتراكات جديدة', value: '-3%', tone: 'down' },
  { label: 'شكاوى', value: '+2', tone: 'neutral' },
];

export const reportsCurriculumPerformance = [
  { name: 'القرآن', sessions: 1240, completion: 72, color: 'var(--track-quran)' },
  { name: 'الحساب', sessions: 980, completion: 58, color: 'var(--track-math)' },
  { name: 'البصري', sessions: 720, completion: 64, color: 'var(--track-visual)' },
  { name: 'العاطفي', sessions: 540, completion: 51, color: 'var(--track-emotional)' },
];

export const reportsSubscriptionPerformance = [
  { plan: 'ذهبية', active: 210, churn: 4, revenueMock: '—' },
  { plan: 'فضية', active: 280, churn: 12, revenueMock: '—' },
  { plan: 'برونزية', active: 95, churn: 8, revenueMock: '—' },
  { plan: 'تجربة', active: 57, churn: 22, revenueMock: '—' },
];

export const reportsTopContent = [
  { title: 'جلسة قرآن — ختمة 1', views: 890, track: 'قرآن' },
  { title: 'درس حساب — يوم 12', views: 720, track: 'حساب' },
  { title: 'موسيقى نوم هادئة', views: 610, track: 'مكتبة' },
  { title: 'تمرين 4-6 أشهر', views: 480, track: 'رياضة' },
  { title: 'درس بصري — 8', views: 410, track: 'بصري' },
];

export const reportsTopYoutube = [
  { title: 'قطرات المطر', videoId: 'eKFTSSKCzWA', opens: 320 },
  { title: 'موسيقى نوم هادئة', videoId: 'XXIRWAEVs8o', opens: 280 },
  { title: 'تمرين 4-6 (قائمة)', playlistId: 'PLFYChdcFDqm1OvmAgkeCIrZ-Rzevai8km', opens: 190 },
  { title: 'لعب إبداعي', playlistId: 'PLFYChdcFDqm1WqBec1DNB2VIOLRD_Mdgs', opens: 165 },
];

export const reportsTopComplaints = [
  { subject: 'تأخر تحميل الفيديو', count: 14 },
  { subject: 'صوت الدرس لا يعمل', count: 11 },
  { subject: 'خطأ YouTube embed', count: 8 },
  { subject: 'تغيير عمر الطفل', count: 5 },
];

export const settingsSections = [
  { id: 'general', label: 'إعدادات التطبيق العامة' },
  { id: 'languages', label: 'اللغات' },
  { id: 'roles', label: 'الصلاحيات' },
  { id: 'publish', label: 'حالات النشر' },
  { id: 'integrations', label: 'التكاملات المستقبلية' },
  { id: 'version', label: 'معلومات النسخة' },
];

export const settingsLanguages = [
  { code: 'ar', name: 'العربية', enabled: true, default: true },
  { code: 'en', name: 'English', enabled: true, default: false },
  { code: 'fr', name: 'Français', enabled: false, default: false },
  { code: 'de', name: 'Deutsch', enabled: false, default: false },
  { code: 'es', name: 'Español', enabled: false, default: false },
  { code: 'tr', name: 'Türkçe', enabled: false, default: false },
  { code: 'ur', name: 'Urdu', enabled: false, default: false },
  { code: 'id', name: 'Indonesia', enabled: false, default: false },
];

export const settingsRoles = [
  'Super Admin',
  'Content Manager',
  'Support Agent',
  'Curriculum Reviewer',
  'Finance',
];

export const settingsPermissions = ['مشاهدة', 'تعديل', 'نشر', 'حذف', 'مراجعة'];

export const settingsPermissionMatrix = {
  'Super Admin': { مشاهدة: true, تعديل: true, نشر: true, حذف: true, مراجعة: true },
  'Content Manager': { مشاهدة: true, تعديل: true, نشر: true, حذف: false, مراجعة: true },
  'Support Agent': { مشاهدة: true, تعديل: true, نشر: false, حذف: false, مراجعة: false },
  'Curriculum Reviewer': { مشاهدة: true, تعديل: true, نشر: false, حذف: false, مراجعة: true },
  Finance: { مشاهدة: true, تعديل: false, نشر: false, حذف: false, مراجعة: false },
};

export const settingsPublishStates = [
  { id: 'draft', label: 'مسودة', desc: 'غير مرئي للمستخدمين' },
  { id: 'review', label: 'يحتاج مراجعة', desc: 'بانتظار Curriculum Reviewer' },
  { id: 'published', label: 'منشور', desc: 'يظهر حسب توجيه المحتوى' },
  { id: 'archived', label: 'مؤرشف', desc: 'مخفي مع الإبقاء على السجل' },
];

export const settingsIntegrations = [
  { id: 'firebase', name: 'Firebase / Supabase', status: 'غير متصل — UI فقط' },
  { id: 'payment', name: 'Payment (Apple / Google / Visa)', status: 'غير متصل — UI فقط' },
  { id: 'push', name: 'Push notifications', status: 'غير متصل — UI فقط' },
  { id: 'analytics', name: 'Analytics', status: 'غير متصل — UI فقط' },
];

export const settingsAppInfo = {
  appName: 'بيانور',
  version: '1.0.0+1',
  build: 'bayanour_admin_ui mock',
  flutterSdk: '3.x',
};

export const publishFilterChips = [
  { id: 'all', label: 'الكل' },
  { id: 'published', label: 'منشور' },
  { id: 'draft', label: 'مسودة' },
  { id: 'review', label: 'يحتاج مراجعة' },
  { id: 'missing_assets', label: 'ناقص ملفات' },
];

export function getItemPublishStatus(item) {
  if (item.publishStatus) return item.publishStatus;
  if (item.categoryId === 'review') return 'review';
  if (item.linkStatus === 'معطّل (mock)') return 'missing_assets';
  if (item.linkStatus === 'يحتاج مراجعة') return 'review';
  return 'published';
}

export function matchesPublishChip(item, chipId) {
  if (chipId === 'all') return true;
  return getItemPublishStatus(item) === chipId;
}

export function buildGlobalSearchResults(query, limit = 10) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];
  const add = (entry) => {
    if (results.length >= limit) return;
    results.push(entry);
  };

  children.forEach((c) => {
    const hay = `${c.name} ${c.parent} ${c.curriculumStatus}`.toLowerCase();
    if (hay.includes(q)) {
      add({
        id: `child-${c.id}`,
        type: 'child',
        typeLabel: 'طفل',
        title: c.name,
        subtitle: c.parent,
        path: '/users',
      });
    }
  });

  mathLessons.forEach((l) => {
    const title = `درس حساب ${l.lesson}`;
    if (title.toLowerCase().includes(q) || String(l.lesson).includes(q)) {
      add({
        id: `lesson-${l.id}`,
        type: 'lesson',
        typeLabel: 'درس',
        title,
        subtitle: l.globalRange,
        path: '/math',
      });
    }
  });

  supportTickets.forEach((t) => {
    const hay = `${t.title} ${t.user} ${t.type}`.toLowerCase();
    if (hay.includes(q)) {
      add({
        id: `ticket-${t.id}`,
        type: 'complaint',
        typeLabel: 'شكوى',
        title: t.title,
        subtitle: t.user,
        path: '/community',
      });
    }
  });

  libraryMediaItems.forEach((item) => {
    const hay = `${item.title} ${item.categoryTitle} ${item.moodTag}`.toLowerCase();
    if (hay.includes(q)) {
      add({
        id: `lib-${item.id}`,
        type: 'content',
        typeLabel: 'محتوى',
        title: item.title,
        subtitle: item.categoryTitle,
        path: '/library',
      });
    }
  });

  users.forEach((u) => {
    const hay = `${u.name} ${u.email}`.toLowerCase();
    if (hay.includes(q)) {
      add({
        id: `user-${u.id}`,
        type: 'content',
        typeLabel: 'مستخدم',
        title: u.name,
        subtitle: u.email,
        path: '/users',
      });
    }
  });

  return results;
}

export const contentStudioStats = [
  { label: 'مسودات', value: '24', tone: 'muted' },
  { label: 'منشور', value: '156', tone: 'success' },
  { label: 'يحتاج مراجعة', value: '18', tone: 'warning' },
  { label: 'ناقص ملفات', value: '31', tone: 'error' },
];

/** icon names map to lucide in ContentStudioPage */
export const contentStudioTypes = [
  {
    id: 'article',
    label: 'مقال / نص ثابت',
    description: 'نص ثابت: المنهج، ثقافة، إرشادات، قوانين، اشتراك — محرر مخصص.',
    needsFiles: false,
    filesHint: 'محرر نصوص — بدون ملفات إلزامية',
    icon: 'FileText',
    editorPath: '/content-studio/article',
  },
  {
    id: 'lesson',
    label: 'درس',
    description: 'درس في مسار الحساب / البصري / العاطفي — منشئ شرائح.',
    needsFiles: true,
    filesHint: 'شرائح + صوت — منشئ LessonBuilder',
    icon: 'BookOpen',
    editorPath: '/content-studio/lesson',
  },
  {
    id: 'slide',
    label: 'شريحة',
    description: 'شريحة واحدة PNG + m4a — محرر SlideEditor.',
    needsFiles: true,
    filesHint: 'SlideEditor — صورة + صوت',
    icon: 'Layers',
    editorPath: '/content-studio/slide',
  },
  {
    id: 'image',
    label: 'صورة',
    description: 'PNG/JPG — غلاف، شريحة، CMS، أصول manifest.',
    needsFiles: true,
    filesHint: 'ImageContentEditor — alt + asset path',
    icon: 'Image',
    editorPath: '/content-studio/image',
  },
  {
    id: 'video',
    label: 'فيديو',
    description: 'فيديو YouTube للمكتبة أو الأنشطة.',
    needsFiles: true,
    filesHint: 'videoId — LibraryContentEditor',
    icon: 'Video',
    editorPath: '/content-studio/library',
  },
  {
    id: 'playlist',
    label: 'Playlist',
    description: 'قائمة YouTube للمكتبة — تهويدات أو مجموعات.',
    needsFiles: true,
    filesHint: 'playlistId — LibraryContentEditor',
    icon: 'ListVideo',
    editorPath: '/content-studio/library?type=playlist',
  },
  {
    id: 'audio',
    label: 'صوت',
    description: 'ملف صوتي لجلسة قرآن أو شريحة.',
    needsFiles: true,
    filesHint: 'AudioContentEditor — mp3 / m4a',
    icon: 'Volume2',
    editorPath: '/content-studio/audio',
  },
  {
    id: 'activity',
    label: 'نشاط',
    description: 'نشطة تفاعلية حسب العمر.',
    needsFiles: true,
    filesHint: 'ActivityExerciseEditor — YouTube',
    icon: 'Sparkles',
    editorPath: '/content-studio/activity-exercise?type=activity',
  },
  {
    id: 'exercise',
    label: 'تمرين',
    description: 'تمرين رياضة/حركة من tamareen.',
    needsFiles: true,
    filesHint: 'ActivityExerciseEditor — YouTube',
    icon: 'Dumbbell',
    editorPath: '/content-studio/activity-exercise?type=exercise',
  },
  {
    id: 'test',
    label: 'اختبار',
    description: 'اختبار مهارات أو ميول كامل.',
    needsFiles: false,
    filesHint: 'AssessmentBuilder — أسئلة',
    icon: 'ClipboardList',
    editorPath: '/content-studio/assessment',
  },
  {
    id: 'question',
    label: 'سؤال',
    description: 'سؤال واحد داخل اختبار.',
    needsFiles: false,
    filesHint: 'QuestionEditor — داخل AssessmentBuilder',
    icon: 'HelpCircle',
    editorPath: '/content-studio/assessment?mode=question',
  },
  {
    id: 'notification',
    label: 'إشعار',
    description: 'رسالة push مجدولة للأمهات.',
    needsFiles: false,
    filesHint: 'NotificationContentEditor',
    icon: 'Bell',
    editorPath: '/content-studio/notification',
  },
  {
    id: 'quran_session',
    label: 'جلسة قرآن',
    description: 'جلسة ضمن ختمة — نصف حزب.',
    needsFiles: true,
    filesHint: 'mp3 + نطاق آيات',
    icon: 'ScrollText',
    editorPath: '/content-studio/quran-session',
  },
];

export const contentWizardLanguages = [
  { id: 'ar', label: 'العربية' },
  { id: 'en', label: 'English' },
];

export const contentWizardPlans = [
  'بدون اشتراك',
  'شهرية',
  'برونزية',
  'فضية',
  'ذهبية',
];

export const contentWizardDetailedPlacements = [
  'الرئيسية → بطاقة محتوى مميز',
  'المكتبة → فيديوهات التغذية',
  'الرياضة → tamareen / MediaAgeHub',
  'القرآن → جلسة اليوم',
  'الحساب → مسار الدرس',
  'الأنشطة → حسب العمر',
  'onboarding → شاشة ترحيب',
];

/** BabyAgeRange — onboarding في Flutter */
export const onboardingAgeGroups = [
  { id: 'age0to3', label: '0-3 شهور', minMonths: 0, maxMonths: 3 },
  { id: 'age3to6', label: '3-6 شهور', minMonths: 3, maxMonths: 6 },
  { id: 'age6to12', label: '6-12 شهر', minMonths: 6, maxMonths: 12 },
  { id: 'age1to1_5', label: '1-1.5 سنة', minMonths: 12, maxMonths: 18 },
  { id: 'age1_5to2', label: '1.5-2 سنة', minMonths: 18, maxMonths: 24 },
];

/** activityAgeGroups / exerciseAgeGroups — tamareen & MediaAgeHub */
export const mediaAgeGroups = [
  { id: 'age_0_3', label: '0-3 أشهر', minMonths: 0, maxMonths: 3 },
  { id: 'age_4_6', label: '4-6 أشهر', minMonths: 4, maxMonths: 6 },
  { id: 'age_6_9', label: '6-9 أشهر', minMonths: 6, maxMonths: 9 },
  { id: 'age_9_12', label: '9-12 شهر', minMonths: 9, maxMonths: 12 },
  { id: 'age_12_18', label: '12-18 شهر', minMonths: 12, maxMonths: 18 },
  { id: 'age_18_24', label: '18-24 شهر', minMonths: 18, maxMonths: 24 },
  { id: 'age_9_36', label: '9-36 شهر', minMonths: 9, maxMonths: 36 },
];

export const alerts = [
  'فيديوهات onboarding غير مضافة في assets',
  'صوت القرآن: manifest موجود لكن ملفات mp3 غير مرفوعة',
  '27 عنصر محتوى بانتظار المراجعة',
];
