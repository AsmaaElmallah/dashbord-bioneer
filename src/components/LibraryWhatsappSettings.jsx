import { MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { SectionHeader } from './SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  formatLocalNumber,
  joinWhatsappNumber,
  splitWhatsappNumber,
  whatsappCountries,
} from '../data/libraryAgeBands';
import {
  loadWhatsappNumber,
  saveWhatsappNumber,
  translateSectionsError,
} from '../services/supabase/librarySectionsService';

/** رقم واتساب الأدمن — زر «تواصلي عبر واتساب» في الكتب المدفوعة يفتحه. */
export function LibraryWhatsappSettings() {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [country, setCountry] = useState(whatsappCountries[0].code);
  const [local, setLocal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    loadWhatsappNumber().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        showError(translateSectionsError(error.message));
        return;
      }
      const parts = splitWhatsappNumber(data);
      setCountry(parts.country);
      setLocal(parts.local);
    });
    return () => {
      active = false;
    };
  }, [showError]);

  const full = joinWhatsappNumber(country, local);

  const onSave = async () => {
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    if (local && full.length < 8) {
      showError('رقم الهاتف غير مكتمل.');
      return;
    }
    setSaving(true);
    const { error } = await saveWhatsappNumber(full);
    setSaving(false);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showSuccess('تم حفظ رقم الواتساب');
  };

  return (
    <AdminCard>
      <SectionHeader title="رقم واتساب الكتب المدفوعة" />
      <p className="text-caption" style={{ marginTop: 0 }}>
        لما الأم تضغط «تواصلي عبر واتساب» على أي كتاب مدفوع، بيفتح واتساب على الرقم ده برسالة فيها اسم الكتاب.
      </p>
      <div className="whatsapp-phone" dir="rtl">
        <Phone size={20} className="whatsapp-phone__icon" />
        <label className="whatsapp-phone__field whatsapp-phone__field--number">
          <span>الهاتف</span>
          <input
            type="tel"
            dir="ltr"
            inputMode="tel"
            placeholder="779 785 385"
            value={formatLocalNumber(local)}
            onChange={(e) => setLocal(e.target.value.replace(/\D/g, ''))}
          />
        </label>
        <label className="whatsapp-phone__field">
          <span>الدولة</span>
          <select dir="ltr" value={country} onChange={(e) => setCountry(e.target.value)}>
            {whatsappCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} +{c.dial}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
        <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
          {saving ? 'جاري الحفظ…' : 'حفظ الرقم'}
        </button>
        {full && (
          <a className="mock-btn mock-btn--outline" href={`https://wa.me/${full}`} target="_blank" rel="noreferrer">
            <MessageCircle size={14} /> تجربة الرقم على واتساب
          </a>
        )}
      </div>
    </AdminCard>
  );
}
