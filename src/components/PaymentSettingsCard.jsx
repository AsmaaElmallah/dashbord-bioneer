import { useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { useSnackbar } from '../context/SnackbarContext';
import {
  emptyPaymentSettings,
  loadPaymentSettings,
  savePaymentSettings,
} from '../services/supabase/paymentSettingsService';

/** الدفع في التطبيق بـ PayPal (أو الكارت البنكي عن طريق PayPal) بس. */
export function PaymentSettingsCard() {
  const { showError, showSuccess } = useSnackbar();
  const [settings, setSettings] = useState(emptyPaymentSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPaymentSettings().then(({ data, error }) => {
      if (cancelled) return;
      setSettings(data);
      setLoading(false);
      if (error) showError('تعذّر تحميل إعدادات الدفع — شغّلي migration 20260526100024_payments.sql');
    });
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const onSave = async () => {
    setSaving(true);
    const { error } = await savePaymentSettings(settings);
    setSaving(false);
    if (error) showError(error.message ?? 'تعذّر الحفظ');
    else showSuccess('تم حفظ إعدادات الدفع');
  };

  return (
    <AdminCard>
      <SectionHeader title="الدفع في التطبيق" />
      {loading ? (
        <MockLoading label="جاري التحميل…" />
      ) : (
        <div className="page-stack" style={{ gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={settings.paypalEnabled}
              onChange={(e) => setSettings({ paypalEnabled: e.target.checked })}
            />
            تفعيل الدفع بـ PayPal أو الكارت البنكي (الاشتراك بيتفعّل تلقائي بعد الدفع)
          </label>
          <p className="text-caption" style={{ margin: 0 }}>
            لو قفلتيه، الأم مش هتقدر تدفع لحد ما تفتحيه تاني. كل الأسعار بالدولار. ولو التطبيق نزل على Google Play، Google
            ممكن ترفضه لأن الدفع جوه التطبيق مش عن طريقها.
          </p>
          <div>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
