import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, isSupabaseEnabled, supabase } from '../lib/supabaseClient';
import './LoginPage.css';

function LoginLayout({ children, title, description }) {
  return (
    <div className="login-page">
      <div className="login-page__orb login-page__orb--1" aria-hidden />
      <div className="login-page__orb login-page__orb--2" aria-hidden />
      <div className="login-page__orb login-page__orb--3" aria-hidden />

      <div className="login-page__inner">
        <div className="login-page__brand">
          <div className="login-page__logo" aria-hidden>
            ب
          </div>
          <h1 className="login-page__brand-name">بيانور</h1>
          <p className="login-page__brand-tag">لوحة تحكم المحتوى التعليمي</p>
        </div>

        <div className="login-page__card">
          <h2 className="login-page__card-title">{title}</h2>
          {description && <p className="login-page__card-desc">{description}</p>}
          {children}
        </div>

        <Link to="/" className="login-page__back">
          <ArrowRight size={16} aria-hidden />
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );
}

function translateAuthError(message) {
  const m = message?.toLowerCase() ?? '';
  if (m.includes('invalid login credentials')) return 'البريد أو كلمة المرور غير صحيحة.';
  if (m.includes('email not confirmed')) return 'يرجى تأكيد البريد من رابط Supabase أولاً.';
  if (m.includes('too many requests')) return 'محاولات كثيرة — انتظري دقيقة ثم أعيدي المحاولة.';
  return message;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const from = location.state?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [authLoading, isLoggedIn, from, navigate]);

  if (!isSupabaseConfigured) {
    return (
      <LoginLayout
        title="تسجيل الدخول"
        description="إعداد Supabase غير مكتمل بعد."
      >
        <p className="login-page__hint">
          انسخي <code>.env.example</code> إلى <code>.env</code> وأضيفي مفاتيح المشروع، ثم فعّلي{' '}
          <code>VITE_USE_SUPABASE=true</code>.
        </p>
      </LoginLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signError) {
      setError(translateAuthError(signError.message));
      return;
    }

    navigate(from, { replace: true });
  };

  if (authLoading) {
    return (
      <LoginLayout title="جاري التحقق…" description="نتحقق من جلستك الحالية.">
        <button type="button" className="login-page__submit" disabled>
          انتظري لحظة…
        </button>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout
      title="دخول الأدمن"
      description="أدخلي بيانات حسابك المصرّح له في Supabase (صلاحية admin أو editor)."
    >
      <form onSubmit={handleSubmit} className="login-page__form">
        <div className="login-page__field">
          <label htmlFor="login-email">البريد الإلكتروني</label>
          <div className="login-page__input-wrap">
            <Mail size={18} aria-hidden />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>

        <div className="login-page__field">
          <label htmlFor="login-password">كلمة المرور</label>
          <div className="login-page__input-wrap">
            <Lock size={18} aria-hidden />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <div className="login-page__error" role="alert">
            <AlertCircle size={18} aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="login-page__submit" disabled={loading}>
          {loading ? 'جاري الدخول…' : 'تسجيل الدخول'}
        </button>
      </form>

      {!isSupabaseEnabled && (
        <div className="login-page__footer">
          <p className="login-page__hint">يمكنكِ متابعة العمل في الوضع المحلي بدون سحابة.</p>
        </div>
      )}
    </LoginLayout>
  );
}
