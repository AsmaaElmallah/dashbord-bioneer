import { Pencil, Plus, Radio, RefreshCw, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { LiveHostRoom } from '../components/LiveHostRoom';
import { MediaCoverPick } from '../components/MediaCoverPick';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { coursePublishOptions, listCourses } from '../services/supabase/coursesService';
import {
  deleteLiveSession,
  emptyLiveDraft,
  listLiveSessions,
  liveAccessLabel,
  liveAccessOptions,
  liveStatusLabel,
  loadAgoraAppId,
  saveAgoraAppId,
  saveLiveSession,
  setLiveStatus,
  translateLiveError,
  validateLive,
} from '../services/supabase/liveService';

const statusTone = { scheduled: 'info', live: 'error', ended: 'muted' };

function AgoraSettingsCard() {
  const { showError, showSuccess } = useSnackbar();
  const [appId, setAppId] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    loadAgoraAppId().then(({ data }) => {
      setAppId(data);
      setSaved(data);
    });
  }, []);

  const onSave = async () => {
    const { error } = await saveAgoraAppId(appId);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر الحفظ');
    else {
      setSaved(appId.trim());
      showSuccess('تم حفظ Agora App ID');
    }
  };

  return (
    <AdminCard>
      <SectionHeader title="إعدادات Agora" />
      <div className="filters-row">
        <input
          type="text"
          dir="ltr"
          placeholder="Agora App ID (32 حرف)"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          style={{ flex: '1 1 320px' }}
        />
        <button
          type="button"
          className="mock-btn mock-btn--primary"
          disabled={appId.trim() === saved}
          onClick={onSave}
        >
          حفظ
        </button>
      </div>
      <p className="text-caption" style={{ margin: '8px 0 0' }}>
        من agora.io ← Projects ← انسخي الـ App ID. لو المشروع على «Testing mode» مش محتاجين حاجة تانية؛ ولو شغّلتي
        «App Certificate» حطيه في Supabase كـ Secret باسم AGORA_APP_CERTIFICATE.
      </p>
    </AdminCard>
  );
}

