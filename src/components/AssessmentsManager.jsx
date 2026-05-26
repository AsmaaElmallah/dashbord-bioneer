import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  buildInitialAssessmentState,
  createAssessmentQuestion,
  createAssessmentTest,
  deleteAssessmentQuestion,
  deleteAssessmentTest,
  syncTestQuestionCounts,
  updateAssessmentQuestion,
  updateAssessmentTest,
} from '../data/assessmentsContentAdmin';
import {
  ADMIN_STORAGE_KEYS,
  clearAdminState,
  loadAdminState,
  saveAdminState,
} from '../utils/adminLocalStorage';

const tabs = [
  ['tests', 'الاختبارات'],
  ['questions', 'الأسئلة'],
];

const emptyTestDraft = () => ({
  name: '',
  description: '',
  ageRange: '0–2 سنة',
  showsIn: 'تقييمنا',
  status: 'نشط',
});

const emptyQuestionDraft = (testId = 'aptitude_0_2') => ({
  testId,
  text: '',
  category: 'عام',
  age: '—',
  answerType: 'نعم/لا',
});

export function AssessmentsManager() {
  const { showMock } = useSnackbar();
  const [tab, setTab] = useState('questions');
  const [state, setState] = useState(() =>
    loadAdminState(ADMIN_STORAGE_KEYS.assessments, buildInitialAssessmentState),
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [filterTest, setFilterTest] = useState('all');
  const [showAddTest, setShowAddTest] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [testDraft, setTestDraft] = useState(emptyTestDraft);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestionDraft);
  const [editingTest, setEditingTest] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(false);

  useEffect(() => {
    saveAdminState(ADMIN_STORAGE_KEYS.assessments, state);
  }, [state]);

  const tests = state.tests;
  const questions = state.questions;

  const filteredQuestions = useMemo(() => {
    if (filterTest === 'all') return questions;
    return questions.filter((q) => q.testId === filterTest);
  }, [questions, filterTest]);

  const selectedQuestion =
    questions.find((q) => q.id === selectedQuestionId) ?? filteredQuestions[0] ?? null;
  const selectedTest = tests.find((t) => t.id === selectedTestId) ?? tests[0] ?? null;

  const handleAddTest = () => {
    const result = createAssessmentTest(tests, testDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }
    setState((prev) => ({
      ...prev,
      tests: syncTestQuestionCounts([...prev.tests, result.test], prev.questions),
    }));
    setShowAddTest(false);
    setTestDraft(emptyTestDraft());
    showMock('تمت إضافة الاختبار');
  };

  const handleDeleteTest = (testId) => {
    if (!window.confirm('حذف الاختبار وجميع أسئلته؟')) return;
    const next = deleteAssessmentTest(tests, questions, testId);
    setState({
      tests: syncTestQuestionCounts(next.tests, next.questions),
      questions: next.questions,
    });
    showMock('حذف اختبار');
  };

  const handleSaveTestEdit = () => {
    if (!selectedTest) return;
    const newName = testDraft.name.trim();
    setState((prev) => ({
      tests: updateAssessmentTest(prev.tests, selectedTest.id, {
        name: newName,
        description: testDraft.description.trim(),
        ageRange: testDraft.ageRange.trim(),
        showsIn: testDraft.showsIn.trim(),
        status: testDraft.status,
      }),
      questions: prev.questions.map((q) =>
        q.testId === selectedTest.id ? { ...q, testName: newName } : q,
      ),
    }));
    setEditingTest(false);
    showMock('تحديث الاختبار');
  };

  const handleAddQuestion = () => {
    const result = createAssessmentQuestion(questions, tests, questionDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }
    setState((prev) => ({
      tests: syncTestQuestionCounts(prev.tests, result.questions),
      questions: result.questions,
    }));
    setSelectedQuestionId(result.question.id);
    setShowAddQuestion(false);
    setQuestionDraft(emptyQuestionDraft(questionDraft.testId));
    showMock('إضافة سؤال');
  };

  const handleDeleteQuestion = (id) => {
    if (!window.confirm('حذف السؤال؟')) return;
    const nextQuestions = deleteAssessmentQuestion(questions, id);
    setState((prev) => ({
      tests: syncTestQuestionCounts(prev.tests, nextQuestions),
      questions: nextQuestions,
    }));
    if (selectedQuestionId === id) setSelectedQuestionId(null);
    showMock('حذف سؤال');
  };

  const handleSaveQuestionEdit = () => {
    if (!selectedQuestion) return;
    const nextQuestions = updateAssessmentQuestion(questions, tests, selectedQuestion.id, {
      testId: questionDraft.testId,
      text: questionDraft.text.trim(),
      category: questionDraft.category.trim(),
      age: questionDraft.age.trim(),
      answerType: questionDraft.answerType,
    });
    setState((prev) => ({
      tests: syncTestQuestionCounts(prev.tests, nextQuestions),
      questions: nextQuestions,
    }));
    setEditingQuestion(false);
    showMock('تحديث السؤال');
  };

  const startEditTest = (t) => {
    setSelectedTestId(t.id);
    setTestDraft({
      name: t.name,
      description: t.description,
      ageRange: t.ageRange,
      showsIn: t.showsIn,
      status: t.status,
    });
    setEditingTest(true);
    setTab('tests');
  };

  const startEditQuestion = (q) => {
    setSelectedQuestionId(q.id);
    setQuestionDraft({
      testId: q.testId,
      text: q.text,
      category: q.category,
      age: q.age,
      answerType: q.answerType,
    });
    setEditingQuestion(true);
  };

  const handleResetStorage = () => {
    if (!window.confirm('استرجاع البيانات الأصلية؟ سيتم فقدان التعديلات الحالية.')) return;
    clearAdminState(ADMIN_STORAGE_KEYS.assessments);
    setState(buildInitialAssessmentState());
    setSelectedQuestionId(null);
    setSelectedTestId(null);
    showMock('تمت إعادة البيانات الافتراضية');
  };

  return (
    <div className="assessments-manager">
      <div className="filters-row" style={{ marginBottom: 8 }}>
        <button type="button" className="mock-btn mock-btn--outline" onClick={handleResetStorage}>
          استرجاع البيانات الأصلية
        </button>
      </div>

      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'tests' && (
        <>
          <div className="filters-row">
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => setShowAddTest((v) => !v)}
            >
              <Plus size={16} />
              {showAddTest ? 'إلغاء' : 'اختبار جديد'}
            </button>
          </div>
          {showAddTest && (
            <AdminCard className="quran-session-add-form" style={{ marginBottom: 12 }}>
              <SectionHeader title="اختبار جديد" />
              <label className="cms-field">
                الاسم
                <input
                  value={testDraft.name}
                  onChange={(e) => setTestDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                الوصف
                <input
                  value={testDraft.description}
                  onChange={(e) => setTestDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                العمر
                <input
                  value={testDraft.ageRange}
                  onChange={(e) => setTestDraft((d) => ({ ...d, ageRange: e.target.value }))}
                />
              </label>
              <button type="button" className="mock-btn mock-btn--primary" onClick={handleAddTest}>
                حفظ الاختبار
              </button>
            </AdminCard>
          )}
          <div className="grid-2">
            <AdminCard>
              <SectionHeader title="الاختبارات" />
              <AdminTableContainer style={{ maxHeight: 360 }}>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>أسئلة</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t) => (
                      <tr
                        key={t.id}
                        className={selectedTest?.id === t.id ? 'selected' : ''}
                        onClick={() => setSelectedTestId(t.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{t.name}</td>
                        <td>{t.questionCount}</td>
                        <td>
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: 4 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTest(t);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: 4, marginInlineStart: 4 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTest(t.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            </AdminCard>
            <AdminCard>
              <SectionHeader title={editingTest ? 'تعديل الاختبار' : 'تفاصيل'} />
              {editingTest && selectedTest ? (
                <>
                  <label className="cms-field">
                    الاسم
                    <input
                      value={testDraft.name}
                      onChange={(e) => setTestDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                  </label>
                  <label className="cms-field">
                    الوصف
                    <input
                      value={testDraft.description}
                      onChange={(e) => setTestDraft((d) => ({ ...d, description: e.target.value }))}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="mock-btn mock-btn--primary"
                      onClick={handleSaveTestEdit}
                    >
                      حفظ التعديل
                    </button>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      onClick={() => setEditingTest(false)}
                    >
                      <X size={14} /> إلغاء
                    </button>
                  </div>
                </>
              ) : selectedTest ? (
                <>
                  <h4>{selectedTest.name}</h4>
                  <p>{selectedTest.description}</p>
                  <p>
                    <strong>أسئلة:</strong> {selectedTest.questionCount}
                  </p>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => startEditTest(selectedTest)}
                  >
                    <Pencil size={14} /> تعديل
                  </button>
                </>
              ) : (
                <EmptyState title="اختر اختباراً" compact />
              )}
            </AdminCard>
          </div>
        </>
      )}

      {tab === 'questions' && (
        <>
          <div className="filters-row">
            <select value={filterTest} onChange={(e) => setFilterTest(e.target.value)}>
              <option value="all">كل الاختبارات</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => {
                setShowAddQuestion((v) => !v);
                if (!showAddQuestion) {
                  setQuestionDraft(
                    emptyQuestionDraft(filterTest === 'all' ? tests[0]?.id : filterTest),
                  );
                }
              }}
            >
              <Plus size={16} />
              {showAddQuestion ? 'إلغاء' : 'سؤال جديد'}
            </button>
          </div>

          {showAddQuestion && (
            <AdminCard className="quran-session-add-form" style={{ marginBottom: 12 }}>
              <SectionHeader title="سؤال جديد" />
              <label className="cms-field">
                الاختبار
                <select
                  value={questionDraft.testId}
                  onChange={(e) =>
                    setQuestionDraft((d) => ({ ...d, testId: e.target.value }))
                  }
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                نص السؤال
                <textarea
                  rows={2}
                  value={questionDraft.text}
                  onChange={(e) => setQuestionDraft((d) => ({ ...d, text: e.target.value }))}
                />
              </label>
              <div className="grid-2">
                <label className="cms-field">
                  الفئة / المحور
                  <input
                    value={questionDraft.category}
                    onChange={(e) =>
                      setQuestionDraft((d) => ({ ...d, category: e.target.value }))
                    }
                  />
                </label>
                <label className="cms-field">
                  العمر
                  <input
                    value={questionDraft.age}
                    onChange={(e) => setQuestionDraft((d) => ({ ...d, age: e.target.value }))}
                  />
                </label>
              </div>
              <button
                type="button"
                className="mock-btn mock-btn--primary"
                onClick={handleAddQuestion}
                disabled={!questionDraft.text.trim()}
              >
                حفظ السؤال
              </button>
            </AdminCard>
          )}

          <div className="grid-2">
            <AdminCard>
              <SectionHeader title="الأسئلة" />
              {filteredQuestions.length === 0 ? (
                <EmptyState title="لا أسئلة" compact />
              ) : (
                <AdminTableContainer style={{ maxHeight: 400 }}>
                  <table className="admin-table admin-table--compact">
                    <thead>
                      <tr>
                        <th>السؤال</th>
                        <th>اختبار</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((q) => (
                        <tr
                          key={q.id}
                          className={selectedQuestion?.id === q.id ? 'selected' : ''}
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            setEditingQuestion(false);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ maxWidth: 220 }}>{q.text}</td>
                          <td>{q.testName}</td>
                          <td>
                            <button
                              type="button"
                              className="mock-btn mock-btn--outline"
                              style={{ padding: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditQuestion(q);
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="mock-btn mock-btn--outline"
                              style={{ padding: 4, marginInlineStart: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(q.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AdminTableContainer>
              )}
            </AdminCard>

            <AdminCard>
              <SectionHeader title={editingQuestion ? 'تعديل السؤال' : 'معاينة'} />
              {editingQuestion && selectedQuestion ? (
                <>
                  <label className="cms-field">
                    الاختبار
                    <select
                      value={questionDraft.testId}
                      onChange={(e) =>
                        setQuestionDraft((d) => ({ ...d, testId: e.target.value }))
                      }
                    >
                      {tests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="cms-field">
                    نص السؤال
                    <textarea
                      rows={3}
                      value={questionDraft.text}
                      onChange={(e) =>
                        setQuestionDraft((d) => ({ ...d, text: e.target.value }))
                      }
                    />
                  </label>
                  <label className="cms-field">
                    الفئة
                    <input
                      value={questionDraft.category}
                      onChange={(e) =>
                        setQuestionDraft((d) => ({ ...d, category: e.target.value }))
                      }
                    />
                  </label>
                  <label className="cms-field">
                    العمر
                    <input
                      value={questionDraft.age}
                      onChange={(e) =>
                        setQuestionDraft((d) => ({ ...d, age: e.target.value }))
                      }
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="mock-btn mock-btn--primary"
                      onClick={handleSaveQuestionEdit}
                    >
                      حفظ التعديل
                    </button>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      onClick={() => setEditingQuestion(false)}
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              ) : selectedQuestion ? (
                <>
                  <p>{selectedQuestion.text}</p>
                  <p>
                    <strong>{selectedQuestion.testName}</strong> · {selectedQuestion.category} ·{' '}
                    {selectedQuestion.age}
                  </p>
                  <StatusBadge tone="info">{selectedQuestion.answerType}</StatusBadge>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    style={{ marginTop: 12 }}
                    onClick={() => startEditQuestion(selectedQuestion)}
                  >
                    <Pencil size={14} /> تعديل
                  </button>
                </>
              ) : (
                <EmptyState title="اختر سؤالاً" compact />
              )}
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
}
