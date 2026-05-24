export const bulkImportTypes = [
  {
    id: 'pptx_slides',
    label: 'PPTX شرائح',
    description: 'استيراد شرائح من PowerPoint إلى مسار درس.',
    accept: '.pptx',
    acceptLabel: 'PPTX',
    mockFileName: 'math_lesson_12_slides.pptx',
    hasTemplate: false,
  },
  {
    id: 'images_audio',
    label: 'صور + صوت',
    description: 'حزمة PNG + m4a/mp3 لشرائح المناهج.',
    accept: '.zip,.png,.mp3,.m4a',
    acceptLabel: 'ZIP / PNG / MP3',
    mockFileName: 'visual_pkg_q129_assets.zip',
    hasTemplate: false,
  },
  {
    id: 'csv_questions',
    label: 'CSV أسئلة',
    description: 'أسئلة تقييم — محور، عمر، نوع إجابة.',
    accept: '.csv',
    acceptLabel: 'CSV',
    mockFileName: 'assessment_questions_batch.csv',
    hasTemplate: true,
  },
  {
    id: 'csv_youtube',
    label: 'CSV مكتبة YouTube',
    description: 'روابط فيديو/playlist للمكتبة دفعة واحدة.',
    accept: '.csv',
    acceptLabel: 'CSV',
    mockFileName: 'library_youtube_links.csv',
    hasTemplate: true,
  },
  {
    id: 'quran_mp3',
    label: 'Quran mp3 sessions',
    description: 'جلسات قرآن — mp3 + metadata يوم/ختمة.',
    accept: '.zip,.mp3',
    acceptLabel: 'ZIP / MP3',
    mockFileName: 'quran_sessions_day1-30.zip',
    hasTemplate: false,
  },
  {
    id: 'manifest_json',
    label: 'manifest JSON',
    description: 'manifest منهج — packages · slides · assets.',
    accept: '.json',
    acceptLabel: 'JSON',
    mockFileName: 'curriculum_math_manifest.json',
    hasTemplate: false,
  },
];

export const bulkImportMessages = {
  scan: 'فحص الملف (mock) — تمت محاكاة قراءة الملف محلياً',
  import: 'استيراد كمسودات (mock) — تمت إضافة العناصر لقائمة المراجعة',
  downloadTemplate: 'تحميل قالب CSV (mock) — لم يُنزَّل ملف فعلي',
  pickFile: 'اختيار ملف (mock) — لم يُرفع ولم يُحفظ',
};

