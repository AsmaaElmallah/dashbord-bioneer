import {
  contentWizardPlans,
  exerciseAgeGroups,
  exerciseMediaItems,
  mediaAgeGroups,
} from './mockData';

export const activityExerciseTypes = [
  { id: 'activity', label: 'نشاط' },
  { id: 'exercise', label: 'تمرين' },
];

export const editorAgeGroups = mediaAgeGroups.map((g) => ({
  id: g.id,
  label: g.label,
}));

export const activityExercisePublishOptions = ['مسودة', 'منشور', 'يحتاج مراجعة'];

export function getSectionLabel(itemType) {
  return itemType === 'activity' ? 'الأنشطة' : 'الرياضة';
}

export function getAgeGroupLabel(ageGroupId) {
  return editorAgeGroups.find((g) => g.id === ageGroupId)?.label ?? ageGroupId;
}

export function createEmptyActivityExercise(overrides = {}) {
  return {
    itemType: 'activity',
    title: '',
    description: '',
    ageGroupId: 'age_4_6',
    videoId: '',
    playlistId: '',
    moodTag: '',
    parentNote: '',
    safetyInstructions: '',
    requiresSupervision: true,
    requiredPlan: 'فضية',
    publishStatus: 'مسودة',
    ...overrides,
  };
}

export function getActivityExerciseValidation(item) {
  const issues = [];
  const hasVideo = Boolean(item.videoId?.trim());
  const hasPlaylist = Boolean(item.playlistId?.trim());

  if (!hasVideo && !hasPlaylist) {
    issues.push({
      id: 'noYoutubeId',
      message: 'يجب إدخال videoId أو playlistId على الأقل.',
      severity: 'error',
    });
  }

  if (hasVideo && hasPlaylist) {
    issues.push({
      id: 'bothIds',
      message: 'تم إدخال videoId و playlistId — عادةً يُستخدم أحدهما في MediaAgeHub.',
      severity: 'info',
    });
  }

  if (!item.title?.trim()) {
    issues.push({
      id: 'noTitle',
      message: 'العنوان مطلوب.',
      severity: 'warning',
    });
  }

  return issues;
}

/** مثال: تمرين 4-6 أشهر — من exercises_catalog mock */
export function getExercise46MonthsMock() {
  const group = exerciseAgeGroups.find((g) => g.id === 'age_4_6');
  const sample =
    exerciseMediaItems.find((i) => i.ageGroupId === 'age_4_6' && i.videoId === 'puUzPozUdP0') ??
    exerciseMediaItems.find((i) => i.ageGroupId === 'age_4_6');

  return createEmptyActivityExercise({
    itemType: 'exercise',
    title: 'تمرين 4-6 أشهر — تنشيط مبكر',
    description: 'فيديو تمرين قصير من tamareen — تنشيط وحركة مبكرة للرضيع.',
    ageGroupId: 'age_4_6',
    videoId: sample?.videoId ?? 'puUzPozUdP0',
    playlistId: '',
    moodTag: sample?.moodTag ?? 'تمرين',
    parentNote: group?.parentNote ?? 'تمارين قصيرة مع إشراف ولي الأمر.',
    safetyInstructions: 'لا تُترك الطفلة وحدها — تأكدي من سطح آمن ومريح.',
    requiresSupervision: true,
    requiredPlan: 'فضية',
    publishStatus: 'مسودة',
  });
}

export { contentWizardPlans as activityExercisePlanOptions };
