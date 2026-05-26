import { ClipboardList } from 'lucide-react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { QuestionEditor } from './QuestionEditor';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  assessmentAgeGroups,
  assessmentAudienceOptions,
  assessmentAxes,
  assessmentPublishOptions,
  createEmptyQuestion,
  getAgeGroupLabel,
  getAnswerTypeLabel,
  getQuestionValidation,
} from '../data/assessmentBuilder';

function QuestionAppPreview({ question, questionIndex, totalQuestions }) {
  const progress = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 20;
  const choices = (question.choiceOptions ?? '')
    .split('\n')
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="assessment-question-preview" dir="rtl">
      <div className="assessment-progress">
        <div className="assessment-progress__bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="assessment-progress__label">
        السؤال {questionIndex + 1} من {Math.max(totalQuestions, 1)} (mock)
      </p>
      <p className="assessment-question-preview__text">
        {question.text || '— نص السؤال —'}
        {question.required && <span className="assessment-required"> *</span>}
      </p>
      <p className="text-caption">
        {getAgeGroupLabel(question.ageGroupId)} · {question.axis}
      </p>

      {question.answerType === 'yes_no' && (
        <div className="assessment-yesno-preview">
          <button type="button" className="mock-btn mock-btn--outline" disabled>
            نعم
          </button>
          <button type="button" className="mock-btn mock-btn--outline" disabled>
            لا
          </button>
        </div>
      )}

      {question.answerType === 'single_choice' &&
        choices.map((c) => (
          <label key={c} className="assessment-choice-preview">
            <input type="radio" disabled name="preview" /> {c}
          </label>
        ))}

      {question.answerType === 'multi_choice' &&
        choices.map((c) => (
          <label key={c} className="assessment-choice-preview">
            <input type="checkbox" disabled /> {c}
          </label>
        ))}

      {question.answerType === 'short_text' && (
        <input type="text" className="cms-field" disabled placeholder="إجابة قصيرة..." />
      )}

      {question.answerType === 'yes_no' && question.recommendationOnYes && (
        <p className="text-caption assessment-rec-hint">عند «نعم»: {question.recommendationOnYes}</p>
      )}
    </div>
  );
}

function QuestionsTable({ questions, onSelect, onRemove }) {
  if (questions.length === 0) {
    return (
      <EmptyState
        compact
        title="لا أسئلة مضافة بعد"
        description="أضف أسئلة محلياً — تُفرغ القائمة بعد refresh."
      />
    );
  }

  return (
    <AdminTableContainer>
      <table className="admin-table admin-table--compact">
        <thead>
          <tr>
            <th>#</th>
            <th>السؤال</th>
            <th>النوع</th>
            <th>العمر</th>
            <th>المحور</th>
            <th>إلزامي</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => (
            <tr key={q.localId ?? index}>
              <td>{q.sortOrder}</td>
              <td style={{ maxWidth: 220 }}>{q.text}</td>
              <td>{getAnswerTypeLabel(q.answerType)}</td>
              <td>{getAgeGroupLabel(q.ageGroupId)}</td>
              <td>{q.axis}</td>
              <td>{q.required ? 'نعم' : 'لا'}</td>
              <td>
                <button type="button" className="mock-btn mock-btn--outline" onClick={() => onSelect?.(q)}>
                  تحرير
                </button>
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  style={{ marginRight: 4 }}
                  onClick={() => onRemove?.(index)}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableContainer>
  );
}

export function AssessmentBuilder({
  assessment,
  onAssessmentChange,
  currentQuestion,
  onQuestionChange,
  questions,
  onAddQuestion,
  onSelectQuestion,
  onRemoveQuestion,
}) {
  const { showMock } = useSnackbar();
  const patchTest = (partial) => onAssessmentChange({ ...assessment, ...partial });
  const questionValidation = getQuestionValidation(currentQuestion);

  const toggleAxis = (axis) => {
    const axes = assessment.axes.includes(axis)
      ? assessment.axes.filter((a) => a !== axis)
      : [...assessment.axes, axis];
    patchTest({ axes });
  };

  const handleAddQuestion = () => {
    if (questionValidation.some((v) => v.severity === 'error')) {
      showMock('أكمل نص السؤال قبل الإضافة (UI فقط)');
      return;
    }
    onAddQuestion?.({
      ...currentQuestion,
      localId: `q_${Date.now()}`,
    });
    onQuestionChange(createEmptyQuestion({ sortOrder: questions.length + 2 }));
    showMock('أُضيف السؤال للجدول (UI فقط) — لا حفظ');
  };

  const previewIndex = questions.findIndex(
    (q) => q.localId && q.localId === currentQuestion.localId,
  );
  const activeIndex = previewIndex >= 0 ? previewIndex : questions.length;

  return (
    <div className="assessment-builder">

      <div className="grid-2 assessment-builder__layout">
        <div className="assessment-builder__main">
          <AdminCard>
            <SectionHeader title="AssessmentBuilder — الاختبار" />
            <label className="cms-field">
              اسم الاختبار
              <input
                type="text"
                value={assessment.name}
                onChange={(e) => patchTest({ name: e.target.value })}
                placeholder="اختبار تقييم قدرات الطفل"
              />
            </label>
            <label className="cms-field">
              وصف الاختبار
              <textarea
                rows={2}
                value={assessment.description}
                onChange={(e) => patchTest({ description: e.target.value })}
              />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                الفئة العمرية
                <select
                  value={assessment.ageGroupId}
                  onChange={(e) => patchTest({ ageGroupId: e.target.value })}
                >
                  {assessmentAgeGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                حالة النشر
                <select
                  value={assessment.publishStatus}
                  onChange={(e) => patchTest({ publishStatus: e.target.value })}
                >
                  {assessmentPublishOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="cms-field" style={{ marginBottom: 8 }}>
              هل هو للأم أم للطفل؟
            </p>
            <div className="chip-grid">
              {assessmentAudienceOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`chip-btn${assessment.audience === a.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patchTest({ audience: a.id })}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="cms-field" style={{ marginTop: 12, marginBottom: 8 }}>
              المحاور
            </p>
            <div className="chip-grid">
              {assessmentAxes.map((axis) => (
                <button
                  key={axis}
                  type="button"
                  className={`chip-btn chip-btn--sm${assessment.axes.includes(axis) ? ' chip-btn--active' : ''}`}
                  onClick={() => toggleAxis(axis)}
                >
                  {axis}
                </button>
              ))}
            </div>
          </AdminCard>

          <QuestionEditor value={currentQuestion} onChange={onQuestionChange} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save" onClick={handleAddQuestion}>
              إضافة سؤال للاختبار
            </MockActionButton>
            <MockActionButton action="publish">نشر الاختبار (mock)</MockActionButton>
          </div>

          <AdminCard>
            <SectionHeader title="الأسئلة المضافة (محلي)" />
            <QuestionsTable
              questions={questions}
              onSelect={onSelectQuestion}
              onRemove={onRemoveQuestion}
            />
          </AdminCard>
        </div>

        <AdminCard className="assessment-builder__preview-wrap">
          <SectionHeader title="معاينة السؤال في التطبيق" />
          {assessment.name && (
            <p className="assessment-builder__test-name">
              <ClipboardList size={16} /> {assessment.name}
            </p>
          )}
          <StatusBadge tone="info">
            {assessmentAudienceOptions.find((a) => a.id === assessment.audience)?.label}
          </StatusBadge>
          <QuestionAppPreview
            question={currentQuestion}
            questionIndex={activeIndex}
            totalQuestions={questions.length || 1}
          />
        </AdminCard>
      </div>
    </div>
  );
}
