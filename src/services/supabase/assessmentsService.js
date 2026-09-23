import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const TESTS = 'assessments';
const QUESTIONS = 'assessment_questions';

const PUBLISH_TO_DB = {
  نشط: 'published',
  منشور: 'published',
  published: 'published',
  مسودة: 'draft',
  draft: 'draft',
  متوقف: 'archived',
  archived: 'archived',
};

const PUBLISH_FROM_DB = {
  published: 'نشط',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  archived: 'متوقف',
};

export function rowToTest(row, questionCount = 0) {
  return {
    id: row.id,
    name: row.title,
    description: row.kind ?? 'quiz',
    ageRange: '—',
    showsIn: 'تقييمنا',
    status: PUBLISH_FROM_DB[row.publish_status] ?? 'مسودة',
    questionCount,
  };
}

export function rowToQuestion(row) {
  const options = Array.isArray(row.options) ? row.options : [];
  return {
    id: row.id,
    testId: row.assessment_id,
    text: row.prompt,
    category: 'عام',
    age: '—',
    answerType: options.length === 2 ? 'نعم/لا' : 'اختيار',
    options,
    sortOrder: row.sort_order ?? 0,
  };
}

export async function loadAssessmentsState() {
  if (!isSupabaseEnabled) return { state: null, error: null, offline: true };

  const [testsRes, questionsRes] = await Promise.all([
    supabase.from(TESTS).select('*').order('id'),
    supabase.from(QUESTIONS).select('*').order('sort_order'),
  ]);

  const error = testsRes.error ?? questionsRes.error;
  if (error) return { state: null, error, offline: false };

  const questions = (questionsRes.data ?? []).map(rowToQuestion);
  const countByTest = {};
  questions.forEach((q) => {
    countByTest[q.testId] = (countByTest[q.testId] ?? 0) + 1;
  });

  const tests = (testsRes.data ?? []).map((row) =>
    rowToTest(row, countByTest[row.id] ?? 0),
  );

  return { state: { tests, questions }, error: null, offline: false };
}

export async function upsertAssessmentTest(test) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase.from(TESTS).upsert({
    id: test.id,
    title: test.name,
    kind: test.description || 'quiz',
    publish_status: PUBLISH_TO_DB[test.status] ?? 'draft',
  });
  return { error };
}

export async function upsertAssessmentQuestion(question) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const options =
    question.answerType === 'نعم/لا' ? ['نعم', 'لا'] : question.options ?? [];
  const { error } = await supabase.from(QUESTIONS).upsert({
    id: question.id,
    assessment_id: question.testId,
    prompt: question.text,
    options,
    sort_order: Number(question.sortOrder) || 0,
  });
  return { error };
}

export async function publishAssessment(id) {
  if (!isSupabaseEnabled) return { error: new Error('Supabase غير مفعّل') };
  const { error } = await supabase
    .from(TESTS)
    .update({ publish_status: 'published' })
    .eq('id', id);
  return { error };
}
