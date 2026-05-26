import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { curriculumPhases, tracks } from '../data/mockData';

export function CurriculumPage() {
  return (
    <div className="page-stack">
      <PageHeader title="المناهج — مركز التحكم" />

      <div className="grid-2">
        {tracks.map((t) => (
          <AdminCard key={t.id} style={{ borderRight: `4px solid ${t.color}` }}>
            <h3 style={{ marginTop: 0, color: t.color }}>{t.name}</h3>
            <p>
              <strong>{t.lessonsLabel}</strong> — <strong>{t.sessions.toLocaleString('ar-EG')}</strong>{' '}
              جلسة/شريحة
            </p>
            <p className="text-caption">أيام محتوى جديد: {t.newContentDays}</p>
            <p>نطاق التطبيق: {t.days}</p>
            <p>التكرار اليومي: {t.repeat}</p>
            <div className="progress-row">
              <span className="progress-row__label">إكمال mock</span>
              <div className="progress-row__bar">
                <div
                  className="progress-row__fill"
                  style={{ width: `${t.completion}%`, background: t.color }}
                />
              </div>
              <span className="progress-row__pct">{t.completion}%</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <StatusBadge tone={t.contentTone}>{t.contentStatus}</StatusBadge>
            </div>
            <Link
              to={t.adminPath}
              className="mock-btn mock-btn--primary"
              style={{ display: 'inline-flex', marginTop: 14, alignItems: 'center', gap: 6 }}
            >
              فتح إدارة المسار
              <ArrowLeft size={16} />
            </Link>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <SectionHeader title="الخط الزمني للمنهج (ماث — مراحل الأيام)" />
        <p className="text-caption" style={{ marginTop: 0 }}>
          مبني على <code>math_curriculum_schedule.dart</code> في تطبيق Flutter
        </p>
        <div className="curriculum-timeline">
          {curriculumPhases.map((phase) => (
            <div
              key={phase.id}
              className="curriculum-timeline__segment"
              style={{ flex: phase.width, background: phase.color }}
              title={`${phase.label}: ${phase.desc}`}
            >
              <span className="curriculum-timeline__label">{phase.label}</span>
            </div>
          ))}
        </div>
        <ul style={{ margin: '16px 0 0', paddingRight: 20, fontSize: '0.88rem' }}>
          {curriculumPhases.map((p) => (
            <li key={p.id}>
              <strong>{p.label}:</strong> {p.desc}
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard>
        <SectionHeader title="خريطة المنهج" />
        <AdminTableContainer>
          <table className="admin-table admin-table--cards">
            <thead>
              <tr>
                <th>المسار</th>
                <th>الدروس/الختمات</th>
                <th>الشرائح/الجلسات</th>
                <th>نوع المحتوى</th>
                <th>المصدر</th>
                <th>حالة المراجعة</th>
                <th>إدارة</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t) => (
                <tr key={t.id}>
                  <td data-label="المسار" style={{ fontWeight: 700 }}>{t.name}</td>
                  <td data-label="الدروس/الختمات">{t.lessons}</td>
                  <td data-label="الشرائح/الجلسات">{t.sessions.toLocaleString('ar-EG')}</td>
                  <td data-label="نوع المحتوى">{t.contentType}</td>
                  <td data-label="المصدر">
                    <code style={{ fontSize: '0.75rem' }}>{t.source}</code>
                  </td>
                  <td data-label="حالة المراجعة">
                    <StatusBadge tone={t.reviewTone}>{t.reviewStatus}</StatusBadge>
                  </td>
                  <td data-label="إدارة">
                    <Link to={t.adminPath} className="mock-btn mock-btn--outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      فتح
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
      </AdminCard>
    </div>
  );
}
