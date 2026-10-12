import { useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { fetchDashboardOverview } from '../services/supabase/overviewService';

export function ReportsPage() {
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error, offline } = await fetchDashboardOverview();
      if (cancelled) return;
      if (offline) showError('Supabase غير مفعّل');
      else if (error) showError('تعذّر تحميل التقرير');
      setOverview(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  return (
    <div className="page-stack">
      <PageHeader title="التقارير" />

      <InfoBanner tone="info">
        الأرقام من قاعدة البيانات فقط — جلسات المشاهدة وإكمال الدروس مش متتابعة لسه.
      </InfoBanner>

      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل التقرير…" />
        </AdminCard>
      )}

      {!loading && !overview && (
        <EmptyState title="لا تقرير" description="اتصلي بقاعدة البيانات لعرض الأرقام." />
      )}

      {!loading && overview && (
        <>
          <div className="grid-4">
            <StatCard label="مستخدمون" value={String(overview.users)} />
            <StatCard label="أطفال" value={String(overview.children)} />
            <StatCard label="اشتراكات نشطة" value={String(overview.activeSubs)} />
            <StatCard label="رسائل مفتوحة" value={String(overview.openFeedback)} />
          </div>

          <AdminCard>
            <SectionHeader title="أداء الاشتراكات" />
            {overview.planRows.length === 0 ? (
              <EmptyState compact title="لا باقات" />
            ) : (
              <AdminTableContainer>
                <table className="admin-table admin-table--compact">
                  <thead>
                    <tr>
                      <th>الباقة</th>
                      <th>نشط</th>
                      <th>منته/ملغى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.planRows.map((r) => (
                      <tr key={r.planId || r.plan}>
                        <td>{r.plan}</td>
                        <td>{r.active}</td>
                        <td>{r.churn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableContainer>
            )}
          </AdminCard>
        </>
      )}

      {!isSupabaseEnabled && (
        <InfoBanner tone="warning">فعّلي VITE_USE_SUPABASE لجلب التقرير.</InfoBanner>
      )}
    </div>
  );
}
