import {
  notificationTemplates,
  notificationTypes,
  onboardingAgeGroups,
  targetingConditionOptions,
  targetingPlacements,
  contentWizardPlans,
} from './mockData';

export const notificationRecurrenceOptions = [
  { id: 'once', label: 'مرة واحدة' },
  { id: 'daily', label: 'يومي' },
  { id: 'weekly', label: 'أسبوعي' },
];

export const notificationPublishOptions = ['مسودة', 'مجدول', 'منشور'];

export const notificationTargetAgeOptions = [
  { id: 'all', label: 'كل الأعمار' },
  ...onboardingAgeGroups.map((g) => ({ id: g.id, label: g.label })),
  { id: 'by_progress', label: 'حسب تقدم الطفل' },
];

export const notificationSendConditions = targetingConditionOptions.map((c) => c.label);

export function createEmptyNotification(overrides = {}) {
  return {
    title: '',
    body: '',
    type: notificationTypes[0],
    audience: 'كل المستخدمين',
    deepLink: 'bayanour://home',
    sendAt: '',
    recurrence: 'once',
    publishStatus: 'مسودة',
    targetAgeId: 'all',
    requiredPlan: 'فضية',
    linkedSection: 'القرآن',
    sendCondition: 'دائم',
    ...overrides,
  };
}

export function getTargetAgeLabel(targetAgeId) {
  return notificationTargetAgeOptions.find((a) => a.id === targetAgeId)?.label ?? targetAgeId;
}

export function buildTargetSummary(notification) {
  return {
    age: getTargetAgeLabel(notification.targetAgeId),
    plan: notification.requiredPlan,
    section: notification.linkedSection,
    condition: notification.sendCondition,
  };
}

export function getRecurrenceLabel(recurrenceId) {
  return notificationRecurrenceOptions.find((r) => r.id === recurrenceId)?.label ?? recurrenceId;
}

/** مثال: تذكير جلسة قرآن — من notificationTemplates tpl_quran */
export function getQuranSessionReminderMock() {
  const tpl = notificationTemplates.find((t) => t.id === 'tpl_quran');

  return createEmptyNotification({
    title: tpl?.title ?? 'حان وقت جلسة القرآن 🌙',
    body: tpl?.body ?? 'يوسف لم يكمل جلستيه اليوم — 5 دقائق تكفي لختمة جميلة.',
    type: tpl?.type ?? 'تذكير',
    audience: tpl?.audience ?? 'أولياء أطفال نشطون — مسار قرآن',
    deepLink: tpl?.deepLink ?? 'bayanour://quran/journey',
    sendAt: '2026-05-23T18:00',
    recurrence: 'daily',
    publishStatus: 'مسودة',
    targetAgeId: 'all',
    requiredPlan: 'فضية',
    linkedSection: 'القرآن',
    sendCondition: 'للمشتركين فقط',
  });
}

export { contentWizardPlans as notificationPlanOptions, notificationTypes };
