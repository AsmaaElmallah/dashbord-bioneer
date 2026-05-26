import { Navigate, useSearchParams } from 'react-router-dom';

/** إعادة توجيه — إدارة الرياضة والأنشطة في مكتبة المحتوى */
export function ActivitiesPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab') === 'activities' ? 'activities' : 'exercises';
  return <Navigate to={`/library?tab=${tab}`} replace />;
}
