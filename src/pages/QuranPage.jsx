import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  quranKhatmahPlan,
  quranOverview,
  quranReciters,
  quranSessions,
} from '../data/mockData';

const sessionStatusTone = {
  موجود: 'success',
  ناقص: 'error',
  'يحتاج مراجعة': 'warning',
};

export function QuranPage() {
  const [selectedId, setSelectedId] = useState(quranSessions[0]?.id ?? null);
  const preview = quranSessions.find((s) => s.id === selectedId);

  return (
    <div className="page-stack">
      <PageHeader title="إدارة القرآن الكريم" />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/quran-session" className="mock-btn mock-btn--primary">
            محرر جلسة قرآن (Content Studio)
          </Link>
        </p>
      </AdminCard>

      <div className="grid-4">
        <StatCard label="ختمات مستهدفة" value={String(quranOverview.targetKhatmah)} />
        <StatCard label="جلسة لكل ختمة" value={String(quranOverview.sessionsPerKhatmah)} />
        <StatCard
          label="نصف حزب / جلسة"
          value={String(quranOverview.halfHizbPerSession)}
          sub="60 حزب × 2"
        />
        <StatCard
          label="مدة تقريبية"
          value={`${quranOverview.durationMinutes} د`}
          sub={`القارئ: ${quranOverview.activeReciter}`}
        />
      </div>

      <InfoBanner tone="warning">
        النسخة الحالية تحتوي على manifest للقرآن، لكن ملفات mp3 غير موجودة داخل assets.
      </InfoBanner>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="خطة الختمات" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            من <code>quran_age_schedule.dart</code> — جلسات يومية حسب رقم الختمة
          </p>
          <div className="quran-plan-grid">
            {quranKhatmahPlan.map((row) => (
              <div key={row.khatmah} className="quran-plan-card">
                <strong>
                  {row.khatmah === 4
                    ? 'الختمة 4 وما بعدها'
                    : `الختمة ${row.khatmah}`}
                </strong>
                <p style={{ margin: '6px 0' }}>
                  {row.dailySessions} {row.dailySessions === 2 ? 'جلستان' : 'جلسات'} يومياً
                </p>
                <span className="text-caption">
                  ~{row.daysToFinish} يوم لإكمال الختمة — {row.note}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="القراء" />
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>القارئ</th>
                  <th>نشط</th>
                  <th>ملفات الصوت</th>
                </tr>
              </thead>
              <tbody>
                {quranReciters.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      <br />
                      <code style={{ fontSize: '0.7rem' }}>{r.id}</code>
                    </td>
                    <td>
                      {r.active ? (
                        <StatusBadge tone="success">القارئ النشط</StatusBadge>
                      ) : (
                        <StatusBadge tone="muted">—</StatusBadge>
                      )}
                    </td>
                    <td>
                      <StatusBadge tone={r.audioAvailable ? 'success' : 'error'}>
                        {r.audioAvailable ? 'متوفرة' : 'غير متوفرة'}
                      </StatusBadge>
                      <p className="text-caption" style={{ margin: '4px 0 0' }}>
                        {r.audioNote}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>
      </div>

      <div className="grid-2">
        <AdminCard style={{ gridColumn: '1 / -1' }}>
          <SectionHeader title="جدول الجلسات (mock)" />
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الختمة</th>
                  <th>الجلسة</th>
                  <th>الحزب</th>
                  <th>النصف</th>
                  <th>ملف الصوت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {quranSessions.map((s) => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? 'selected' : ''}
                    onClick={() => setSelectedId(s.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{s.khatmah}</td>
                    <td>{s.session}</td>
                    <td>{s.hizb}</td>
                    <td>{s.half}</td>
                    <td>
                      <code style={{ fontSize: '0.75rem' }}>{s.file}</code>
                    </td>
                    <td>
                      <StatusBadge tone={sessionStatusTone[s.status] ?? 'muted'}>
                        {s.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
          <p className="text-caption" style={{ marginTop: 10 }}>
            انقر أي صف لعرض المعاينة في اللوحة الجانبية (8 صفوف mock من أصل 6000 جلسة).
          </p>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="معاينة الجلسة" />
          {preview ? (
            <>
              <h4 style={{ margin: '0 0 8px', color: 'var(--track-quran)' }}>{preview.title}</h4>
              <p>
                <strong>ختمة {preview.khatmah}</strong> — جلسة {preview.session} (حزب{' '}
                {preview.hizb}، نصف {preview.half})
              </p>
              <p>
                <strong>مسار الصوت:</strong>
                <br />
                <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                  {preview.audioPath}
                </code>
              </p>
              <p>
                <strong>المدة:</strong> ~{preview.durationMinutes} دقيقة
              </p>
              <StatusBadge tone={sessionStatusTone[preview.status]}>
                {preview.status}
              </StatusBadge>
              <InfoBanner tone="info" style={{ marginTop: 14 }}>
                يظهر عند: <strong>كل الأطفال</strong> حسب خطة القرآن العمرية (mock — لا تشغيل
                صوت فعلي).
              </InfoBanner>
            </>
          ) : (
            <p className="text-caption">اختر جلسة من الجدول.</p>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
