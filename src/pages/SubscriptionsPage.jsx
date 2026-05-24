import { useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { plans, subscriptions } from '../data/mockData';

const statusTone = {
  نشط: 'success',
  منتهي: 'muted',
  تجربة: 'info',
  موقوف: 'error',
};

export function SubscriptionsPage() {
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (filterPlan !== 'all' && s.planId !== filterPlan) return false;
      if (filterStatus !== 'all' && s.statusKey !== filterStatus) return false;
      if (expiringOnly && !s.expiringSoon) return false;
      return true;
    });
  }, [filterPlan, filterStatus, expiringOnly]);

  const selected = subscriptions.find((s) => s.id === selectedId);

  return (
    <div className="page-stack">
      <PageHeader title="الاشتراكات والباقات" />

      <InfoBanner tone="warning">
        الدفع غير متصل فعلياً (لا Apple Pay / Google Play / بوابة Visa حقيقية). هذه الصفحة UI فقط
        للعرض والتخطيط — أي زر يعرض تنبيهاً «UI فقط».
      </InfoBanner>

      <SectionHeader title="الباقات الحالية" />
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
                <StatusBadge tone="success">{p.status}</StatusBadge>
              </div>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
              {p.price} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.priceSuffix}</span>
            </p>
            <p className="text-caption">المدة: {p.duration}</p>
            <p style={{ margin: '8px 0' }}>
              مشتركون: <strong>{p.subscribers}</strong> — إيراد تقديري: <strong>{p.revenue}</strong>
            </p>
            <ul style={{ margin: '12px 0 0', paddingRight: 20, fontSize: '0.85rem', lineHeight: 1.55 }}>
              {p.features.slice(0, 3).map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li className="text-caption">+ {p.features.length - 3} مميزات أخرى…</li>
            </ul>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <SectionHeader title="جدول الاشتراكات" />
        <div className="filters-row">
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">كل الباقات</option>
            <option value="monthly">شهرية</option>
            <option value="bronze">برونزية</option>
            <option value="silver">فضية</option>
            <option value="gold">ذهبية</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="trial">تجربة</option>
            <option value="expired">منتهي</option>
            <option value="paused">موقوف</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => setExpiringOnly(e.target.checked)}
            />
            قريب الانتهاء (30 يوم)
          </label>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="لا اشتراكات" description="غيّري الفلاتر لعرض نتائج" />
        ) : (
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ولي الأمر</th>
                  <th>الطفل</th>
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
                    <td>{s.child}</td>
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
                        onClick={() => setSelectedId(s.id)}
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
              <strong>محدد:</strong> {selected.parent} — {selected.child} ({selected.plan})
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <MockActionButton>إيقاف</MockActionButton>
          <MockActionButton variant="secondary">تغيير الباقة</MockActionButton>
          <MockActionButton variant="outline">إرسال تذكير</MockActionButton>
          <MockActionButton variant="outline">تمديد الكل المحدد</MockActionButton>
        </div>
      </AdminCard>
    </div>
  );
}
