import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, isSupabaseEnabled, supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isLoggedIn: Boolean(session),
      needsLogin: isSupabaseEnabled && !session,
      signOut,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export { isSupabaseConfigured, isSupabaseEnabled };
