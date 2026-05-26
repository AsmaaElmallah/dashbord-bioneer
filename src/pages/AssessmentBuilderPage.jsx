import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AssessmentBuilder } from '../components/AssessmentBuilder';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyAssessment,
  createEmptyQuestion,
  getYesNoQuestion612MonthsMock,
} from '../data/assessmentBuilder';

export function AssessmentBuilderPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [assessment, setAssessment] = useState(() => createEmptyAssessment());
  const [currentQuestion, setCurrentQuestion] = useState(() => createEmptyQuestion());
  const [questions, setQuestions] = useState([]);

  const loadExample = () => {
    const mock = getYesNoQuestion612MonthsMock();
    setAssessment(mock.assessment);
    setCurrentQuestion(mock.question);
    setQuestions([]);
  };

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader
        title="منشئ الاختبارات والأسئلة"
        extraBadges={[mode === 'question' ? 'سؤال' : 'اختبار']}
      />

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button type="button" className="mock-btn mock-btn--outline" onClick={loadExample}>
          تحميل سؤال نعم/لا — 6-12 شهر (mock)
        </button>
      </AdminCard>

      <AssessmentBuilder
        assessment={assessment}
        onAssessmentChange={setAssessment}
        currentQuestion={currentQuestion}
        onQuestionChange={setCurrentQuestion}
        questions={questions}
        onAddQuestion={(q) => setQuestions((prev) => [...prev, q])}
        onSelectQuestion={setCurrentQuestion}
        onRemoveQuestion={(index) =>
          setQuestions((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </div>
  );
}
