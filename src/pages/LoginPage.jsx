import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { AdminCard } from '../components/AdminCard';
import { useAuth, isSupabaseEnabled } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();
  const redirectTo = location.state?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="login-page">
        <p className="text-caption">جاري التحقق من الجلسة…</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isSupabaseEnabled || !supabase) {
      setError('Supabase غير مفعّل — أضف .env وفعّل VITE_USE_SUPABASE=true');
      return;
    }

    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(translateLoginError(signInError.message));
        return;
      }

      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <AdminCard className="login-page__card">
        <div className="login-page__brand">
          <div className="admin-avatar login-page__avatar">ب</div>
          <h1 className="text-title">بيانور — لوحة التحكم</h1>
          <p className="text-caption">سجّلي الدخول لإدارة المحتوى على Supabase</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="login-page__warn" role="alert">
            أضيفي <code>VITE_SUPABASE_URL</code> و <code>VITE_SUPABASE_ANON_KEY</code> في ملف{' '}
            <code>.env</code>
          </p>
        )}

        {isSupabaseConfigured && !isSupabaseEnabled && (
          <p className="login-page__warn" role="alert">
            Supabase مُعدّ لكن معطّل — غيّري <code>VITE_USE_SUPABASE=true</code> في <code>.env</code>
          </p>
        )}

        <form className="login-page__form" onSubmit={handleSubmit}>
          <label className="cms-field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </label>

          <label className="cms-field">
            <span>كلمة المرور</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </label>

          {error ? (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mock-btn mock-btn--primary login-page__submit"
            disabled={submitting || !isSupabaseEnabled}
          >
            <LogIn size={18} aria-hidden />
            {submitting ? 'جاري الدخول…' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="text-caption login-page__hint">
          حساب الأدمن يُنشأ من Supabase Auth ثم <code>role = admin</code> في جدول profiles.
        </p>

        <Link to="/" className="login-page__back">
          العودة للوحة (وضع محلي)
        </Link>
      </AdminCard>
    </div>
  );
}

function translateLoginError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('invalid login credentials')) {
    return 'البريد أو كلمة المرور غير صحيحة.';
  }
  if (m.includes('email not confirmed')) {
    return 'يرجى تأكيد البريد الإلكتروني أولاً.';
  }
  return message ?? 'تعذّر تسجيل الدخول.';
}
