import { assessmentQuestions, assessmentTests } from './mockData';

export function syncTestQuestionCounts(tests, questions) {
  return tests.map((t) => ({
    ...t,
    questionCount: questions.filter((q) => q.testId === t.id).length,
  }));
}

export function buildInitialAssessmentState() {
  const questions = assessmentQuestions.map((q) => ({ ...q }));
  const tests = syncTestQuestionCounts(
    assessmentTests.map((t) => ({ ...t })),
    questions,
  );
  return { tests, questions };
}

export function createAssessmentTest(tests, draft) {
  if (!draft.name?.trim()) return { error: 'اسم الاختبار مطلوب.' };
  const id = `test_${Date.now()}`;
  const test = {
    id,
    name: draft.name.trim(),
    description: draft.description?.trim() || '—',
    questionCount: 0,
    ageRange: draft.ageRange?.trim() || 'حسب عمر الطفل',
    showsIn: draft.showsIn?.trim() || 'تقييمنا',
    status: draft.status || 'نشط',
  };
  return { tests: [...tests, test], test };
}

export function updateAssessmentTest(tests, testId, patch) {
  return tests.map((t) => (t.id === testId ? { ...t, ...patch } : t));
}

export function deleteAssessmentTest(tests, questions, testId) {
  return {
    tests: tests.filter((t) => t.id !== testId),
    questions: questions.filter((q) => q.testId !== testId),
  };
}

export function createAssessmentQuestion(questions, tests, draft) {
  if (!draft.text?.trim()) return { error: 'نص السؤال مطلوب.' };
  const test = tests.find((t) => t.id === draft.testId);
  if (!test) return { error: 'اختر اختباراً.' };

  const id = `q_${draft.testId}_${Date.now()}`;
  const question = {
    id,
    testId: draft.testId,
    testName: test.name,
    category: draft.category?.trim() || 'عام',
    text: draft.text.trim(),
    age: draft.age?.trim() || '—',
    answerType: draft.answerType || 'نعم/لا',
  };
  return { question, questions: [...questions, question] };
}

export function updateAssessmentQuestion(questions, tests, questionId, patch) {
  const test = tests.find((t) => t.id === patch.testId);
  return questions.map((q) => {
    if (q.id !== questionId) return q;
    const next = { ...q, ...patch };
    if (test) next.testName = test.name;
    return next;
  });
}

export function deleteAssessmentQuestion(questions, questionId) {
  return questions.filter((q) => q.id !== questionId);
}
