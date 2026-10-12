import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { searchCloudContent } from '../services/supabase/searchService';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseEnabled || !q.trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await searchCloudContent(q, 50);
      if (!cancelled) {
        setResults(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="page-stack">
      <PageHeader title="نتائج البحث" />

      <p className="ui-only-hint">بحث في المحتوى الثابت والمكتبة والأسئلة والشكاوى والاستشارات.</p>

      <AdminCard>
        {!q ? (
          <EmptyState title="ابدأ البحث" description="اكتبي في شريط البحث أعلى الصفحة ثم Enter." />
        ) : loading ? (
          <MockLoading label="جاري البحث…" />
        ) : results.length === 0 ? (
          <EmptyState title="لا توجد نتائج" description={`مافيش تطابق مع «${q}».`} />
        ) : (
          <>
            <p style={{ marginTop: 0 }}>
              نتائج البحث عن: <strong>{q}</strong> — {results.length} نتيجة.
            </p>
            <AdminTableContainer>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>النوع</th>
                    <th>العنوان</th>
                    <th>تفاصيل</th>
                    <th>مسار</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.typeLabel}</td>
                      <td>{r.title}</td>
                      <td>{r.subtitle ?? '—'}</td>
                      <td>{r.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          </>
        )}
      </AdminCard>
    </div>
  );
}
