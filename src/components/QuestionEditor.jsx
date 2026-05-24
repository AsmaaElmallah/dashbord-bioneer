import { AdminCard } from './AdminCard';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import {
  assessmentAgeGroups,
  assessmentAxes,
  getAnswerTypeLabel,
  getQuestionValidation,
  questionAnswerTypes,
} from '../data/assessmentBuilder';

export function QuestionEditor({ value, onChange }) {
  const question = value;
  const validation = getQuestionValidation(question);
  const patch = (partial) => onChange({ ...question, ...partial });
  const showYesNoRecs = question.answerType === 'yes_no';
  const showChoices = ['single_choice', 'multi_choice'].includes(question.answerType);

  return (
    <AdminCard className="question-editor">
      <SectionHeader title="QuestionEditor — سؤال" />
      <label className="cms-field">
        نص السؤال
        <textarea
          rows={3}
          value={question.text}
          onChange={(e) => patch({ text: e.target.value })}
          placeholder="هل يقف مع دعم؟"
        />
      </label>
      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          نوع الإجابة
          <select value={question.answerType} onChange={(e) => patch({ answerType: e.target.value })}>
            {questionAnswerTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="cms-field">
          ترتيب السؤال
          <input
            type="number"
            min="1"
            value={question.sortOrder}
            onChange={(e) => patch({ sortOrder: Number(e.target.value) || 1 })}
          />
        </label>
      </div>
      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          الفئة العمرية
          <select value={question.ageGroupId} onChange={(e) => patch({ ageGroupId: e.target.value })}>
            {assessmentAgeGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="cms-field">
          المحور
          <select value={question.axis} onChange={(e) => patch({ axis: e.target.value })}>
            {assessmentAxes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>
      {showChoices && (
        <label className="cms-field">
          خيارات (سطر لكل خيار)
          <textarea
            rows={3}
            value={question.choiceOptions}
            onChange={(e) => patch({ choiceOptions: e.target.value })}
          />
        </label>
      )}
      {showYesNoRecs && (
        <>
          <label className="cms-field">
            توصية عند إجابة نعم
            <textarea
              rows={2}
              value={question.recommendationOnYes}
              onChange={(e) => patch({ recommendationOnYes: e.target.value })}
            />
          </label>
          <label className="cms-field">
            توصية عند إجابة لا
            <textarea
              rows={2}
              value={question.recommendationOnNo}
              onChange={(e) => patch({ recommendationOnNo: e.target.value })}
            />
          </label>
        </>
      )}
      <label className="cms-field assessment-checkbox">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => patch({ required: e.target.checked })}
        />
        السؤال إلزامي
      </label>
      {validation.length > 0 && (
        <div className="assessment-validation">
          {validation.map((v) => (
            <InfoBanner key={v.id} tone={v.severity === 'error' ? 'warning' : 'info'}>
              {v.message}
            </InfoBanner>
          ))}
        </div>
      )}
      <p className="text-caption">نوع الإجابة: {getAnswerTypeLabel(question.answerType)}</p>
    </AdminCard>
  );
}
