import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  countDeviceTokens,
  createAndSendCampaign,
  fetchNotificationCampaigns,
} from '../services/supabase/notificationsService';

const statusTone = {
  مجدول: 'info',
  مُرسل: 'success',
  مسودة: 'muted',
};

const defaultComposer = {
  title: '',
  body: '',
};

export function NotificationsPage() {
  const { showError, showSuccess } = useSnackbar();
  const [composer, setComposer] = useState(defaultComposer);
  const [campaigns, setCampaigns] = useState([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isSupabaseEnabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [c, t] = await Promise.all([
      fetchNotificationCampaigns(),
      countDeviceTokens(),
    ]);
    setCampaigns(
      (c.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        audience: row.audience,
        status: row.status,
        date: row.sentAt,
      })),
    );
    setTokenCount(t.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sendNow = async () => {
    if (!composer.title.trim() || !composer.body.trim()) {
      showError('أدخلي العنوان والنص');
      return;
    }
    if (!isSupabaseEnabled) {
      showError('Supabase غير مفعّل');
      return;
    }
    setSending(true);
    const { error, fallback } = await createAndSendCampaign({
      title: composer.title.trim(),
      body: composer.body.trim(),
    });
    setSending(false);
    if (error) {
      showError('تعذّر الإرسال');
      return;
    }
    showSuccess(
      fallback
        ? 'اتحفظت الحملة جوه التطبيق — بوش الموبايل يحتاج Edge Function'
        : 'تم إرسال الحملة',
    );
    setComposer(defaultComposer);
    await reload();
  };

  const sentCount = campaigns.filter((c) => c.status === 'مُرسل').length;

  return (
    <div className="page-stack">
      <PageHeader title="الإشعارات" />

      <InfoBanner tone="info">
        {isSupabaseEnabled
          ? `أجهزة مسجّلة: ${tokenCount}. الإشعار يظهر جوه التطبيق. بوش الموبايل يحتاج Edge Function send-campaign.`
          : 'فعّلي السحابة لإرسال الإشعارات.'}
      </InfoBanner>

      <div className="grid-2">
        <StatCard label="أجهزة مسجّلة" value={String(tokenCount)} />
        <StatCard label="حملات مرسلة" value={String(sentCount)} />
      </div>

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title="إنشاء إشعار" />
          <label className="cms-field">
            العنوان
            <input
              type="text"
              value={composer.title}
              onChange={(e) => setComposer((c) => ({ ...c, title: e.target.value }))}
              placeholder="عنوان الإشعار"
            />
          </label>
          <label className="cms-field">
            نص الرسالة
            <textarea
              rows={3}
              value={composer.body}
              onChange={(e) => setComposer((c) => ({ ...c, body: e.target.value }))}
              placeholder="نص يظهر في الإشعار"
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={sendNow}
              disabled={sending}
            >
              {sending ? 'جاري الإرسال…' : 'إرسال الآن'}
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={() => setComposer(defaultComposer)}
            >
              مسح
            </button>
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="معاينة" />
          <div className="mobile-notif-preview">
            <div className="mobile-notif-preview__bar">
              <span>بيانور</span>
              <span className="text-caption">الآن</span>
            </div>
            <strong className="mobile-notif-preview__title">
              {composer.title || 'عنوان الإشعار'}
            </strong>
            <p className="mobile-notif-preview__body">
              {composer.body || 'نص الرسالة يظهر هنا...'}
            </p>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="جدول الحملات" />
        {!loading && campaigns.length === 0 ? (
          <EmptyState compact title="لا حملات بعد" description="أرسلي إشعار من النموذج أعلاه." />
        ) : (
          <AdminTableContainer>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الجمهور</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.audience || '—'}</td>
                    <td>
                      <StatusBadge tone={statusTone[c.status] ?? 'muted'}>{c.status}</StatusBadge>
                    </td>
                    <td>{c.date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        )}
      </AdminCard>
    </div>
  );
}
