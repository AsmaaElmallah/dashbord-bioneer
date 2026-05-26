import { curriculumLessonDaySpan } from './curriculumJourneyAdmin';

/** من how_to_teach_content — تكرار الدروس باليوم حسب عمر الطفل */
export const LESSON_AGE_PHASES = [
  { id: '0-2m', label: '0 – شهرين', minMonths: 0, maxMonths: 2, dailyRepeats: 2 },
  { id: '2-3m', label: '2 – 3 أشهر', minMonths: 2, maxMonths: 3, dailyRepeats: 3 },
  { id: '4-5m', label: '4 – 5 أشهر', minMonths: 4, maxMonths: 5, dailyRepeats: 4 },
  { id: '5-6m', label: '5 – 6 أشهر', minMonths: 5, maxMonths: 6, dailyRepeats: 5 },
  { id: '6m-2y', label: '6 أشهر – سنتين', minMonths: 6, maxMonths: 24, dailyRepeats: 5 },
];

export const PROGRAM_TOTAL_DAYS = 730;

export function monthsFromCurriculumDay(curriculumDay) {
  const d = Math.max(1, Math.min(PROGRAM_TOTAL_DAYS, curriculumDay));
  return ((d - 1) / (PROGRAM_TOTAL_DAYS / 24));
}

export function getAgePhaseForCurriculumDay(curriculumDay) {
  const months = monthsFromCurriculumDay(curriculumDay);
  return (
    LESSON_AGE_PHASES.find((p) => months >= p.minMonths && months < p.maxMonths) ??
    LESSON_AGE_PHASES[LESSON_AGE_PHASES.length - 1]
  );
}

export function getDailyRepeatsForCurriculumDay(curriculumDay) {
  return getAgePhaseForCurriculumDay(curriculumDay).dailyRepeats;
}

/** منطق math_curriculum_schedule.dart */
export function mathLessonNumberForDay(day) {
  const d = day < 1 ? 1 : day;
  if (d <= 25) return 1;
  if (d <= 42) return 2;
  if (d <= 50) return 3;
  if (d <= 55) return 4;
  if (d <= 160) return 5 + Math.floor((d - 56) / 5);
  return 1 + (Math.floor((d - 161) / 5) % 25);
}

/** visual / emotional — curriculum_shared_schedule.dart */
export function genericLessonNumberForDay(day, lastNewContentDay, maxLessonNumber, reviewCycleStartDay) {
  const d = day < 1 ? 1 : day;
  if (d <= 25) return 1;
  if (d <= 42) return 2;
  if (d <= 50) return 3;
  if (d <= 55) return 4;
  if (d <= lastNewContentDay) {
    return Math.min(maxLessonNumber, Math.max(5, 5 + Math.floor((d - 56) / 5)));
  }
  return 1 + (Math.floor((d - reviewCycleStartDay) / 5) % maxLessonNumber);
}

export function createProgramHelpers(trackConfig) {
  const { lastNewContentDay, reviewCycleStartDay, maxLessonNumber, lessonNumberForDay } =
    trackConfig.program;

  return {
    lessonNumberForDay: (day) => lessonNumberForDay(day),
    isNewContentDay: (day) => day >= 1 && day < reviewCycleStartDay,
    isReviewDay: (day) => day >= reviewCycleStartDay,
    activeLessonOnDay: (day) => lessonNumberForDay(day),
  };
}

export function getLessonProgramSpan(lessonNumber, trackConfig) {
  return curriculumLessonDaySpan(lessonNumber, trackConfig.maxLessonNumber);
}

export function getLessonDailyRepeatLabel(lessonNumber, trackConfig, lessonMeta) {
  if (lessonMeta?.dailyRepeat) return lessonMeta.dailyRepeat;
  const span = getLessonProgramSpan(lessonNumber, trackConfig);
  const midDay = Math.floor((span.startDay + span.endDay) / 2);
  return `${getDailyRepeatsForCurriculumDay(midDay)}×/يوم`;
}

export function getLessonAgePhaseLabel(lessonNumber, trackConfig) {
  const span = getLessonProgramSpan(lessonNumber, trackConfig);
  const midDay = Math.floor((span.startDay + span.endDay) / 2);
  return getAgePhaseForCurriculumDay(midDay).label;
}

export function lessonParticipatesInNewContent(lessonNumber, trackConfig) {
  const span = getLessonProgramSpan(lessonNumber, trackConfig);
  return span.startDay < trackConfig.program.reviewCycleStartDay;
}

export function filterLessonsByProgramPhase(lessons, programPhase, trackConfig) {
  if (programPhase === 'all') return lessons;
  if (programPhase === 'new') {
    return lessons.filter((l) => lessonParticipatesInNewContent(l.lesson, trackConfig));
  }
  if (programPhase === 'review') {
    return lessons;
  }
  return lessons;
}

export function getProgramPhaseLabel(phase, trackConfig) {
  const p = trackConfig.program;
  if (phase === 'new') {
    return `محتوى جديد — أيام 1–${p.lastNewContentDay}`;
  }
  if (phase === 'review') {
    return `مراجعة — من يوم ${p.reviewCycleStartDay} حتى ${p.totalDays}`;
  }
  return `برنامج سنتين — ${p.totalDays} يوم`;
}

export function filterLessonsByAgeGroup(lessons, ageGroupId, trackConfig) {
  if (ageGroupId === 'all') return lessons;
  const target = LESSON_AGE_PHASES.find((p) => p.id === ageGroupId);
  if (!target) return lessons;
  return lessons.filter((l) => {
    const span = getLessonProgramSpan(l.lesson, trackConfig);
    const mid = Math.floor((span.startDay + span.endDay) / 2);
    const months = monthsFromCurriculumDay(mid);
    return months >= target.minMonths && months < target.maxMonths;
  });
}

export function getCurriculumGlobalDayForLessonDay(lessonNumber, dayIndexInLesson, trackConfig) {
  const span = getLessonProgramSpan(lessonNumber, trackConfig);
  return span.startDay + dayIndexInLesson - 1;
}
