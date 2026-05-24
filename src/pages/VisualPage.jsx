import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  visualLessons,
  visualOverview,
  visualPackages,
  visualSlideSamples,
} from '../data/mockData';

const assetTone = { موجود: 'success', ناقص: 'error', 'يحتاج مراجعة': 'warning' };

export function VisualPage() {
  const [selectedLessonId, setSelectedLessonId] = useState(visualLessons[0]?.id ?? null);
  const [selectedSlideId, setSelectedSlideId] = useState(visualSlideSamples[0]?.id ?? null);

  const selectedLesson = visualLessons.find((l) => l.id === selectedLessonId);
  const preview =
    visualSlideSamples.find((s) => s.id === selectedSlideId) ??
    visualSlideSamples.find((s) => s.lesson === selectedLesson?.lesson) ??
    visualSlideSamples[0];

  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة التحفيز البصري"
        extraBadges={[
          `${visualOverview.lessonCount} درس`,
          `${visualOverview.slideCount} شريحة`,
          `${visualOverview.packageCount} حزمة مصدر`,
        ]}
      />

      <InfoBanner tone="warning">
        هذه الشاشة UI فقط، تعديل الشرائح لا يغيّر التطبيق فعلياً.
      </InfoBanner>

      <div className="grid-4">
        <StatCard label="الدروس" value={String(visualOverview.lessonCount)} />
        <StatCard label="الشرائح" value={String(visualOverview.slideCount)} sub="تسلسل عالمي" />
        <StatCard label="الحزم" value={String(visualOverview.packageCount)} sub="visual_src_01–18" />
        <StatCard
          label="محتوى جديد / مراجعة"
          value={`${visualOverview.lastNewContentDay} → ${visualOverview.reviewCycleStartDay}`}
          sub="آخر يوم جديد ثم دورة مراجعة"
        />
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="جدول الدروس" />
          <AdminTableContainer style={{ maxHeight: 420 }}>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>درس</th>
                  <th>نطاق الشرائح</th>
                  <th>عدد</th>
                  <th>أيام الظهور</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {visualLessons.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedLessonId === row.id ? 'selected' : ''}
                    onClick={() => {
                      setSelectedLessonId(row.id);
                      const sample = visualSlideSamples.find((s) => s.lesson === row.lesson);
                      if (sample) setSelectedSlideId(sample.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.lesson}</td>
                    <td>{row.globalRange}</td>
                    <td>{row.slideCount}</td>
                    <td style={{ fontSize: '0.8rem' }}>{row.days}</td>
                    <td>
                      <StatusBadge tone="success">{row.contentStatus}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="معاينة الشريحة (mock)" />
          {preview && (
            <>
              <div
                className="math-slide-preview__img"
                style={{ borderColor: 'rgba(8, 145, 178, 0.45)' }}
              >
                شريحة بصرية — placeholder
              </div>
              <p>
                <strong>درس {preview.lesson}</strong> — شريحة عالمية #{preview.globalIndex}
              </p>
              <p>
                <strong>الحزمة:</strong> {preview.packageId} (شريحة {preview.slideIndex})
              </p>
              <p>
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {preview.assetPath}
                </code>
              </p>
              <p>
                <strong>المدة:</strong> {preview.durationSec} ثانية
              </p>
              <p>
                <strong>الصوت:</strong>{' '}
                <StatusBadge tone={assetTone[preview.audioStatus]}>
                  {preview.audioStatus}
                </StatusBadge>
              </p>
              <InfoBanner tone="info" style={{ marginTop: 12 }}>
                يظهر عند: <strong>مسار التحفيز البصري</strong> حسب اليوم والدرس (mock).
              </InfoBanner>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {visualSlideSamples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="mock-btn mock-btn--outline"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => setSelectedSlideId(s.id)}
                  >
                    #{s.globalIndex}
                  </button>
                ))}
              </div>
            </>
          )}
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="جدول الحزم المصدر" />
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>الحزمة</th>
                <th>عدد الشرائح</th>
                <th>حالة الصور</th>
                <th>حالة الصوت</th>
              </tr>
            </thead>
            <tbody>
              {visualPackages.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    const sample = visualSlideSamples.find((s) => s.packageId === p.id);
                    if (sample) setSelectedSlideId(sample.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
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
          المجموع: {visualPackages.reduce((n, p) => n + p.slideCount, 0)} شريحة — من{' '}
          <code>visual_curriculum_schedule.dart</code> و manifest.json
        </p>
      </AdminCard>
    </div>
  );
}
