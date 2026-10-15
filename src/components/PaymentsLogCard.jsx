import { RefreshCw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { fetchPaypalOrders, inspectPaypalOrder } from '../services/supabase/subscriptionsService';

function usd(n) {
  return `$${n.toFixed(2)}`;
}

function sameMonth(iso, now) {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** كل ضغطة «ادفعي» بتعمل طلب؛ «ما اكتملش» يعني الأم ما كمّلتش الدفع ومفيش فلوس اتخصمت. */
export function PaymentsLogCard() {
  const { showError } = useSnackbar();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState('all');
  const [inspectingId, setInspectingId] = useState(null);
  const [inspection, setInspection] = useState(null);

  const onInspect = async (order) => {
    setInspectingId(order.id);
    const { data, error } = await inspectPaypalOrder(order.id);
    setInspectingId(null);
    if (error) {
      showError(error.message);
      return;
    }
    setInspection({ order, result: data });
    if (data.localStatus === 'completed' || data.attempt?.ok) await reload();
  };

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchPaypalOrders();
    setLoading(false);
    if (error) showError(error.message ?? 'تعذّر تحميل سجل المدفوعات');
    setItems(data);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const stats = useMemo(() => {
    const now = new Date();
    const paidThisMonth = items.filter((o) => o.paid && sameMonth(o.completedAt ?? o.createdAt, now));
    const byKind = { subscription: 0, course: 0, book: 0 };
    for (const o of paidThisMonth) byKind[o.kind] = (byKind[o.kind] ?? 0) + o.amount;
    return {
      total: paidThisMonth.reduce((sum, o) => sum + o.amount, 0),
      count: paidThisMonth.length,
      byKind,
      allTime: items.filter((o) => o.paid).reduce((sum, o) => sum + o.amount, 0),
      unfinished: items.filter((o) => !o.paid && sameMonth(o.createdAt, now)).length,
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((o) => {
      if (status === 'paid' && !o.paid) return false;
      if (status === 'unfinished' && o.paid) return false;
      if (kind !== 'all' && o.kind !== kind) return false;
      if (q && !o.email.toLowerCase().includes(q) && !o.name.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, search, status, kind]);

  return (
    <AdminCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SectionHeader title="سجل المدفوعات (PayPal)" />
        <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>
      <p className="text-caption" style={{ margin: '4px 0 12px' }}>
        كل مرة أم بتدوس «ادفعي» بيتسجّل طلب هنا. «تم الدفع» = الفلوس اتحصّلت والحاجة اتفتحت. «ما اكتملش» = ما كمّلتش الدفع ومفيش فلوس اتخصمت منها.
        رقم الطلب هو نفسه اللي في حسابك على PayPal.
      </p>

      <div className="grid-4" style={{ marginBottom: 12 }}>
        <StatCard
          label="اتحصّل الشهر ده"
          value={usd(stats.total)}
          sub={`باقات ${usd(stats.byKind.subscription)} · دورات ${usd(stats.byKind.course)} · كتب ${usd(stats.byKind.book)}`}
        />
        <StatCard label="دفعات الشهر ده" value={String(stats.count)} />
        <StatCard label="ما اكتملش الشهر ده" value={String(stats.unfinished)} />
        <StatCard label="إجمالي من البداية" value={usd(stats.allTime)} />
      </div>

      <div className="filters-row">
        <input
          type="search"
          placeholder="ابحثي بالإيميل أو الاسم أو رقم الطلب"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="paid">تم الدفع</option>
          <option value="unfinished">ما اكتملش</option>
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">كل الأنواع</option>
          <option value="subscription">باقات</option>
          <option value="course">دورات</option>
          <option value="book">كتب</option>
        </select>
      </div>

      {loading ? (
        <MockLoading label="جاري تحميل المدفوعات…" />
      ) : visible.length === 0 ? (
        <EmptyState
          title="لا مدفوعات"
          description={items.length ? 'غيّري البحث أو الفلاتر.' : 'لما أم تدفع بـ PayPal هتظهر هنا.'}
          compact
        />
      ) : (
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الإيميل</th>
                <th>الاسم</th>
                <th>اشترت إيه</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>رقم الطلب</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.completedAt ?? o.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td dir="ltr">{o.email || '—'}</td>
                  <td>{o.name || '—'}</td>
                  <td>
                    {o.kindLabel}: {o.itemTitle}
                  </td>
                  <td dir="ltr">
                    {usd(o.amount)}
                    {o.currency !== 'USD' ? ` ${o.currency}` : ''}
                  </td>
                  <td>
                    <StatusBadge tone={o.paid ? 'success' : 'muted'}>{o.paid ? 'تم الدفع' : 'ما اكتملش'}</StatusBadge>
                  </td>
                  <td dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {o.id}
                  </td>
                  <td>
                    {!o.paid && (
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 10px', whiteSpace: 'nowrap' }}
                        disabled={inspectingId === o.id}
                        onClick={() => onInspect(o)}
                      >
                        <Search size={14} /> {inspectingId === o.id ? 'جاري الفحص…' : 'فحص'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
      )}

      {inspection && <InspectionPanel inspection={inspection} onClose={() => setInspection(null)} />}
    </AdminCard>
  );
}

function InspectionPanel({ inspection, onClose }) {
  const { order, result: r } = inspection;
  const rows = [
    ['البيئة', r.env === 'live' ? 'Live (حقيقي)' : 'Sandbox (تجربة)'],
    ['حالة الطلب عند PayPal', r.found === false ? 'مش موجود بالمفاتيح الحالية' : r.paypalStatus],
    ['حالة السحب', r.captureStatus ?? r.attempt?.detail?.captureStatus],
    ['سبب التعليق', r.captureReason ?? r.attempt?.detail?.captureReason],
    ['خطأ PayPal', r.attempt?.detail?.captureError?.issue ?? r.attempt?.detail?.captureError?.name],
    ['بلد حساب المشتري', r.payerCountry],
    ['إيميل حساب المشتري', r.payerEmail],
    ['حساب التاجر اللي بيستلم', r.payeeEmail ?? r.payeeMerchantId],
  ].filter(([, v]) => v);

  return (
    <div className="detail-panel" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <strong>
          نتيجة فحص الطلب <span dir="ltr">{order.id}</span>
        </strong>
        <button type="button" className="mock-btn mock-btn--outline" style={{ padding: '4px 8px' }} onClick={onClose} aria-label="إغلاق">
          <X size={14} />
        </button>
      </div>
      <p style={{ margin: '8px 0', fontWeight: 600 }}>{r.explanation}</p>
      {rows.length > 0 && (
        <table className="admin-table admin-table--compact">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td style={{ width: 200 }}>{label}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
