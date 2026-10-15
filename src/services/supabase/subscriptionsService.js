import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

const STATUS_AR = {
  active: 'نشط',
  trial: 'تجربة',
  expired: 'منتهي',
  inactive: 'موقوف',
  cancelled: 'موقوف',
};

/** «شهر» / «3 شهور» / «سنة» — same wording as the app. */
export function planDurationLabel(days) {
  if (days >= 360) return days >= 720 ? `${Math.round(days / 365)} سنين` : 'سنة';
  const months = Math.round(days / 30);
  if (months <= 1) return 'شهر';
  if (months === 2) return 'شهرين';
  return `${months} شهور`;
}

export function formatUsd(value) {
  const n = Number(value);
  if (value === null || value === '' || !(n > 0)) return null;
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** Percent saved vs. buying the shortest priced plan repeatedly (matches the app). */
export function planSavings(plans) {
  let base = null;
  for (const p of plans) {
    const usd = Number(p.priceUsd);
    if (!(usd > 0) || !(p.durationDays > 0)) continue;
    if (!base || p.durationDays < base.days) base = { days: p.durationDays, usd };
  }
  return plans.map((p) => {
    const usd = Number(p.priceUsd);
    if (!base || !(usd > 0) || p.durationDays <= base.days) return null;
    const full = (base.usd * p.durationDays) / base.days;
    const pct = Math.round(((full - usd) / full) * 100);
    return pct >= 1 ? pct : null;
  });
}

export async function fetchSubscriptionPlans() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: null, offline: true };
  }
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('sort_order');
  if (error) return { data: null, error, offline: false };
  const plans = (data ?? []).map((row) => {
    const days = row.duration_days ?? 30;
    const usd = formatUsd(row.price_usd);
    return {
      id: row.id,
      title: row.name,
      price: usd ?? 'بدون سعر',
      priceSuffix: usd ? `/ ${planDurationLabel(days)}` : '',
      duration: planDurationLabel(days),
      durationDays: days,
      features: Array.isArray(row.features) ? row.features : [],
      status: row.active ? 'نشطة' : 'متوقفة',
      active: !!row.active,
      priceUsd: row.price_usd ?? '',
      subscribers: 0,
      accent: 'linear-gradient(135deg, #fff8f1, #f6e8e5)',
    };
  });
  const savings = planSavings(plans);
  let best = -1;
  savings.forEach((pct, i) => {
    if (pct != null && (best < 0 || pct > savings[best])) best = i;
  });
  return {
    data: plans.map((p, i) => ({
      ...p,
      savingsPercent: savings[i],
      badge: i === best ? 'الأكثر توفيراً' : null,
    })),
    error: null,
    offline: false,
  };
}

/** Name, USD price and features; the duration (= lesson days) is fixed per plan. */
export async function savePlan(plan) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const name = String(plan.title ?? '').trim();
  if (!name) return { error: new Error('اكتبي اسم الباقة') };
  const trimmed = String(plan.priceUsd ?? '').trim();
  const price = trimmed === '' ? null : Number(trimmed);
  if (price !== null && !(price > 0)) {
    return { error: new Error('اكتبي السعر بالدولار كرقم أكبر من صفر') };
  }
  const usd = formatUsd(price);
  const { error } = await supabase
    .from('subscription_plans')
    .update({
      name,
      price_usd: price,
      price_display: usd ? `${usd} / ${planDurationLabel(plan.durationDays)}` : '',
      features: (plan.features ?? []).map((f) => String(f).trim()).filter(Boolean),
    })
    .eq('id', plan.id);
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
        payment: paymentSourceLabel(row.store_receipt),
        lessonDays: row.lesson_days ?? 0,
        expiringSoon: endMs != null && endMs > now && endMs <= in30,
      };
    }),
    error: null,
    offline: false,
  };
}

