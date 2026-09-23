import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  notificationCampaigns as mockCampaigns,
  notificationOverview,
  notificationTemplates,
  notificationTypes,
} from '../data/mockData';
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
  type: 'تذكير',
  audience: 'كل المستخدمين',
  deepLink: 'bayanour://home',
  sendAt: '',
};

export function NotificationsPage() {
  const { showMock } = useSnackbar();
  const [composer, setComposer] = useState(defaultComposer);
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [tokenCount, setTokenCount] = useState(0);
  const [sending, setSending] = useState(false);

  const reload = useCallback(async () => {
    if (!isSupabaseEnabled) return;
    const [c, t] = await Promise.all([
      fetchNotificationCampaigns(),
      countDeviceTokens(),
    ]);
    if (c.data) {
      setCampaigns(
        c.data.map((row) => ({
          id: row.id,
          title: row.title,
          audience: row.audience,
          status: row.status,
          date: row.sentAt,
          openRate: '—',
        })),
      );
    }
    setTokenCount(t.count);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyTemplate = (tpl) => {
    setComposer({
      title: tpl.title,
      body: tpl.body,
      type: tpl.type,
      audience: tpl.audience,
      deepLink: tpl.deepLink,
      sendAt: tpl.sendAt,
    });
  };

  const sendNow = async () => {
    if (!composer.title.trim() || !composer.body.trim()) {
      showMock('أدخلي العنوان والنص');
      return;
    }
    if (!isSupabaseEnabled) {
      showMock();
      return;
    }
    setSending(true);
    const { error, fallback } = await createAndSendCampaign({
      title: composer.title.trim(),
      body: composer.body.trim(),
    });
    setSending(false);
    if (error) {
      showMock('تعذّر الإرسال');
      return;
    }
    showMock(
      fallback
        ? 'أُرسلت للحملة (in-app) — انشري Edge Function send-campaign لـ FCM'
        : 'تم إرسال الحملة',
    );
    setComposer(defaultComposer);
    await reload();
  };

  const sentCount = campaigns.filter((c) => c.status === 'مُرسل').length;

  return (
    <div className="page-stack">
      <PageHeader
        title="الإشعارات"
        extraBadges={isSupabaseEnabled ? ['Supabase'] : ['mock data']}
      />

      <AdminCard>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/content-studio/notification" className="mock-btn mock-btn--primary">
            محرر الإشعارات (Content Studio)
          </Link>
        </p>
      </AdminCard>

      <InfoBanner tone="info">
        {isSupabaseEnabled
          ? `أجهزة مسجّلة: ${tokenCount}. الإرسال عبر Edge Function send-campaign (FCM إن وُجد FCM_SERVER_KEY، وإلا in-app).`
          : 'التطبيق يعرض الحملات المرسلة من Supabase — فعّلي السحابة للإرسال.'}
      </InfoBanner>

      <div className="grid-4">
        <StatCard label="أجهزة مسجّلة" value={String(tokenCount)} />
        <StatCard label="إشعارات مرسلة" value={String(sentCount)} />
        <StatCard label="معدل فتح" value={notificationOverview.openRate} sub="متوسط mock" />
        <StatCard
          label="تذكيرات الدروس"
          value={String(notificationOverview.lessonReminders)}
          sub="قرآن + مناهج"
        />
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
          <label className="cms-field">
            النوع
            <select
              value={composer.type}
              onChange={(e) => setComposer((c) => ({ ...c, type: e.target.value }))}
            >
              {notificationTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="cms-field">
            الجمهور المستهدف
            <input
              type="text"
              value={composer.audience}
              onChange={(e) => setComposer((c) => ({ ...c, audience: e.target.value }))}
            />
          </label>
          <label className="cms-field">
            مكان الظهور / deep link
            <input
              type="text"
              value={composer.deepLink}
              onChange={(e) => setComposer((c) => ({ ...c, deepLink: e.target.value }))}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton
              onClick={sendNow}
              disabled={sending}
            >
              {sending ? 'جاري الإرسال…' : 'إرسال الآن'}
            </MockActionButton>
            <MockActionButton variant="outline" onClick={() => setComposer(defaultComposer)}>
              مسح
            </MockActionButton>
          </div>

          <SectionHeader title="قوالب جاهزة" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {notificationTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="mock-btn mock-btn--outline"
                style={{ fontSize: '0.8rem' }}
                onClick={() => applyTemplate(tpl)}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="معاينة — جوال" />
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
            <span className="text-caption">{composer.deepLink}</span>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="جدول الحملات" />
        <AdminTableContainer>
          <table className="admin-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الجمهور</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>open rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td style={{ fontSize: '0.85rem' }}>{c.audience}</td>
                  <td>
                    <StatusBadge tone={statusTone[c.status] ?? 'muted'}>{c.status}</StatusBadge>
                  </td>
                  <td>{c.date}</td>
                  <td>{c.openRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
      </AdminCard>
    </div>
  );
}
