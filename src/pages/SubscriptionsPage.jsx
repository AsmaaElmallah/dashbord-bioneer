import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { GrantSubscriptionCard } from '../components/GrantSubscriptionCard';
import { PaymentSettingsCard } from '../components/PaymentSettingsCard';
import { PaymentsLogCard } from '../components/PaymentsLogCard';
import {
  extendSubscription,
  fetchSubscriptionPlans,
  fetchUserSubscriptions,
  savePlan,
  setPlanActive,
} from '../services/supabase/subscriptionsService';

/** الأدمن بتعدّل الاسم والسعر بالدولار والمميزات. المدة ثابتة لأنها هي أيام الدروس اللي بتتفتح. */
function PlanEditor({ plan, onSaved }) {
  const { showError, showSuccess } = useSnackbar();
  const initial = useMemo(
    () => ({
      title: plan.title ?? '',
      priceUsd: String(plan.priceUsd ?? ''),
      features: (plan.features ?? []).join('\n'),
    }),
    [plan],
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);

  const dirty =
    form.title !== initial.title || form.priceUsd.trim() !== initial.priceUsd || form.features !== initial.features;
  const price = Number(form.priceUsd);
  const tooLow = form.priceUsd.trim() !== '' && price > 0 && price < 1;

  const onSave = async () => {
    setSaving(true);
    const { error } = await savePlan({
      id: plan.id,
      title: form.title,
      priceUsd: form.priceUsd,
      durationDays: plan.durationDays,
      features: form.features.split('\n'),
    });
    setSaving(false);
    if (error) {
      showError(error.message ?? 'تعذّر حفظ الباقة');
      return;
    }
    showSuccess('تم حفظ الباقة');
    onSaved?.();
  };

  return (
    <div className="page-stack" style={{ gap: 8, marginTop: 12 }}>
      <label className="cms-field">
        اسم الباقة
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </label>
      <label className="cms-field">
        السعر بالدولار (ده اللي بيظهر للأم وبيتدفع في PayPal)
        <input
          type="number"
          min="0"
          step="0.01"
          dir="ltr"
          placeholder="9.99"
          value={form.priceUsd}
          onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
        />
      </label>
      {tooLow && (
        <p style={{ margin: 0, color: 'var(--error, #b3261e)', fontWeight: 700 }}>
          ⚠️ السعر أقل من دولار — ده سعر تجريبي. غيّريه قبل ما التطبيق ينزل للناس.
        </p>
      )}
      {form.priceUsd.trim() === '' && (
        <p className="text-caption" style={{ margin: 0 }}>
          من غير سعر الباقة هتظهر «السعر هيتحدد قريب» ومحدش هيقدر يشتريها.
        </p>
      )}
      <label className="cms-field">
        المميزات (كل ميزة في سطر)
        <textarea
          rows={4}
          value={form.features}
          onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
        />
      </label>
      {dirty && (
        <div>
          <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
            {saving ? 'جاري الحفظ…' : 'حفظ الباقة'}
          </button>
        </div>
      )}
    </div>
  );
}

const statusTone = {
  نشط: 'success',
  منتهي: 'muted',
  تجربة: 'info',
  موقوف: 'error',
};