function paymentSourceLabel(receipt) {
  if (!receipt) return '—';
  if (receipt.startsWith('sandbox:')) return 'Sandbox';
  if (receipt.startsWith('manual:')) return 'منحة من الإدارة';
  if (receipt.startsWith('paypal:')) return 'PayPal';
  return 'Store';
}

export async function grantSubscriptionByEmail(email, planId, days) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase غير مفعّل') };
  }
  const { data, error } = await supabase.rpc('admin_grant_subscription', {
    p_email: email.trim(),
    p_plan_id: planId,
    p_days: days ? Number(days) : null,
  });
  if (error) {
    const m = error.message ?? '';
    if (m.includes('not_found_user')) {
      return { data: null, error: new Error('مفيش حساب بالإيميل ده — الأم لازم تسجّل في التطبيق الأول') };
    }
    if (m.includes('not_found_plan')) return { data: null, error: new Error('الباقة مش موجودة') };
    if (m.includes('admin_grant_subscription') || m.includes('schema cache') || m.includes('lesson_day')) {
      return { data: null, error: new Error('شغّلي migration 20260526100041_freemium_lesson_days.sql في Supabase الأول') };
    }
  }
  return { data, error };
}

export async function extendSubscription(id, days = 30) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase غير مفعّل') };
  }
  const { data: row, error: fetchErr } = await supabase
    .from('user_subscriptions')
    .select('expires_at, lesson_days')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr };

  const base = row?.expires_at ? new Date(row.expires_at) : new Date();
  if (base.getTime() < Date.now()) base.setTime(Date.now());
  base.setDate(base.getDate() + days);

  // A month added by hand also opens a month of lessons, like a paid month.
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      expires_at: base.toISOString(),
      lesson_days: (row?.lesson_days ?? 0) + days,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error };
}

const PAYMENT_KIND_AR = { subscription: 'باقة', course: 'دورة', book: 'كتاب' };

/** Asks PayPal about an order (and completes it if the buyer approved). Staff only. */
export async function inspectPaypalOrder(orderId) {
  if (!isSupabaseEnabled || !supabase) return { data: null, error: new Error('Supabase غير مفعّل') };
  const { data, error } = await supabase.functions.invoke('paypal-checkout', {
    body: { action: 'inspect', order_id: orderId },
  });
  if (error) {
    let code = '';
    try {
      code = (await error.context?.json?.())?.error ?? '';
    } catch {
      code = '';
    }
    if (code === 'forbidden') return { data: null, error: new Error('الفحص للإدارة بس.') };
    if (code === 'not_found') return { data: null, error: new Error('الطلب مش موجود.') };
    if (code === 'bad_request') {
      return { data: null, error: new Error('ارفعي آخر نسخة من فانكشن paypal-checkout على Supabase علشان الفحص يشتغل.') };
    }
    return { data: null, error: new Error(code || error.message || 'تعذّر الفحص') };
  }
  return { data: { ...data, explanation: explainPaypalOrder(data) }, error: null };
}

const ISSUE_AR = {
  INSTRUMENT_DECLINED: 'وسيلة الدفع (الكارت أو الحساب) اترفضت من PayPal أو البنك.',
  PAYER_ACCOUNT_RESTRICTED: 'حساب PayPal بتاع الأم مقيّد ومش مسموحله يدفع.',
  PAYER_CANNOT_PAY: 'PayPal مش مسموح للأم تدفع بالحساب ده (غالباً بسبب بلد الحساب).',
  PAYEE_ACCOUNT_RESTRICTED: 'حساب التاجر (Business) مقيّد ومش بيستلم فلوس — ادخلي عليه في PayPal وشوفي التنبيهات.',
  PAYEE_ACCOUNT_LOCKED_OR_CLOSED: 'حساب التاجر (Business) مقفول أو موقوف.',
  PAYEE_ACCOUNT_INVALID: 'حساب التاجر مش صالح — اتأكدي إن الـ App مربوط بحساب Business سليم.',
  COMPLIANCE_VIOLATION: 'PayPal رفض الدفعة لأسباب قانونية/امتثال (غالباً بلد المشتري أو التاجر).',
  ORDER_NOT_APPROVED: 'الأم ما وافقتش على الدفع في صفحة PayPal.',
  MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED: 'محاولات كتير على نفس الطلب — اعملي طلب جديد.',
  TRANSACTION_REFUSED: 'PayPal رفض العملية.',
};

