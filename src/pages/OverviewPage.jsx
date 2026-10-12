import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { fetchDashboardOverview } from '../services/supabase/overviewService';

const shortcuts = [
  { to: '/courses', label: 'الدورات', hint: 'فيديو التعريف والدروس واللايف' },
  { to: '/library', label: 'المكتبة', hint: 'PDF والكتب والفيديو' },
  { to: '/community', label: 'المجتمع', hint: 'شكاوى واستشارات ونادي الأمهات' },
  { to: '/subscriptions', label: 'الاشتراكات', hint: 'الباقات ومنح اشتراك' },
  { to: '/users', label: 'المستخدمون', hint: 'عرض الحسابات والأطفال' },
  { to: '/onboarding', label: 'فيديوهات التعريف', hint: 'أول شاشات التطبيق' },
];

export function OverviewPage() {
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error, offline } = await fetchDashboardOverview();
      if (cancelled) return;
      if (offline) {
        showError('Supabase غير مفعّل');
      } else if (error) {
        showError('تعذّر تحميل النظرة العامة');
      }
      setOverview(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  return (
    <div className="page-stack">
      <PageHeader title="نظرة عامة على بيانور" />
      <p className="text-caption" style={{ margin: 0 }}>{today}</p>

      {!isSupabaseEnabled && (
        <InfoBanner tone="warning">فعّلي الاتصال بقاعدة البيانات لعرض الأرقام الحقيقية.</InfoBanner>
      )}

      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل الأرقام من السحابة…" />
        </AdminCard>
      )}

      {!loading && overview && (
        <>
          <div className="grid-3">
            <StatCard label="المستخدمون" value={String(overview.users)} />
            <StatCard label="الأطفال" value={String(overview.children)} />
            <StatCard label="اشتراكات نشطة" value={String(overview.activeSubs)} />
            <StatCard label="الدورات" value={String(overview.courses)} />
            <StatCard label="رسائل بانتظار رد" value={String(overview.openFeedback)} />
            <StatCard label="استشارات مفتوحة" value={String(overview.openConsultations)} />
          </div>

          <AdminCard>
            <SectionHeader title="الاشتراكات حسب الباقة" />
            {overview.planRows.length === 0 ? (
              <EmptyState compact title="لا باقات بعد" description="أضيفي باقة من صفحة الاشتراكات." />
            ) : (
              overview.planRows.map((row) => (
                <div key={row.planId || row.plan} className="progress-row">
                  <span className="progress-row__label">{row.plan}</span>
                  <div className="progress-row__bar">
                    <div
                      className="progress-row__fill"
                      style={{
                        width: `${
                          overview.activeSubs
                            ? Math.max(8, (row.active / overview.activeSubs) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="progress-row__pct">{row.active}</span>
                </div>
              ))
            )}
          </AdminCard>
        </>
      )}

      <AdminCard>
        <SectionHeader title="اختصارات" />
        <div className="grid-2">
          {shortcuts.map((item) => (
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
    </div>
  );
}