export function SubscriptionsPage() {
  const { showMock } = useSnackbar();
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remotePlans, setRemotePlans] = useState([]);
  const [remoteSubs, setRemoteSubs] = useState([]);

  const plans = remotePlans ?? [];
  const subscriptions = remoteSubs ?? [];

  const reload = async () => {
    if (!isSupabaseEnabled) return;
    setLoading(true);
    const [p, s] = await Promise.all([
      fetchSubscriptionPlans(),
      fetchUserSubscriptions(),
    ]);
    setRemotePlans(p.data ?? []);
    setRemoteSubs(s.data ?? []);
    if (p.error || s.error) showMock('تعذّر تحميل الاشتراكات من Supabase');
    setLoading(false);
  };

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [p, s] = await Promise.all([
        fetchSubscriptionPlans(),
        fetchUserSubscriptions(),
      ]);
      if (!cancelled) {
        setRemotePlans(p.data ?? []);
        setRemoteSubs(s.data ?? []);
        if (p.error || s.error) showMock('تعذّر تحميل الاشتراكات من Supabase');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showMock]);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (filterPlan !== 'all' && s.planId !== filterPlan) return false;
      if (filterStatus !== 'all' && s.statusKey !== filterStatus) return false;
      if (expiringOnly && !s.expiringSoon) return false;
      return true;
    });
  }, [subscriptions, filterPlan, filterStatus, expiringOnly]);

  const selected = subscriptions.find((s) => s.id === selectedId);

  const counts = useMemo(() => {
    const map = {};
    for (const s of subscriptions) {
      if (s.statusKey === 'active' || s.statusKey === 'trial') {
        map[s.planId] = (map[s.planId] ?? 0) + 1;
      }
    }
    return map;
  }, [subscriptions]);

  return (
    <div className="page-stack">
      <PageHeader
        title="الاشتراكات والباقات"
      />

      <SectionHeader title="الباقات الحالية" />
      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل الاشتراكات…" />
        </AdminCard>
      )}
      {!loading && plans.length === 0 && (
        <EmptyState title="لا باقات" description="مافيش باقات على السحابة بعد." />
      )}
      <div className="grid-2">
        {plans.map((p) => (
          <AdminCard
            key={p.id}
            className="plan-card"
            style={{ background: p.accent, borderColor: 'rgba(183, 123, 114, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
              <h3 style={{ margin: 0 }}>{p.title}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.badge && <StatusBadge tone="warning">{p.badge}</StatusBadge>}
                {p.savingsPercent != null && <StatusBadge tone="info">وفّري {p.savingsPercent}%</StatusBadge>}
                {Number(p.priceUsd) > 0 && Number(p.priceUsd) < 1 && (
                  <StatusBadge tone="error">سعر تجريبي</StatusBadge>
                )}
                <StatusBadge tone={p.active !== false ? 'success' : 'muted'}>
                  {p.status}
                </StatusBadge>
              </div>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
              {p.price} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.priceSuffix}</span>
            </p>
            <p className="text-caption">
              المدة: {p.duration} — بتفتح {p.durationDays} يوم من الدروس الأربعة (ثابتة)
            </p>
            <p style={{ margin: '8px 0' }}>
              مشتركون نشطون: <strong>{counts[p.id] ?? p.subscribers ?? 0}</strong>
            </p>
            {isSupabaseEnabled && <PlanEditor plan={p} onSaved={reload} />}
            {isSupabaseEnabled && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  disabled={busyId === p.id}
                  onClick={async () => {
                    const activating = p.active === false;
                    if (!activating && !window.confirm(`إيقاف «${p.title}»؟ الأمهات مش هيقدروا يشتركوا فيها لحد ما تفعّليها تاني.`)) return;
                    setBusyId(p.id);
                    const { error } = await setPlanActive(p.id, activating);
                    setBusyId(null);
                    if (error) showMock('تعذّر تحديث حالة الباقة');
                    else {
                      showMock(activating ? 'تم تفعيل الباقة' : 'تم إيقاف الباقة');
                      await reload();
                    }
                  }}
                >
                  {busyId === p.id ? 'جاري…' : p.active === false ? 'تفعيل الباقة' : 'إيقاف الباقة'}
                </button>
              </div>
            )}
          </AdminCard>
        ))}
      </div>

      {isSupabaseEnabled && (
        <>
          <PaymentSettingsCard />
          <GrantSubscriptionCard plans={plans} onGranted={reload} />
        </>
      )}

      <AdminCard>
        <SectionHeader title="جدول الاشتراكات" />
        <div className="filters-row">
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">كل الباقات</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="trial">تجربة</option>
            <option value="expired">منتهي</option>
            <option value="inactive">موقوف</option>
            <option value="cancelled">ملغى</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => setExpiringOnly(e.target.checked)}
            />
            قريب الانتهاء (30 يوم)
          </label>
          {isSupabaseEnabled && (
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              تحديث
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="لا اشتراكات" description="غيّري الفلاتر لعرض نتائج" />
        ) : (
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ولي الأمر</th>
                  <th>الباقة</th>
                  <th>البداية</th>
                  <th>الانتهاء</th>
                  <th>الحالة</th>
                  <th>أيام الدروس المفتوحة</th>
                  <th>مصدر الدفع</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? 'selected' : ''}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <td>{s.parent}</td>
                    <td>{s.plan}</td>
                    <td>{s.start}</td>
                    <td>
                      {s.end}
                      {s.expiringSoon && (
                        <>
                          {' '}
                          <StatusBadge tone="warning">قريب</StatusBadge>
                        </>
                      )}
                    </td>
                    <td>
                      <StatusBadge tone={statusTone[s.status] || 'muted'}>{s.status}</StatusBadge>
                    </td>
                    <td>{s.lessonDays}</td>
                    <td>{s.payment}</td>
                    <td>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        disabled={!isSupabaseEnabled || busyId === s.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm(`تمديد اشتراك ${s.parent} 30 يوم مجاناً وفتح 30 يوم دروس؟`)) return;
                          setBusyId(s.id);
                          const { error } = await extendSubscription(s.id, 30);
                          setBusyId(null);
                          if (error) showMock('تعذّر التمديد');
                          else {
                            showMock('تم التمديد 30 يوم وفتح 30 يوم دروس');
                            await reload();
                          }
                        }}
                      >
                        {busyId === s.id ? 'جاري…' : 'تمديد'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        )}

        {selected && (
          <div className="detail-panel" style={{ marginTop: 16 }}>
            <p>
              <strong>محدد:</strong> {selected.parent} — {selected.plan} ({selected.status})
            </p>
          </div>
        )}
      </AdminCard>

      {isSupabaseEnabled && <PaymentsLogCard />}
    </div>
  );
}
