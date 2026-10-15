import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, isSupabaseEnabled, supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const STAFF_ROLES = ['admin', 'editor', 'reviewer'];

async function checkStaff(userId) {
  const { data, error } = await supabase.rpc('is_staff');
  if (!error) return data === true;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return STAFF_ROLES.includes(profile?.role);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(isSupabaseEnabled);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const apply = async (nextSession) => {
      if (!nextSession) {
        if (!cancelled) {
          setSession(null);
          setIsStaff(false);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      const staff = await checkStaff(nextSession.user.id);
      if (cancelled) return;
      if (!staff) {
        setAuthError('الحساب ده مش حساب إدارة. ادخلي بحساب الأدمن.');
        await supabase.auth.signOut();
        return;
      }
      setAuthError('');
      setSession(nextSession);
      setIsStaff(true);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession);
        return;
      }
      // Supabase warns against awaiting its own calls inside this callback.
      setTimeout(() => apply(nextSession), 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setIsStaff(false);
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isLoggedIn: Boolean(session) && isStaff,
      needsLogin: isSupabaseEnabled && !(session && isStaff),
      authError,
      clearAuthError: () => setAuthError(''),
      signOut,
    }),
    [session, isStaff, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export { isSupabaseConfigured, isSupabaseEnabled };
