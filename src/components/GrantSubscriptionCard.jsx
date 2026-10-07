import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { AdminCard } from './AdminCard';
import { SectionHeader } from './SectionHeader';
import { useSnackbar } from '../context/SnackbarContext';
import { grantSubscriptionByEmail } from '../services/supabase/subscriptionsService';

/** فتح اشتراك لأم دفعت بالتحويل اليدوي. */
export function GrantSubscriptionCard({ plans, onGranted }) {
  const { showError, showSuccess } = useSnackbar();
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [days, setDays] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedPlan = plans.find((p) => p.id === planId);

  const onGrant = async () => {
    if (!email.trim()) {
      showError('اكتبي إيميل الأم.');
      return;
    }
    if (!planId) {
      showError('اختاري الباقة.');
      return;
    }
    setBusy(true);
    const { data, error } = await grantSubscriptionByEmail(email, planId, days);
    setBusy(false);
    if (error) {
      showError(error.message ?? 'تعذّر فتح الاشتراك');
      return;
    }
    const until = data ? new Date(data).toLocaleDateString('ar-EG') : '';
    showSuccess(`تم فتح الاشتراك${until ? ` لحد ${until}` : ''}`);
    setEmail('');
    setDays('');
    onGranted?.();
  };

  return (
    <AdminCard>
      <SectionHeader title="فتح اشتراك بالإيميل (تحويل يدوي)" />
      <p className="text-caption" style={{ margin: '4px 0 12px' }}>
        بعد ما الأم تحوّل وتبعت الإيصال، اكتبي إيميلها اللي مسجّلة بيه في التطبيق. لو عندها اشتراك شغال، المدة الجديدة
        بتتضاف عليه.
      </p>
      <div className="filters-row">
        <input
          type="email"
          dir="ltr"
          placeholder="mom@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: '1 1 220px' }}
        />
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="">اختاري الباقة</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder={`المدة بالأيام (${selectedPlan?.durationDays ?? 30})`}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          style={{ width: 170 }}
        />
        <button type="button" className="mock-btn mock-btn--primary" disabled={busy} onClick={onGrant}>
          <UserPlus size={14} /> {busy ? 'جاري الفتح…' : 'فتح الاشتراك'}
        </button>
      </div>
    </AdminCard>
  );
}
