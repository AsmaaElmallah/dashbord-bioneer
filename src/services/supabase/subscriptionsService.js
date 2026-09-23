import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const STATUS_AR = {
  active: 'نشط',
  trial: 'تجربة',
  expired: 'منتهي',
  inactive: 'موقوف',
  cancelled: 'موقوف',
};

export async function fetchSubscriptionPlans() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('sort_order');
  if (error) return { data: null, error, offline: false };
  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      title: row.name,
      price: row.price_display ?? '—',
      priceSuffix: '',
      duration: `${row.duration_days ?? 30} يوم`,
      durationDays: row.duration_days ?? 30,
      features: Array.isArray(row.features) ? row.features : [],
      status: row.active ? 'نشطة' : 'متوقفة',
      active: !!row.active,
      storeIos: row.store_product_id_ios ?? '',
      storeAndroid: row.store_product_id_android ?? '',
      subscribers: 0,
      revenue: '—',
      accent: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
      badge: row.id === 'gold' ? 'الأكثر توفيراً' : null,
    })),
    error: null,
    offline: false,
  };
}

export async function upsertSubscriptionPlan(plan) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const { error } = await supabase.from('subscription_plans').upsert({
    id: plan.id,
    name: plan.title,
    price_display: plan.price,
    duration_days: Number(plan.durationDays) || 30,
    features: plan.features ?? [],
    active: plan.active !== false,
    sort_order: Number(plan.sortOrder) || 0,
    store_product_id_ios: plan.storeIos || null,
    store_product_id_android: plan.storeAndroid || null,
  });
  return { error };
}

export async function setPlanActive(id, active) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const { error } = await supabase
    .from('subscription_plans')
    .update({ active })
    .eq('id', id);
  return { error };
}

export async function fetchUserSubscriptions() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }

  const [{ data: subs, error }, { data: profiles }, { data: plans }] =
    await Promise.all([
      supabase
        .from('user_subscriptions')
        .select('*')
        .order('updated_at', { ascending: false }),
      supabase.from('profiles').select('id, display_name'),
      supabase.from('subscription_plans').select('id, name'),
    ]);

  if (error) return { data: null, error, offline: false };

  const nameById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.display_name ?? '—']),
  );
  const planNameById = Object.fromEntries(
    (plans ?? []).map((p) => [p.id, p.name]),
  );

  const now = Date.now();
  const in30 = now + 30 * 24 * 60 * 60 * 1000;

  return {
    data: (subs ?? []).map((row) => {
      const endMs = row.expires_at ? new Date(row.expires_at).getTime() : null;
      return {
        id: row.id,
        parent: nameById[row.user_id] ?? '—',
        child: '—',
        planId: row.plan_id,
        plan: planNameById[row.plan_id] ?? row.plan_id ?? '—',
        start: row.created_at
          ? new Date(row.created_at).toLocaleDateString('ar-EG')
          : '—',
        end: row.expires_at
          ? new Date(row.expires_at).toLocaleDateString('ar-EG')
          : '—',
        status: STATUS_AR[row.status] ?? row.status,
        statusKey: row.status,
        payment: row.store_receipt?.startsWith('sandbox:')
          ? 'Sandbox'
          : row.store_receipt
            ? 'Store'
            : '—',
        expiringSoon: endMs != null && endMs > now && endMs <= in30,
      };
    }),
    error: null,
    offline: false,
  };
}

export async function extendSubscription(id, days = 30) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const { data: row, error: fetchErr } = await supabase
    .from('user_subscriptions')
    .select('expires_at')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr };

  const base = row?.expires_at ? new Date(row.expires_at) : new Date();
  if (base.getTime() < Date.now()) base.setTime(Date.now());
  base.setDate(base.getDate() + days);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      expires_at: base.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error };
}
