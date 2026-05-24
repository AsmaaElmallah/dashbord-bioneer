import { Link, useNavigate } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  overviewStats,
  curriculumProgress,
  contentStatus,
  topSectionsUsage,
  alerts,
} from '../data/mockData';

function BarChartRows({ items, valueKey = 'sessions', max }) {
  const peak = max ?? Math.max(...items.map((i) => i[valueKey]));
  return (
    <>
      {items.map((item) => (
        <div key={item.name} className="progress-row">
          <span className="progress-row__label">{item.name}</span>
          <div className="progress-row__bar">
            <div
              className="progress-row__fill"
              style={{
                width: `${peak ? (item[valueKey] / peak) * 100 : 0}%`,
                background: item.color ?? 'var(--primary)',
              }}
            />
          </div>
          <span className="progress-row__pct">{item[valueKey].toLocaleString('ar-EG')}</span>
        </div>
      ))}
    </>
  );
}

export function OverviewPage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-stack">
      <PageHeader title="نظرة عامة على بيانور" />
      <p className="text-caption" style={{ margin: 0 }}>{today}</p>

      <div className="grid-3">
        {overviewStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="تقدم المناهج" />
          {curriculumProgress.map((c) => (
            <div key={c.name} className="progress-row">
              <span className="progress-row__label">{c.name}</span>
              <div className="progress-row__bar">
                <div
                  className="progress-row__fill"
                  style={{ width: `${c.pct}%`, background: c.color }}
                />
              </div>
              <span className="progress-row__pct">{c.pct}%</span>
            </div>
          ))}
        </AdminCard>

        <AdminCard>
          <SectionHeader title="حالة المحتوى" />
          {contentStatus.map((row) => (
            <div key={row.type} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="text-body" style={{ fontWeight: 600 }}>{row.type}</span>
                <StatusBadge tone={row.pct >= 90 ? 'success' : row.pct === 0 ? 'error' : 'warning'}>
                  {row.ready.toLocaleString('ar-EG')} / {row.total.toLocaleString('ar-EG')}
                </StatusBadge>
              </div>
              <div className="progress-row" style={{ marginBottom: 0 }}>
                <div className="progress-row__bar">
                  <div className="progress-row__fill" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="progress-row__pct">{row.pct}%</span>
              </div>
            </div>
          ))}
        </AdminCard>
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="أكثر الأقسام استخداماً (اليوم)" />
          <BarChartRows items={topSectionsUsage} />
        </AdminCard>

        <AdminCard>
          <SectionHeader title="تنبيهات تشغيلية" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((text) => (
              <InfoBanner key={text} tone={text.includes('mp3') || text.includes('onboarding') ? 'warning' : 'info'}>
                {text}
              </InfoBanner>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="اختصارات النموذج التفاعلي" />
        <div className="grid-2">
          {[
            { to: '/users', label: 'المستخدمون والأطفال', hint: 'اضغط صفاً → لوحة تفاصيل' },
            { to: '/targeting', label: 'توجيه المحتوى', hint: 'غيّر الخيارات → المعاينة' },
            { to: '/community', label: 'المجتمع والدعم', hint: 'اختر شكوى → التفاصيل' },
            { to: '/curriculum', label: 'المناهج', hint: 'افتح مساراً → إدارة المحتوى' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="mock-btn mock-btn--outline"
              style={{ flexDirection: 'column', alignItems: 'flex-start', textAlign: 'right', padding: 14 }}
            >
              <strong>{item.label}</strong>
              <span className="text-caption" style={{ fontWeight: 400 }}>{item.hint}</span>
            </Link>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <SectionHeader
          title="إجراءات سريعة"
          action={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <MockActionButton>إضافة محتوى</MockActionButton>
              <MockActionButton variant="secondary" onClick={() => navigate('/community')}>
                مراجعة شكوى
              </MockActionButton>
              <MockActionButton variant="outline" action="publish">نشر إشعار</MockActionButton>
              <MockActionButton variant="outline" action="check">فحص ملفات ناقصة</MockActionButton>
            </div>
          }
        />
      </AdminCard>
    </div>
  );
}
