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

/** طرق الدفع اللي تظهر للأم في التطبيق (الاشتراكات والدورات). */
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

  const patch = (p) => setSettings((s) => ({ ...s, ...p }));

  const onSave = async () => {
    if (settings.manualEnabled && !settings.whatsapp.replace(/\D/g, '')) {
      showError('اكتبي رقم واتساب علشان الأم تبعت عليه الإيصال.');
      return;
    }
    setSaving(true);
    const { error } = await savePaymentSettings(settings);
    setSaving(false);
    if (error) showError(error.message ?? 'تعذّر الحفظ');
    else showSuccess('تم حفظ إعدادات الدفع');
  };

  return (
    <AdminCard>
      <SectionHeader title="طرق الدفع في التطبيق" />
      {loading ? (
        <MockLoading label="جاري التحميل…" />
      ) : (
        <div className="page-stack" style={{ gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={settings.manualEnabled}
              onChange={(e) => patch({ manualEnabled: e.target.checked })}
            />
            التحويل اليدوي (الأم تحوّل وتبعت الإيصال على واتساب، وإنتي تفتحي لها بالإيميل)
          </label>
          <label className="cms-field">
            رقم واتساب لاستقبال الإيصالات (بالكود الدولي، مثال: 967777123456)
            <input
              type="tel"
              dir="ltr"
              placeholder="967777123456"
              value={settings.whatsapp}
              onChange={(e) => patch({ whatsapp: e.target.value })}
            />
          </label>
          <label className="cms-field">
            بيانات التحويل اللي تظهر للأم (اسم البنك أو المحفظة، رقم الحساب، اسم المستلم…)
            <textarea
              rows={4}
              placeholder={'مثال:\nبنك الكريمي — رقم الحساب: 123456\nاسم المستلم: فلانة'}
              value={settings.manualInstructions}
              onChange={(e) => patch({ manualInstructions: e.target.value })}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={settings.paypalEnabled}
              onChange={(e) => patch({ paypalEnabled: e.target.checked })}
            />
            PayPal أو بطاقة بنكية (يتفعّل تلقائي بعد الدفع)
          </label>
          <p className="text-caption" style={{ margin: 0 }}>
            PayPal بيظهر بس للباقات والدورات اللي ليها سعر بالدولار. ولو التطبيق نزل على Google Play، اقفلي
            PayPal والتحويل اليدوي علشان Google ممكن ترفض التطبيق.
          </p>
          <div>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ إعدادات الدفع'}
            </button>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
