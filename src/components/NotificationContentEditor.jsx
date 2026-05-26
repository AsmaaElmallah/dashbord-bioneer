import { Bell, MapPin, Target, Users } from 'lucide-react';
import { AdminCard } from './AdminCard';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import {
  buildTargetSummary,
  getRecurrenceLabel,
  notificationPlanOptions,
  notificationPublishOptions,
  notificationRecurrenceOptions,
  notificationSendConditions,
  notificationTargetAgeOptions,
  notificationTypes,
} from '../data/notificationContentEditor';
import { targetingPlacements } from '../data/mockData';

function MobileNotificationPreview({ notification }) {
  return (
    <div className="mobile-notif-preview notification-content-preview">
      <div className="mobile-notif-preview__bar">
        <span>
          <Bell size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
          بيانور
        </span>
        <span className="text-caption">الآن</span>
      </div>
      <strong className="mobile-notif-preview__title">
        {notification.title || 'عنوان الإشعار'}
      </strong>
      <p className="mobile-notif-preview__body">
        {notification.body || 'نص الرسالة يظهر هنا...'}
      </p>
      <span className="text-caption">{notification.deepLink}</span>
      {notification.recurrence !== 'once' && (
        <p className="text-caption notification-content-preview__repeat">
          تكرار: {getRecurrenceLabel(notification.recurrence)}
        </p>
      )}
    </div>
  );
}

function TargetSummaryPanel({ notification }) {
  const summary = buildTargetSummary(notification);

  return (
    <AdminCard className="notification-target-summary">
      <SectionHeader title="Target summary" />
      <ul className="notification-target-summary__list">
        <li>
          <Target size={14} />
          <span>
            <strong>العمر:</strong> {summary.age}
          </span>
        </li>
        <li>
          <Users size={14} />
          <span>
            <strong>الباقة:</strong> {summary.plan}
          </span>
        </li>
        <li>
          <MapPin size={14} />
          <span>
            <strong>القسم المرتبط:</strong> {summary.section}
          </span>
        </li>
        <li>
          <Bell size={14} />
          <span>
            <strong>شرط الإرسال:</strong> {summary.condition}
          </span>
        </li>
      </ul>
      <p className="text-caption">الجمهور: {notification.audience || '—'}</p>
    </AdminCard>
  );
}

export function NotificationContentEditor({ value, onChange }) {
  const notification = value;
  const patch = (partial) => onChange({ ...notification, ...partial });
  const types = notificationTypes;

  return (
    <div className="notification-content-editor">

      <div className="grid-2 notification-content-editor__layout">
        <div className="notification-content-editor__form">
          <AdminCard>
            <SectionHeader title="محتوى الإشعار" />
            <label className="cms-field">
              العنوان
              <input
                type="text"
                value={notification.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="حان وقت جلسة القرآن 🌙"
              />
            </label>
            <label className="cms-field">
              نص الإشعار
              <textarea
                rows={3}
                value={notification.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder="نص يظهر في الإشعار"
              />
            </label>
            <label className="cms-field">
              النوع
              <select value={notification.type} onChange={(e) => patch({ type: e.target.value })}>
                {types.map((t) => (
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
                value={notification.audience}
                onChange={(e) => patch({ audience: e.target.value })}
                placeholder="أولياء أطفال نشطون — مسار قرآن"
              />
            </label>
            <label className="cms-field">
              deep link
              <input
                type="text"
                value={notification.deepLink}
                onChange={(e) => patch({ deepLink: e.target.value })}
                placeholder="bayanour://quran/journey"
              />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="الجدولة والنشر" />
            <label className="cms-field">
              وقت الإرسال (mock)
              <input
                type="datetime-local"
                value={notification.sendAt}
                onChange={(e) => patch({ sendAt: e.target.value })}
              />
            </label>
            <p className="cms-field" style={{ marginBottom: 8 }}>
              التكرار
            </p>
            <div className="chip-grid">
              {notificationRecurrenceOptions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip-btn${notification.recurrence === r.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patch({ recurrence: r.id })}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <label className="cms-field" style={{ marginTop: 12 }}>
              حالة النشر
              <select
                value={notification.publishStatus}
                onChange={(e) => patch({ publishStatus: e.target.value })}
              >
                {notificationPublishOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="استهداف (Target summary)" />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                العمر
                <select
                  value={notification.targetAgeId}
                  onChange={(e) => patch({ targetAgeId: e.target.value })}
                >
                  {notificationTargetAgeOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                الباقة
                <select
                  value={notification.requiredPlan}
                  onChange={(e) => patch({ requiredPlan: e.target.value })}
                >
                  {notificationPlanOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                القسم المرتبط
                <select
                  value={notification.linkedSection}
                  onChange={(e) => patch({ linkedSection: e.target.value })}
                >
                  {targetingPlacements.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                شرط الإرسال
                <select
                  value={notification.sendCondition}
                  onChange={(e) => patch({ sendCondition: e.target.value })}
                >
                  {notificationSendConditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </AdminCard>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ كمسودة</MockActionButton>
            <MockActionButton action="check" message="جدولة (UI فقط) — لم يُجدَول إرسال">
              جدولة
            </MockActionButton>
            <MockActionButton action="publish" message="إرسال الآن (UI فقط) — لا Firebase">
              إرسال الآن
            </MockActionButton>
          </div>
        </div>

        <div className="notification-content-editor__side">
          <AdminCard className="notification-content-editor__preview-wrap">
            <SectionHeader title="معاينة — جوال" />
            <StatusBadge tone="info">{notification.type}</StatusBadge>
            <MobileNotificationPreview notification={notification} />
          </AdminCard>
          <TargetSummaryPanel notification={notification} />
        </div>
      </div>
    </div>
  );
}