const CAPTURE_REASON_AR = {
  RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION:
    'الفلوس وصلت لحساب التاجر بس معلّقة لأنها بعملة مش موجودة عنده. ادخلي حساب الـ Business على PayPal → Activity → Accept، وغيّري الإعدادات علشان يقبل الدولار لوحده.',
  PENDING_REVIEW: 'PayPal بيراجع الدفعة، وهتتفعّل لوحدها لما يخلص.',
  UNILATERAL: 'حساب التاجر مش متأكَّد (الإيميل مش مفعّل) — فعّليه من PayPal.',
  VERIFICATION_REQUIRED: 'حساب التاجر محتاج توثيق قبل ما يستلم.',
  ECHECK: 'الدفع بشيك إلكتروني وبياخد كام يوم.',
};

export function explainPaypalOrder(r) {
  if (!r) return '';
  const env = r.env === 'live' ? 'Live' : 'Sandbox';
  if (r.localStatus === 'completed' || r.attempt?.ok) return 'الدفعة اتحصّلت ✅ والحاجة اتفتحت للأم.';
  if (r.found === false) {
    return `PayPal (${env}) مش لاقي الطلب ده بالمفاتيح الحالية. غالباً الطلب اتعمل بمفاتيح App تاني قبل ما تغيّريها، أو PAYPAL_ENV اتغيّر. الطلب ده مش هيكمل — اعملي دفعة جديدة.`;
  }
  const issue = r.attempt?.detail?.captureError?.issue;
  if (issue) return ISSUE_AR[issue] ?? `PayPal رفض السحب: ${issue}`;
  const reason = r.captureReason ?? r.attempt?.detail?.captureReason;
  if (reason) return CAPTURE_REASON_AR[reason] ?? `الدفعة معلّقة عند PayPal: ${reason}`;
  if (r.paypalStatus === 'CREATED' || r.paypalStatus === 'PAYER_ACTION_REQUIRED') {
    return 'الأم ما كمّلتش الموافقة في صفحة PayPal — يا إما قفلت الصفحة، يا إما PayPal رفض حسابها (رسالة «لم نتمكن من معالجة مدفوعاتك»). لو الأخير: جرّبي حساب مشتري تاني (في التجربة: Personal بلده United States).';
  }
  if (r.paypalStatus === 'VOIDED') return 'الطلب اتلغى أو انتهت صلاحيته عند PayPal — اعملي طلب جديد.';
  return `حالة الطلب عند PayPal: ${r.paypalStatus ?? 'غير معروفة'}.`;
}

export async function fetchPaypalOrders() {
  if (!isSupabaseEnabled || !supabase) return { data: [], error: null };
  const { data, error } = await supabase.rpc('admin_paypal_orders');
  if (error) {
    const m = error.message ?? '';
    if (m.includes('admin_paypal_orders') || m.includes('schema cache')) {
      return { data: [], error: new Error('شغّلي migration 20260526100044_admin_payments_log.sql في Supabase علشان سجل المدفوعات') };
    }
    return { data: [], error };
  }
  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email ?? '',
      name: row.display_name ?? '',
      kind: row.kind,
      kindLabel: PAYMENT_KIND_AR[row.kind] ?? row.kind,
      itemTitle: row.item_title ?? row.item_id,
      amount: Number(row.amount) || 0,
      currency: row.currency ?? 'USD',
      paid: row.status === 'completed',
      createdAt: row.created_at,
      completedAt: row.completed_at,
    })),
    error: null,
  };
}
