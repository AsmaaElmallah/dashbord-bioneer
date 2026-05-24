import { mediaAgeGroups, onboardingAgeGroups } from '../data/mockData';

export const AGE_TARGET_MODES = [
  { id: 'single', label: 'فئة واحدة' },
  { id: 'multiple', label: 'عدة فئات' },
  { id: 'all', label: 'كل الأعمار' },
  { id: 'custom', label: 'نطاق مخصص' },
];

export function createEmptyAgeTargeting(overrides = {}) {
  return {
    mode: 'single',
    onboardingSelected: ['age0to3'],
    mediaSelected: [],
    customFromMonths: 0,
    customToMonths: 24,
    ...overrides,
  };
}

function resolveSelectedGroups(value) {
  const onboarding = onboardingAgeGroups.filter((g) => value.onboardingSelected.includes(g.id));
  const media = mediaAgeGroups.filter((g) => value.mediaSelected.includes(g.id));
  return [...onboarding, ...media];
}

export function buildAgePreview(value) {
  if (value.mode === 'all') {
    return 'سيظهر هذا المحتوى للأطفال من جميع الأعمار (0–36+ شهر)';
  }

  if (value.mode === 'custom') {
    return `سيظهر هذا المحتوى للأطفال من ${value.customFromMonths} إلى ${value.customToMonths} شهر`;
  }

  const selected = resolveSelectedGroups(value);
  if (!selected.length) {
    return 'حدّد فئة عمرية لرؤية المعاينة';
  }

  const min = Math.min(...selected.map((g) => g.minMonths));
  const max = Math.max(...selected.map((g) => g.maxMonths));
  const labels = selected.map((g) => g.label).join('، ');

  if (value.mode === 'single') {
    return `سيظهر هذا المحتوى للأطفال في فئة: ${labels} (تقريباً ${min}–${max} شهر)`;
  }

  return `سيظهر هذا المحتوى للأطفال من ${min} إلى ${max} شهر — الفئات: ${labels}`;
}

export function getAgeTargetingWarnings(value, { contentType, section } = {}) {
  const warnings = [];

  if (value.mode === 'custom' && value.customFromMonths > value.customToMonths) {
    warnings.push({
      id: 'invalidRange',
      message: 'نطاق غير منطقي: العمر «من» أكبر من العمر «إلى». صحّح النطاق قبل المتابعة.',
    });
  }

  const isSportsContent =
    contentType === 'تمرين' ||
    contentType === 'نشاط' ||
    section === 'الرياضة' ||
    section === 'الأنشطة';

  if (!isSportsContent) return warnings;

  const hasExplicitAge =
    value.mode === 'all' ||
    (value.mode === 'custom' && value.customFromMonths <= value.customToMonths) ||
    (value.mode === 'single' &&
      (value.onboardingSelected.length > 0 || value.mediaSelected.length > 0)) ||
    (value.mode === 'multiple' &&
      (value.onboardingSelected.length > 0 || value.mediaSelected.length > 0));

  if (!hasExplicitAge) {
    warnings.push({
      id: 'sportsNoAge',
      message:
        'محتوى رياضة/نشاط بدون تحديد عمر — اختر فئة من مصفوفة الأنشطة والرياضة (مثل 4–6 أشهر).',
    });
  } else if (
    isSportsContent &&
    value.mediaSelected.length === 0 &&
    value.onboardingSelected.length > 0 &&
    value.mode !== 'all' &&
    value.mode !== 'custom'
  ) {
    warnings.push({
      id: 'sportsOnboardingOnly',
      message:
        'تنبيه: محتوى الرياضة يستخدم عادةً الفئات التفصيلية (4–6 أشهر…) وليس فئات onboarding فقط.',
    });
  }

  return warnings;
}

export function ageTargetingShortLabel(value) {
  if (value.mode === 'all') return 'كل الأعمار';
  if (value.mode === 'custom') {
    return `${value.customFromMonths}–${value.customToMonths} شهر`;
  }
  const selected = resolveSelectedGroups(value);
  if (!selected.length) return '—';
  if (value.mode === 'single') return selected[0].label;
  return selected.map((g) => g.label).join(' + ');
}
