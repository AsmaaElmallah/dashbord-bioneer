import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, isSupabaseEnabled } from '../lib/supabaseClient';

function supabaseIntegrationStatus(isLoggedIn) {
  if (!isSupabaseConfigured) return 'غير مُعدّ — أضف .env';
  if (!isSupabaseEnabled) return 'مُعدّ — عطّل (VITE_USE_SUPABASE=false)';
  if (!isLoggedIn) return 'متصل — غير مسجّلة';
  return 'متصل — مسجّلة الدخول';
}

function supabaseIntegrationTone(isLoggedIn) {
  if (!isSupabaseConfigured || !isSupabaseEnabled) return 'warning';
  return isLoggedIn ? 'success' : 'info';
}

export function SettingsPage() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="page-stack">
      <PageHeader title="حالة الاتصال" />

      <AdminCard>
        <SectionHeader title="قاعدة البيانات" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
          }}
        >
          <span>Supabase</span>
          <StatusBadge tone={supabaseIntegrationTone(isLoggedIn)}>
            {supabaseIntegrationStatus(isLoggedIn)}
          </StatusBadge>
        </div>
        {isSupabaseConfigured && (
          <p className="text-caption" style={{ marginTop: 8 }}>
            <Link to="/login">تسجيل دخول الأدمن</Link> مطلوب للحفظ على السحابة.
          </p>
        )}
        <p className="text-caption">
          إعداد PayPal والباقات من صفحة <Link to="/subscriptions">الاشتراكات</Link>.
        </p>
      </AdminCard>
    </div>
  );
}
