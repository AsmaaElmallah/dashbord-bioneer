import { useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  notificationCampaigns,
  notificationOverview,
  notificationTemplates,
  notificationTypes,
} from '../data/mockData';

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
  const [composer, setComposer] = useState(defaultComposer);

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

  return (
    <div className="page-stack">
      <PageHeader title="الإشعارات" />

      <InfoBanner tone="info">
        التطبيق الأصلي لا يحتوي نظام push حقيقي — هذه الصفحة UI للتخطيط فقط (لا Firebase / لا
        إرسال).
      </InfoBanner>

      <div className="grid-4">
        <StatCard
          label="إشعارات مجدولة"
          value={String(notificationOverview.scheduled)}
        />
        <StatCard label="إشعارات مرسلة" value={String(notificationOverview.sent)} sub="mock" />
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
          <label className="cms-field">
            وقت الإرسال (mock)
            <input
              type="datetime-local"
              value={composer.sendAt}
              onChange={(e) => setComposer((c) => ({ ...c, sendAt: e.target.value }))}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="publish">جدولة الإرسال</MockActionButton>
            <MockActionButton variant="outline" action="publish">إرسال الآن (mock)</MockActionButton>
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
              {notificationCampaigns.map((c) => (
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
