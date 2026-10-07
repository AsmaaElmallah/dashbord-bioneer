import { useEffect, useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { MockActionButton } from '../components/MockActionButton';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { plans as mockPlans, subscriptions as mockSubs } from '../data/mockData';
import { GrantSubscriptionCard } from '../components/GrantSubscriptionCard';
import { PaymentSettingsCard } from '../components/PaymentSettingsCard';
import {
  extendSubscription,
  fetchSubscriptionPlans,
  fetchUserSubscriptions,
  setPlanActive,
  setPlanPriceUsd,
} from '../services/supabase/subscriptionsService';

function PlanUsdPrice({ plan, onSaved }) {
  const { showError, showSuccess } = useSnackbar();
  const [value, setValue] = useState(String(plan.priceUsd ?? ''));
  const [saving, setSaving] = useState(false);
  const dirty = value.trim() !== String(plan.priceUsd ?? '');

  const onSave = async () => {
    setSaving(true);
    const { error } = await setPlanPriceUsd(plan.id, value);
    setSaving(false);
    if (error) {
      showError(error.message?.includes('price_usd')
        ? 'شغّلي migration 20260526100024_payments.sql في Supabase الأول'
        : error.message ?? 'تعذّر حفظ السعر');
      return;
    }
    showSuccess('تم حفظ السعر بالدولار');
    onSaved?.();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
      <span className="text-caption">سعر PayPal بالدولار:</span>
      <input
        type="number"
        min="0"
        step="0.01"
        dir="ltr"
        placeholder="5"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: 90 }}
      />
      {dirty && (
        <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
          {saving ? '…' : 'حفظ'}
        </button>
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
  const [loading, setLoading] = useState(false);
  const [remotePlans, setRemotePlans] = useState(null);
  const [remoteSubs, setRemoteSubs] = useState(null);

  const plans = isSupabaseEnabled && remotePlans ? remotePlans : mockPlans;
  const subscriptions =
    isSupabaseEnabled && remoteSubs ? remoteSubs : mockSubs;

  const reload = async () => {
    if (!isSupabaseEnabled) return;
    setLoading(true);
    const [p, s] = await Promise.all([
      fetchSubscriptionPlans(),
      fetchUserSubscriptions(),
    ]);
    if (p.data) setRemotePlans(p.data);
    if (s.data) setRemoteSubs(s.data);
    if (p.error || s.error) showMock('تعذّر تحميل الاشتراكات من Supabase');
    setLoading(false);
  };

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [p, s] = await Promise.all([
        fetchSubscriptionPlans(),
        fetchUserSubscriptions(),
      ]);
      if (!cancelled) {
        if (p.data) setRemotePlans(p.data);
        if (s.data) setRemoteSubs(s.data);
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
        extraBadges={isSupabaseEnabled && remotePlans ? ['Supabase'] : ['mock data']}
      />

      <SectionHeader title="الباقات الحالية" />
      {loading && (
        <AdminCard>
          <MockLoading label="جاري تحميل الاشتراكات…" />
        </AdminCard>
      )}
      <div className="grid-2">
        {plans.map((p) => (
          <AdminCard
            key={p.id}
            className="plan-card"
            style={{ background: p.accent, borderColor: 'rgba(109, 40, 217, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
              <h3 style={{ margin: 0 }}>{p.title}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.badge && <StatusBadge tone="warning">{p.badge}</StatusBadge>}
                <StatusBadge tone={p.active !== false ? 'success' : 'muted'}>
                  {p.status}
                </StatusBadge>
              </div>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
              {p.price} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.priceSuffix}</span>
            </p>
            <p className="text-caption">المدة: {p.duration}</p>
            <p style={{ margin: '8px 0' }}>
              مشتركون نشطون: <strong>{counts[p.id] ?? p.subscribers ?? 0}</strong>
            </p>
            {(p.storeIos || p.storeAndroid) && (
              <p className="text-caption">
                Store: {p.storeIos || '—'} / {p.storeAndroid || '—'}
              </p>
            )}
            <ul style={{ margin: '12px 0 0', paddingRight: 20, fontSize: '0.85rem', lineHeight: 1.55 }}>
              {(p.features ?? []).slice(0, 3).map((f) => (
                <li key={f}>{f}</li>
              ))}
              {(p.features?.length ?? 0) > 3 && (
                <li className="text-caption">+ {p.features.length - 3} مميزات أخرى…</li>
              )}
            </ul>
            {isSupabaseEnabled && remotePlans && <PlanUsdPrice plan={p} onSaved={reload} />}
            {isSupabaseEnabled && (
              <div style={{ marginTop: 12 }}>
                <MockActionButton
                  variant="outline"
                  onClick={async () => {
                    const { error } = await setPlanActive(p.id, p.active === false);
                    if (error) showMock('تعذّر تحديث حالة الباقة');
                    else await reload();
                  }}
                >
                  {p.active === false ? 'تفعيل الباقة' : 'إيقاف الباقة'}
                </MockActionButton>
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
            <MockActionButton variant="outline" onClick={reload}>
              تحديث
            </MockActionButton>
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
                    <td>{s.payment}</td>
                    <td>
                      <MockActionButton
                        variant="outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!isSupabaseEnabled) {
                            showMock();
                            return;
                          }
                          const { error } = await extendSubscription(s.id, 30);
                          if (error) showMock('تعذّر التمديد');
                          else {
                            showMock('تم التمديد 30 يوماً');
                            await reload();
                          }
                        }}
                      >
                        تمديد
                      </MockActionButton>
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
    </div>
  );
}
