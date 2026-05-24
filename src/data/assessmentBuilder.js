import { assessmentQuestions } from './mockData';

export const assessmentAxes = [
  'النمو البدني',
  'النمو اللغوي',
  'النمو الاجتماعي',
  'النمو المعرفي',
  'مهارات',
  'ميول',
  'نمو',
];

export const assessmentAgeGroups = [
  { id: 'age_0_3', label: '0-3 شهور' },
  { id: 'age_4_6', label: '4-6 أشهر' },
  { id: 'age_6_9', label: '6-9 أشهر' },
  { id: 'age_6_12', label: '6-12 شهر' },
  { id: 'age_9_12', label: '9-12 شهر' },
  { id: 'age_12_18', label: '12-18 شهر' },
  { id: 'age_18_24', label: '18-24 شهر' },
];

export const assessmentAudienceOptions = [
  { id: 'mother', label: 'للأم' },
  { id: 'child', label: 'للطفل' },
];

export const questionAnswerTypes = [
  { id: 'yes_no', label: 'نعم/لا' },
  { id: 'single_choice', label: 'اختيار واحد' },
  { id: 'multi_choice', label: 'اختيار متعدد' },
  { id: 'short_text', label: 'نص قصير' },
];

export const assessmentPublishOptions = ['مسودة', 'منشور', 'يحتاج مراجعة'];

export function getAgeGroupLabel(ageGroupId) {
  return assessmentAgeGroups.find((g) => g.id === ageGroupId)?.label ?? ageGroupId;
}

export function getAnswerTypeLabel(answerType) {
  return questionAnswerTypes.find((t) => t.id === answerType)?.label ?? answerType;
}

export function createEmptyAssessment(overrides = {}) {
  return {
    name: '',
    description: '',
    ageGroupId: 'age_0_3',
    audience: 'mother',
    axes: ['النمو البدني'],
    publishStatus: 'مسودة',
    ...overrides,
  };
}

export function createEmptyQuestion(overrides = {}) {
  return {
    text: '',
    answerType: 'yes_no',
    ageGroupId: 'age_6_12',
    axis: 'النمو البدني',
    sortOrder: 1,
    recommendationOnYes: '',
    recommendationOnNo: '',
    required: true,
    choiceOptions: 'خيار ١\nخيار ٢\nخيار ٣',
    ...overrides,
  };
}

export function getQuestionValidation(question) {
  const issues = [];
  if (!question.text?.trim()) {
    issues.push({ id: 'noText', message: 'نص السؤال مطلوب.', severity: 'error' });
  }
  if (!question.axis?.trim()) {
    issues.push({ id: 'noAxis', message: 'المحور مطلوب.', severity: 'warning' });
  }
  return issues;
}

/** مثال: سؤال نعم/لا لعمر 6-12 شهر — من aptitude mock */
export function getYesNoQuestion612MonthsMock() {
  const sample =
    assessmentQuestions.find((q) => q.id === 'physical_4') ??
    assessmentQuestions.find((q) => q.age?.includes('12'));

  return {
    assessment: createEmptyAssessment({
      name: 'اختبار تقييم قدرات الطفل',
      description: '٤ محاور نمو — إجابات نعم/لا حسب العمر (٠–٢ سنة)',
      ageGroupId: 'age_6_12',
      audience: 'mother',
      axes: ['النمو البدني', 'النمو اللغوي', 'النمو الاجتماعي', 'النمو المعرفي'],
      publishStatus: 'مسودة',
    }),
    question: createEmptyQuestion({
      text: sample?.text ?? 'هل يقف مع دعم؟',
      answerType: 'yes_no',
      ageGroupId: 'age_6_12',
      axis: sample?.category ?? 'النمو البدني',
      sortOrder: 4,
      recommendationOnYes: 'ممتاز — استمري في تشجيع الوقوف بأمان مع دعم.',
      recommendationOnNo: 'طبيعي عند بعض الأطفال — ناقشي مع الطبيب إذا استمر (UI فقط — ليس تشخيصاً).',
      required: true,
    }),
  };
}
