import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  assessmentOverview,
  assessmentQuestions,
  assessmentRecommendations,
  assessmentResults,
  assessmentTests,
} from '../data/mockData';

const tabs = [
  ['tests', 'الاختبارات'],
  ['questions', 'الأسئلة'],
  ['results', 'نتائج Mock'],
  ['recommendations', 'توصيات'],
];

export function AssessmentsPage() {
  const [tab, setTab] = useState('tests');
  const [filterTest, setFilterTest] = useState('all');

  const filteredQuestions = useMemo(() => {
    if (filterTest === 'all') return assessmentQuestions;
    return assessmentQuestions.filter((q) => q.testId === filterTest);
  }, [filterTest]);

  return (
    <div className="page-stack">
      <PageHeader title="التقييمات والاختبارات" />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/assessment" className="mock-btn mock-btn--primary">
            إضافة اختبار / سؤال (Content Studio)
          </Link>
        </p>
      </AdminCard>

      <InfoBanner tone="warning">
        التقييمات ليست تشخيصاً طبياً. لا حفظ إجابات ولا تحليل طبي حقيقي — UI فقط.
      </InfoBanner>

      <div className="grid-4">
        <StatCard
          label="اختبار القدرات"
          value={`${assessmentOverview.aptitude} سؤال`}
          sub="٠–٢ سنة — 4 محاور"
        />
        <StatCard label="اختبار المهارات" value={`${assessmentOverview.skills} أسئلة`} />
        <StatCard label="فحص الميول" value={`${assessmentOverview.interests} أسئلة`} />
        <StatCard label="اختبارات الطفل" value={`${assessmentOverview.child} أسئلة`} />
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
        <AdminCard>
          <SectionHeader title="جدول الاختبارات" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الوصف</th>
                  <th>أسئلة</th>
                  <th>العمر</th>
                  <th>مكان الظهور</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {assessmentTests.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700 }}>{t.name}</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 200 }}>{t.description}</td>
                    <td>{t.questionCount}</td>
                    <td>{t.ageRange}</td>
                    <td style={{ fontSize: '0.8rem' }}>{t.showsIn}</td>
                    <td>
                      <StatusBadge tone="success">{t.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'questions' && (
        <AdminCard>
          <SectionHeader title="جدول الأسئلة" />
          <div className="filters-row" style={{ marginBottom: 12 }}>
            <select value={filterTest} onChange={(e) => setFilterTest(e.target.value)}>
              <option value="all">كل الاختبارات</option>
              {assessmentTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <AdminTableContainer style={{ maxHeight: 480 }}>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>السؤال</th>
                  <th>الاختبار</th>
                  <th>الفئة</th>
                  <th>العمر</th>
                  <th>نوع الإجابة</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => (
                  <tr key={q.id}>
                    <td style={{ maxWidth: 280 }}>{q.text}</td>
                    <td>{q.testName}</td>
                    <td>{q.category}</td>
                    <td>{q.age}</td>
                    <td>{q.answerType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
          <p className="text-caption" style={{ marginTop: 8 }}>
            {filteredQuestions.length} سؤال — من aptitude_test_0_2_data و mother_quiz_screen
          </p>
        </AdminCard>
      )}

      {tab === 'results' && (
        <AdminCard>
          <SectionHeader title="نتائج Mock" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الطفل</th>
                  <th>الاختبار</th>
                  <th>نعم</th>
                  <th>لا</th>
                  <th>الإكمال</th>
                  <th>توصية (UI)</th>
                </tr>
              </thead>
              <tbody>
                {assessmentResults.map((r) => (
                  <tr key={r.id}>
                    <td>{r.child}</td>
                    <td>{r.test}</td>
                    <td>{r.yesCount}</td>
                    <td>{r.noCount}</td>
                    <td>{r.completionPct}%</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 240 }}>{r.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      )}

      {tab === 'recommendations' && (
        <AdminCard>
          <SectionHeader title="توصيات (UI فقط)" />
          <ul style={{ margin: 0, paddingRight: 20 }}>
            {assessmentRecommendations.map((rec) => (
              <li key={rec.id} style={{ marginBottom: 16 }}>
                <StatusBadge tone={rec.priority === 'عالية' ? 'warning' : 'info'}>
                  {rec.priority}
                </StatusBadge>
                <p style={{ margin: '6px 0 4px' }}>
                  <strong>{rec.basedOn}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{rec.text}</p>
              </li>
            ))}
          </ul>
          <InfoBanner tone="info" style={{ marginTop: 12 }}>
            التوصيات للعرض في لوحة التحكم فقط — لا تُرسل تلقائياً للتطبيق.
          </InfoBanner>
        </AdminCard>
      )}
    </div>
  );
}
