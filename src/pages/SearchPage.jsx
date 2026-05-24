import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { buildGlobalSearchResults } from '../data/mockData';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const results = useMemo(() => buildGlobalSearchResults(q, 50), [q]);

  return (
    <div className="page-stack">
      <PageHeader title="نتائج البحث" />

      <p className="ui-only-hint">بحث محلي على mock data — لا Backend.</p>

      <AdminCard>
        {q ? (
          <>
            <p style={{ marginTop: 0 }}>
              بحث mock عن: <strong>{q}</strong> — {results.length} نتيجة (UI فقط، لا Backend).
            </p>
            {results.length === 0 ? (
              <EmptyState
                title="لا توجد نتائج بحث"
                description="جرّبي «يوسف» أو «مطر» أو «شكوى» أو «درس» — البحث mock محلي فقط."
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
          <EmptyState title="ابدأ البحث" description="اكتب في شريط البحث أعلى الصفحة — يظهر dropdown أو اضغط Enter" />
        )}
      </AdminCard>
    </div>
  );
}
