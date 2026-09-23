import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

export async function fetchSubscriptionReport() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const [{ data: plans, error: plansErr }, { data: subs, error: subsErr }] =
    await Promise.all([
      supabase
        .from('subscription_plans')
        .select('id, name, price_display, active')
        .order('sort_order'),
      supabase.from('user_subscriptions').select('plan_id, status, expires_at'),
    ]);

  if (plansErr || subsErr) {
    return { data: null, error: plansErr || subsErr, offline: false };
  }

  const now = Date.now();
  const rows = (plans ?? []).map((p) => {
    const related = (subs ?? []).filter((s) => s.plan_id === p.id);
    const active = related.filter((s) => {
      if (s.status !== 'active' && s.status !== 'trial') return false;
      if (!s.expires_at) return true;
      return new Date(s.expires_at).getTime() > now;
    }).length;
    const cancelled = related.filter(
      (s) => s.status === 'cancelled' || s.status === 'expired',
    ).length;
    return {
      plan: p.name,
      planId: p.id,
      active,
      churn: cancelled,
      priceDisplay: p.price_display ?? '—',
    };
  });

  const activeTotal = rows.reduce((n, r) => n + r.active, 0);

  return {
    data: {
      rows,
      activeTotal,
      mrrHint: `${activeTotal} مشترك نشط`,
    },
    error: null,
    offline: false,
  };
}