export function LivePage() {
  const { showError, showSuccess } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hostSession, setHostSession] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [{ data, error }, { data: courseRows }] = await Promise.all([listLiveSessions(), listCourses()]);
    setLoading(false);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر تحميل اللايفات');
    else setSessions(data);
    setCourses(courseRows ?? []);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const onSave = async () => {
    const issue = validateLive(draft);
    if (issue) {
      showError(issue);
      return;
    }
    setSaving(true);
    const { error } = await saveLiveSession(draft);
    setSaving(false);
    if (error) {
      showError(translateLiveError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showSuccess('تم حفظ اللايف');
    setDraft(null);
    reload();
  };

  const onDelete = async (session) => {
    if (!window.confirm(`حذف لايف «${session.title}»؟`)) return;
    const { error } = await deleteLiveSession(session.id);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر الحذف');
    else reload();
  };

  const onReset = async (session) => {
    const { error } = await setLiveStatus(session.id, 'scheduled');
    if (error) showError('تعذّر التحديث');
    else reload();
  };

  const courseTitle = (id) => courses.find((c) => c.id === id)?.title ?? id;

  return (
    <div className="page-stack">
      <PageHeader title="اللايف" extraBadges={[`${sessions.length} لايف`]} />
      <InfoBanner tone="info">
        اعملي لايف جديد وحددي ميعاده ومين يقدر يحضره. وقت اللايف دوسي «ابدئي البث» من هنا (من كمبيوتر فيه كاميرا
        ومايك). الأمهات بيتفرجوا من التطبيق، واللي ترفع إيدها تقدري تطلّعيها على المسرح تتكلم بالصوت والصورة.
        بعد اللايف ارفعي التسجيل على YouTube «غير مُدرج» وحطي رابطه هنا.
      </InfoBanner>

      <AgoraSettingsCard />

      {hostSession && (
        <LiveHostRoom
          session={hostSession}
          onClose={() => {
            setHostSession(null);
            reload();
          }}
          onStatusChange={reload}
        />
      )}

      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SectionHeader title="كل اللايفات" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button type="button" className="mock-btn mock-btn--primary" onClick={() => setDraft(emptyLiveDraft())}>
              <Plus size={16} /> لايف جديد
            </button>
          </div>
        </div>

        {loading ? (
          <MockLoading label="جاري التحميل…" />
        ) : sessions.length === 0 ? (
          <EmptyState icon={Radio} title="لا توجد لايفات بعد" description="اضغطي «لايف جديد»." compact />
        ) : (
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>اللايف</th>
                  <th>الميعاد</th>
                  <th>الحضور</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="text-truncate" style={{ maxWidth: 240 }}>
                      {s.title}
                      <div className="text-caption">{s.instructorName}</div>
                    </td>
                    <td>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString('ar-EG') : '—'}</td>
                    <td className="text-caption">
                      {s.accessType === 'course' ? `دورة: ${courseTitle(s.courseId)}` : liveAccessLabel(s.accessType)}
                    </td>
                    <td>
                      <StatusBadge tone={statusTone[s.status] ?? 'muted'}>{liveStatusLabel[s.status]}</StatusBadge>
                      {s.publishStatus !== 'published' && <div className="text-caption">مش منشور</div>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {s.status === 'ended' ? (
                        <button
                          type="button"
                          className="mock-btn mock-btn--outline"
                          style={{ padding: '4px 10px' }}
                          onClick={() => onReset(s)}
                        >
                          إعادة جدولة
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mock-btn mock-btn--primary"
                          style={{ padding: '4px 10px' }}
                          onClick={() => setHostSession(s)}
                        >
                          <Radio size={14} /> {s.status === 'live' ? 'رجوع للبث' : 'ابدئي البث'}
                        </button>
                      )}{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="تعديل"
                        onClick={() => setDraft({ ...s })}
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="حذف"
                        onClick={() => onDelete(s)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableContainer>
        )}
      </AdminCard>

      {draft && (
        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={draft.id ? `تعديل — ${draft.title}` : 'لايف جديد'} />
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <MediaCoverPick
            label="صورة اللايف (اختياري)"
            value={draft.coverUrl}
            onChange={(url) => patch({ coverUrl: url })}
          />
          <label className="cms-field">
            اسم اللايف
            <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              اسم المدرّبة
              <input
                type="text"
                value={draft.instructorName}
                onChange={(e) => patch({ instructorName: e.target.value })}
              />
            </label>
            <label className="cms-field">
              الميعاد
              <input
                type="datetime-local"
                value={draft.scheduledAt}
                onChange={(e) => patch({ scheduledAt: e.target.value })}
              />
            </label>
          </div>
          <label className="cms-field">
            الوصف
            <textarea rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              مين يقدر يحضر
              <select value={draft.accessType} onChange={(e) => patch({ accessType: e.target.value })}>
                {liveAccessOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {draft.accessType === 'course' && (
              <label className="cms-field">
                الدورة
                <select value={draft.courseId} onChange={(e) => patch({ courseId: e.target.value })}>
                  <option value="">اختاري الدورة</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="cms-field">
              أقصى عدد أمهات على المسرح
              <input
                type="number"
                min="1"
                max="16"
                value={draft.maxStage}
                onChange={(e) => patch({ maxStage: e.target.value })}
              />
            </label>
            <label className="cms-field">
              حالة النشر
              <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                {coursePublishOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="cms-field">
            رابط التسجيل على YouTube (بعد اللايف — اختياري)
            <input
              type="url"
              dir="ltr"
              placeholder="https://youtu.be/..."
              value={draft.recordingUrl}
              onChange={(e) => patch({ recordingUrl: e.target.value })}
            />
          </label>
          <div style={{ marginTop: 8 }}>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ اللايف'}
            </button>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
