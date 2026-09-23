import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { buildGlobalSearchResults } from '../data/mockData';
import { searchCloudContent } from '../services/supabase/searchService';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [cloudResults, setCloudResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseEnabled || !q.trim()) {
      setCloudResults(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await searchCloudContent(q, 50);
      if (!cancelled) {
        setCloudResults(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  const results =
    isSupabaseEnabled && cloudResults != null
      ? cloudResults
      : buildGlobalSearchResults(q, 50);

  return (
    <div className="page-stack">
      <PageHeader
        title="نتائج البحث"
        extraBadges={
          isSupabaseEnabled && cloudResults != null ? ['Supabase'] : ['mock data']
        }
      />

      <p className="ui-only-hint">
        {isSupabaseEnabled
          ? 'بحث في CMS / المكتبة / FAQ / الاستشارات / الشكاوى.'
          : 'بحث محلي على mock data — فعّلي Supabase للبحث السحابي.'}
      </p>

      <AdminCard>
        {q ? (
          <>
            <p style={{ marginTop: 0 }}>
              نتائج البحث عن: <strong>{q}</strong> —{' '}
              {loading ? '…' : `${results.length} نتيجة`}.
            </p>
            {!loading && results.length === 0 ? (
              <EmptyState
                title="لا توجد نتائج بحث"
                description="جرّبي كلمة من عنوان مقال أو مكتبة أو شكوى."
              />
            ) : (
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
            )}
          </>
        ) : (
          <EmptyState
            title="ابدأ البحث"
            description="اكتب في شريط البحث أعلى الصفحة — يظهر dropdown أو اضغط Enter"
          />
        )}
      </AdminCard>
    </div>
  );
}
