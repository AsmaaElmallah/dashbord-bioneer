import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  mathLessons,
  mathOverview,
  mathPackages,
  mathSlideSamples,
} from '../data/mockData';

const audioTone = { موجود: 'success', ناقص: 'error' };
const roleTone = { core: 'success', archive: 'muted' };

export function MathPage() {
  const [selectedLessonId, setSelectedLessonId] = useState(mathLessons[0]?.id ?? null);
  const [selectedSlideId, setSelectedSlideId] = useState(mathSlideSamples[0]?.id ?? null);

  const selectedLesson = mathLessons.find((l) => l.id === selectedLessonId);
  const preview =
    mathSlideSamples.find((s) => s.id === selectedSlideId) ??
    mathSlideSamples.find((s) => s.lesson === selectedLesson?.lesson) ??
    mathSlideSamples[0];

  return (
    <div className="page-stack">
      <PageHeader
        title="إدارة منهج الحساب النقطي"
        extraBadges={[
          `${mathOverview.lessonCount} درس`,
          `${mathOverview.coreSlideCount} شريحة في التسلسل الأساسي`,
        ]}
      />

      <div className="grid-4">
        <StatCard
          label="حزم manifest"
          value={String(mathOverview.manifestPackageCount)}
          sub="22 معرّفة في manifest.json"
        />
        <StatCard
          label="الشرائح الأساسية"
          value={String(mathOverview.coreSlideCount)}
          sub="100 + 100 + 37"
        />
        <StatCard
          label="أيام محتوى جديد"
          value={String(mathOverview.lastNewContentDay)}
          sub="آخر يوم بكل الشرائح لأول مرة"
        />
        <StatCard
          label="بداية المراجعة"
          value={String(mathOverview.reviewCycleStartDay)}
          sub={`برنامج ${mathOverview.totalProgramDays} يوم`}
        />
      </div>

      <InfoBanner tone="info">
        التسلسل: <strong>q_129_132</strong> → <strong>dot_numeric_133_136</strong> →{' '}
        <strong>beads_numeric</strong> — من <code>math_track.dart</code> و{' '}
        <code>math_curriculum_schedule.dart</code>
      </InfoBanner>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="جدول الدروس 1–25" />
          <AdminTableContainer style={{ maxHeight: 420 }}>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الدرس</th>
                  <th>نطاق عالمي</th>
                  <th>شرائح</th>
                  <th>الأيام</th>
                  <th>تكرار</th>
                  <th>المحتوى</th>
                </tr>
              </thead>
              <tbody>
                {mathLessons.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedLessonId === row.id ? 'selected' : ''}
                    onClick={() => {
                      setSelectedLessonId(row.id);
                      const sample = mathSlideSamples.find((s) => s.lesson === row.lesson);
                      if (sample) setSelectedSlideId(sample.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.lesson}</td>
                    <td>{row.globalRange}</td>
                    <td>{row.slideCount}</td>
                    <td style={{ fontSize: '0.8rem' }}>{row.days}</td>
                    <td>{row.dailyRepeat}</td>
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
              <div className="math-slide-preview__img">صورة الشريحة — placeholder</div>
              <p>
                <strong>درس {preview.lesson}</strong> — شريحة عالمية #{preview.globalIndex}
              </p>
              <p>
                <strong>الحزمة:</strong> {preview.packageId} (شريحة {preview.slideIndex})
              </p>
              <p>
                <strong>مسار asset:</strong>
                <br />
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {preview.assetPath}
                </code>
              </p>
              <p>
                <strong>المدة:</strong> {preview.durationSec} ثانية
              </p>
              <p>
                <strong>audio.m4a:</strong>{' '}
                <StatusBadge tone={audioTone[preview.audioStatus]}>
                  {preview.audioStatus}
                </StatusBadge>
                <br />
                <code style={{ fontSize: '0.72rem' }}>{preview.audioPath}</code>
              </p>
              <InfoBanner tone="info" style={{ marginTop: 12 }}>
                يظهر عند: <strong>الأطفال في يوم المنهج المناسب</strong> (mock — لا تشغيل
                asset).
              </InfoBanner>
              <p className="text-caption" style={{ marginTop: 8 }}>
                عينات للمعاينة: انقر درس 1 أو 11 أو 25 في الجدول، أو اختر من جدول الحزم
                أدناه.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {mathSlideSamples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`mock-btn mock-btn--outline${selectedSlideId === s.id ? ' mock-btn--active' : ''}`}
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
        <SectionHeader title="جدول الحزم (manifest)" />
        <AdminTableContainer>
          <table className="admin-table">
            <thead>
              <tr>
                <th>package id</th>
                <th>source file</th>
                <th>slide count</th>
                <th>في التسلسل</th>
                <th>track label</th>
                <th>الدور</th>
              </tr>
            </thead>
            <tbody>
              {mathPackages.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    const sample = mathSlideSamples.find((s) => s.packageId === p.id);
                    if (sample) setSelectedSlideId(sample.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <code>{p.id}</code>
                  </td>
                  <td style={{ fontSize: '0.78rem', maxWidth: 220 }}>
                    {p.sourceFile ?? '—'}
                  </td>
                  <td>{p.slideCount}</td>
                  <td>{p.inCoreSequence > 0 ? p.inCoreSequence : '—'}</td>
                  <td>{p.trackLabel}</td>
                  <td>
                    <StatusBadge tone={roleTone[p.roleKey]}>{p.role}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
        <p className="text-caption" style={{ marginTop: 10 }}>
          يعرض 6 حزم نموذجية من أصل {mathOverview.manifestPackageCount} في manifest — 3 أساسية
          + 3 أرشيف.
        </p>
      </AdminCard>
    </div>
  );
}
