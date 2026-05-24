import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  emotionalLessons,
  emotionalOverview,
  emotionalPackages,
} from '../data/mockData';

const assetTone = { موجود: 'success', ناقص: 'error', 'يحتاج مراجعة': 'warning' };

export function EmotionalPage() {
  const [selectedLessonId, setSelectedLessonId] = useState(emotionalLessons[0]?.id ?? null);
  const detail = emotionalLessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة الذكاء العاطفي"
        extraBadges={[
          `${emotionalOverview.lessonCount} درس`,
          `${emotionalOverview.slideCount} شريحة`,
          `${emotionalOverview.packageCount} حزمة مصدر`,
        ]}
      />

      <InfoBanner tone="info">
        UI فقط — لا تشغيل صوت ولا API. البيانات من{' '}
        <code>emotional_curriculum_schedule.dart</code> و manifest.
      </InfoBanner>

      <div className="grid-4">
        <StatCard label="إجمالي الدروس" value={String(emotionalOverview.lessonCount)} />
        <StatCard label="إجمالي الشرائح" value={String(emotionalOverview.slideCount)} />
        <StatCard
          label="أيام محتوى جديد"
          value={String(emotionalOverview.lastNewContentDay)}
        />
        <StatCard
          label="بداية المراجعة"
          value={String(emotionalOverview.reviewCycleStartDay)}
          sub="دورة تكرار الدروس 1–17"
        />
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="جدول الدروس" />
          <AdminTableContainer style={{ maxHeight: 440 }}>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الدرس</th>
                  <th>شرائح</th>
                  <th>عالمي</th>
                  <th>النشر</th>
                  <th>المرحلة العمرية</th>
                </tr>
              </thead>
              <tbody>
                {emotionalLessons.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedLessonId === row.id ? 'selected' : ''}
                    onClick={() => setSelectedLessonId(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.lesson}</td>
                    <td>{row.slideCount}</td>
                    <td>{row.globalRange}</td>
                    <td>
                      <StatusBadge tone="success">{row.publishStatus}</StatusBadge>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{row.ageFit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="تفاصيل الدرس" />
          {detail ? (
            <>
              <h4 style={{ margin: '0 0 8px', color: 'var(--track-emotional)' }}>
                درس {detail.lesson}: {detail.title}
              </h4>
              <p>
                <strong>هدف الدرس:</strong> {detail.goal}
              </p>
              <p>
                <strong>الشرائح:</strong> {detail.slideCount} (عالمي {detail.globalRange}) — أيام{' '}
                {detail.days}
              </p>
              <p>
                <strong>مناسب لـ:</strong> {detail.ageFit}
              </p>
              <StatusBadge tone="success">{detail.publishStatus}</StatusBadge>
              <InfoBanner tone="info" style={{ marginTop: 14 }}>
                يظهر عند: <strong>أطفال مسار الذكاء العاطفي</strong> حسب يوم المنهج (mock).
              </InfoBanner>
              <p style={{ marginTop: 12, marginBottom: 6 }}>
                <strong>ملفات مرتبطة:</strong>
              </p>
              <ul style={{ margin: 0, paddingRight: 20, fontSize: '0.85rem' }}>
                {detail.linkedFiles.map((f) => (
                  <li key={f}>
                    <code>{f}</code>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-caption">اختر درساً من الجدول.</p>
          )}
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="جدول الحزم المصدر (emotional_src_01 — 32)" />
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>الحزمة</th>
                <th>slide count</th>
                <th>image status</th>
                <th>audio status</th>
              </tr>
            </thead>
            <tbody>
              {emotionalPackages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <code>{p.id}</code>
                  </td>
                  <td>{p.slideCount}</td>
                  <td>
                    <StatusBadge tone={assetTone[p.imageStatus]}>{p.imageStatus}</StatusBadge>
                  </td>
                  <td>
                    <StatusBadge tone={assetTone[p.audioStatus]}>{p.audioStatus}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
        <p className="text-caption" style={{ marginTop: 10 }}>
          المجموع: {emotionalPackages.reduce((n, p) => n + p.slideCount, 0)} شريحة
        </p>
      </AdminCard>
    </div>
  );
}