const scanPresets = {
  pptx_slides: {
    columns: ['slide_index', 'title', 'notes', 'image_hint'],
    rowCount: 18,
    validCount: 16,
    reviewCount: 2,
    sampleRows: [
      { slide_index: '1', title: 'عدّ خرزات', notes: 'تعليمات الأم', image_hint: 'slide_01.png' },
      { slide_index: '2', title: 'مقارنة كميات', notes: '—', image_hint: 'slide_02.png' },
    ],
    issues: [
      { row: 7, field: 'image_hint', problem: 'لا يوجد PNG مطابق في الحزمة', suggestion: 'أضف slide_07.png أو عدّل الاسم' },
      { row: 15, field: 'notes', problem: 'حقل notes فارغ', suggestion: 'أضف تعليمات الأم أو ضع —' },
    ],
  },
  images_audio: {
    columns: ['asset_id', 'type', 'filename', 'duration_sec'],
    rowCount: 42,
    validCount: 39,
    reviewCount: 3,
    sampleRows: [
      { asset_id: 'g237', type: 'png', filename: 'g237.png', duration_sec: '—' },
      { asset_id: 'g237', type: 'm4a', filename: 'g237.m4a', duration_sec: '12' },
    ],
    issues: [
      { row: 11, field: 'filename', problem: 'g241.png مفقود', suggestion: 'ارفع الملف أو احذف السطر' },
      { row: 28, field: 'duration_sec', problem: 'مدة صوت غير محددة', suggestion: 'أضف duration أو استخدم ffprobe لاحقاً' },
      { row: 33, field: 'asset_id', problem: 'asset_id مكرر', suggestion: 'دمج أو إعادة تسمية g255' },
    ],
  },
  csv_questions: {
    columns: ['question_text', 'axis', 'age_group', 'answer_type', 'options', 'weight'],
    rowCount: 48,
    validCount: 44,
    reviewCount: 4,
    sampleRows: [
      {
        question_text: 'هل يقف مع دعم؟',
        axis: 'النمو البدني',
        age_group: '6-12 شهر',
        answer_type: 'yes_no',
        options: '—',
        weight: '1',
      },
      {
        question_text: 'هل يتبع نظرةك؟',
        axis: 'الإدراك',
        age_group: '4-6 أشهر',
        answer_type: 'scale',
        options: '1,2,3',
        weight: '1',
      },
    ],
    issues: [
      { row: 12, field: 'age_group', problem: 'قيمة عمر غير معروفة: 13-18 شهر', suggestion: 'استخدم 9-36 شهر أو 6-12 شهر' },
      { row: 23, field: 'options', problem: 'answer_type=choice لكن options فارغ', suggestion: 'أضف خيارات مفصولة بفاصلة' },
      { row: 31, field: 'question_text', problem: 'نص السؤال أقل من 5 أحرف', suggestion: 'وسّع صياغة السؤال' },
      { row: 47, field: 'axis', problem: 'محور فارغ', suggestion: 'اختر محوراً من قائمة التقييمات' },
    ],
  },
  csv_youtube: {
    columns: ['title', 'video_id', 'category', 'target_age', 'mood_tag', 'publish_status'],
    rowCount: 86,
    validCount: 80,
    reviewCount: 6,
    sampleRows: [
      {
        title: 'تهويدة هادئة',
        video_id: 'abc123xyz',
        category: 'lullabies',
        target_age: '0-6 أشهر',
        mood_tag: 'sleep',
        publish_status: 'مسودة',
      },
      {
        title: 'أصوات مطر',
        video_id: 'rain4k01',
        category: 'nature',
        target_age: 'all',
        mood_tag: 'calm',
        publish_status: 'منشور',
      },
    ],
    issues: [
      { row: 5, field: 'video_id', problem: 'videoId فارغ', suggestion: 'انسخ معرف YouTube من الرابط' },
      { row: 19, field: 'category', problem: 'فئة غير معروفة: kids_songs', suggestion: 'استخدم lullabies | nature | calm_music' },
      { row: 44, field: 'video_id', problem: 'videoId قصير جداً', suggestion: 'تحقق من صحة المعرف' },
      { row: 52, field: 'target_age', problem: 'عمر غير محدد', suggestion: '0-6 أشهر · 6-12 شهر · all' },
      { row: 61, field: 'title', problem: 'عنوان مكرر', suggestion: 'غيّر العنوان أو دمج الصف' },
      { row: 78, field: 'publish_status', problem: 'حالة غير صالحة: live', suggestion: 'مسودة | منشور | يحتاج مراجعة' },
    ],
  },
  quran_mp3: {
    columns: ['day', 'session_title', 'mp3_file', 'duration_min', 'surah_range'],
    rowCount: 120,
    validCount: 118,
    reviewCount: 2,
    sampleRows: [
      { day: '1', session_title: 'جلسة 1 — الفاتحة', mp3_file: 'day01.mp3', duration_min: '5', surah_range: '1' },
      { day: '2', session_title: 'جلسة 2 — البقرة 1-5', mp3_file: 'day02.mp3', duration_min: '6', surah_range: '2:1-5' },
    ],
    issues: [
      { row: 45, field: 'mp3_file', problem: 'day45.mp3 غير موجود في ZIP', suggestion: 'أضف الملف أو صحّح الاسم' },
      { row: 99, field: 'duration_min', problem: 'مدة غير رقمية', suggestion: 'استخدم دقائق صحيحة مثل 5 أو 6.5' },
    ],
  },
  manifest_json: {
    columns: ['package_id', 'track', 'slide_count', 'assets_path', 'version'],
    rowCount: 24,
    validCount: 22,
    reviewCount: 2,
    sampleRows: [
      {
        package_id: 'q_129_132',
        track: 'math',
        slide_count: '5',
        assets_path: '/assets/math/q_129_132',
        version: '1.2',
      },
      {
        package_id: 'emo_wk08',
        track: 'emotional',
        slide_count: '4',
        assets_path: '/assets/emotional/emo_wk08',
        version: '1.0',
      },
    ],
    issues: [
      { row: 8, field: 'assets_path', problem: 'مسار assets غير موجود', suggestion: 'صحّح المسار أو أنشئ مجلد assets' },
      { row: 17, field: 'slide_count', problem: 'slide_count = 0', suggestion: 'تحقق من package أو احذفه' },
    ],
  },
};

export function getBulkImportType(typeId) {
  return bulkImportTypes.find((t) => t.id === typeId) ?? bulkImportTypes[0];
}

export function createMockBulkFile(typeId) {
  const type = getBulkImportType(typeId);
  return {
    name: type.mockFileName,
    sizeMock: type.id.includes('csv') ? '24 KB' : type.id === 'pptx_slides' ? '4.2 MB' : '18 MB',
  };
}

export function getMockScanResult(typeId) {
  const preset = scanPresets[typeId] ?? scanPresets.csv_questions;
  const type = getBulkImportType(typeId);
  return {
    typeId,
    typeLabel: type.label,
    fileName: type.mockFileName,
  ...preset,
  };
}

export function getCsvTemplateColumns(typeId) {
  if (typeId === 'csv_questions') {
    return 'question_text,axis,age_group,answer_type,options,weight';
  }
  if (typeId === 'csv_youtube') {
    return 'title,video_id,category,target_age,mood_tag,publish_status';
  }
  return '';
}
