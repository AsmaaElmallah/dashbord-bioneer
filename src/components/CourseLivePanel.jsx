import { Plus, Radio, Trash2 } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  createCourseLiveSession,
  deleteLiveSession,
  listCourseLiveSessions,
  liveStatusLabel,
  loadAgoraAppId,
  saveAgoraAppId,
  setLiveStatus,
  translateLiveError,
  updateLiveSchedule,
} from '../services/supabase/liveService';

const LiveHostRoom = lazy(() => import('./LiveHostRoom').then((m) => ({ default: m.LiveHostRoom })));

const statusTone = { scheduled: 'info', live: 'error', ended: 'muted' };

/** Live belonging to one course: set the time, go on air, record. */
export function CourseLivePanel({ course, onChanged }) {
  const { showError, showSuccess } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [hostSession, setHostSession] = useState(null);
  const [appId, setAppId] = useState('');
  const [savedAppId, setSavedAppId] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState(course.title || '');
  const [newAt, setNewAt] = useState('');
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const reload = useCallback(async () => {
    const { data, error } = await listCourseLiveSessions(course.id);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر تحميل لايف الدورة');
    else {
      setSessions(data);
      setEdits({});
    }
  }, [course.id, showError]);

  useEffect(() => {
    reload();
    loadAgoraAppId().then(({ data }) => {
      setAppId(data);
      setSavedAppId(data);
    });
  }, [reload]);

  useEffect(() => {
    setNewTitle(course.title || '');
  }, [course.title]);

  const onCreate = async () => {
    if (!newAt) {
      showError('حددي ميعاد اللايف');
      return;
    }
    setCreating(true);
    const { error } = await createCourseLiveSession(course, { title: newTitle, scheduledAt: newAt });
    setCreating(false);
    if (error) {
      showError(translateLiveError(error.message) ?? 'تعذّر إنشاء اللايف');
      return;
    }
    showSuccess('اتحفظت جلسة اللايف — هيوصل للأمهات تذكير قبلها بأسبوع و3 أيام وساعة');
    setNewAt('');
    await reload();
    onChanged?.();
  };

  const onSaveTime = async (session) => {
    const at = edits[session.id] ?? session.scheduledAt;
    if (!at) {
      showError('حددي ميعاد اللايف');
      return;
    }
    setSavingId(session.id);
    const { error } = await updateLiveSchedule(session.id, at);
    setSavingId(null);
    if (error) {
      showError(translateLiveError(error.message) ?? 'تعذّر حفظ الميعاد');
      return;
    }
    showSuccess('تم حفظ الميعاد — هيظهر في التطبيق مع العد التنازلي');
    await reload();
    onChanged?.();
  };

  const onDelete = async (session) => {
    if (!window.confirm(`حذف لايف «${session.title}»؟`)) return;
    const { error } = await deleteLiveSession(session.id);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر الحذف');
    else {
      if (hostSession?.id === session.id) setHostSession(null);
      reload();
    }
  };

  const onReset = async (session) => {
    const { error } = await setLiveStatus(session.id, 'scheduled');
    if (error) showError('تعذّر التحديث');
    else reload();
  };

  const saveAppId = async () => {
    const { error } = await saveAgoraAppId(appId);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر الحفظ');
    else {
      setSavedAppId(appId.trim());
      showSuccess('تم حفظ Agora App ID');
    }
  };

  const liveNow = sessions.find((s) => s.status === 'live');
  const atOf = (s) => (edits[s.id] !== undefined ? edits[s.id] : s.scheduledAt);

  return (
    <>
      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <SectionHeader title={`اللايف — ${course.title}`} />
        </div>
        <p className="text-caption">
          حددي ميعاد الجلسة. الأم تشوف الميعاد في صفحة الدورة وعدّ تنازلي لحد ما يخلص ويبقى مكتوب «انتهى». وقت
          اللايف دوسي «ابدئي البث» من هنا.
        </p>

        {!savedAppId && (
          <div className="filters-row" style={{ marginTop: 8 }}>
            <input
              type="text"
              dir="ltr"
              placeholder="Agora App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              style={{ flex: '1 1 240px' }}
            />
            <button type="button" className="mock-btn mock-btn--outline" onClick={saveAppId}>
              حفظ App ID
            </button>
          </div>
        )}

        <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
          <label className="cms-field">
            اسم الجلسة
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </label>
          <label className="cms-field">
            الميعاد
            <input type="datetime-local" value={newAt} onChange={(e) => setNewAt(e.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="button" className="mock-btn mock-btn--primary" disabled={creating} onClick={onCreate}>
            <Plus size={14} /> {creating ? 'جاري الإنشاء…' : 'حفظ جلسة لايف بالميعاد'}
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-caption" style={{ marginTop: 12 }}>
            مفيش لايف للدورة دي لسه. اكتبي الاسم والميعاد واضغطي الحفظ.
          </p>
        ) : (
          <ul className="live-requests" style={{ marginTop: 16 }}>
            {sessions.map((s) => (
              <li key={s.id} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Radio size={14} style={{ marginTop: 10 }} />
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div>{s.title}</div>
                  <label className="cms-field" style={{ margin: '8px 0 0' }}>
                    الميعاد في التطبيق
                    <input
                      type="datetime-local"
                      value={atOf(s)}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </label>
                </div>
                <StatusBadge tone={statusTone[s.status] ?? 'muted'}>{liveStatusLabel[s.status]}</StatusBadge>
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  style={{ padding: '4px 10px' }}
                  disabled={savingId === s.id || atOf(s) === s.scheduledAt}
                  onClick={() => onSaveTime(s)}
                >
                  {savingId === s.id ? 'جاري الحفظ…' : 'حفظ الميعاد'}
                </button>
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
                )}
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  style={{ padding: '4px 8px' }}
                  aria-label="حذف"
                  onClick={() => onDelete(s)}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {liveNow && <p className="text-caption">في لايف شغال دلوقتي — الأمهات يشوفوه من صفحة الدورة.</p>}
      </AdminCard>

      {hostSession && (
        <Suspense fallback={<MockLoading label="جاري تجهيز غرفة اللايف…" />}>
          <LiveHostRoom
            session={hostSession}
            onClose={() => {
              setHostSession(null);
              reload();
            }}
            onStatusChange={reload}
          />
        </Suspense>
      )}
    </>
  );
}
