import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContentEditor } from '../components/NotificationContentEditor';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import {
  createEmptyNotification,
  getQuranSessionReminderMock,
} from '../data/notificationContentEditor';

export function NotificationContentEditorPage() {
  const [notification, setNotification] = useState(() => createEmptyNotification());

  return (
    <div className="page-stack">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="محرر الإشعارات" extraBadges={['إشعار']} />

      <InfoBanner tone="warning">
        UI فقط — لا Firebase ولا إرسال فعلي. متوافق مع{' '}
        <Link to="/notifications">صفحة الإشعارات</Link>.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => setNotification(getQuranSessionReminderMock())}
        >
          تحميل إشعار تذكير جلسة قرآن (mock)
        </button>
      </AdminCard>

      <NotificationContentEditor value={notification} onChange={setNotification} />
    </div>
  );
}
