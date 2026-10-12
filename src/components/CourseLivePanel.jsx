import { Plus, Radio, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { LiveHostRoom } from './LiveHostRoom';
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
} from '../services/supabase/liveService';

const statusTone = { scheduled: 'info', live: 'error', ended: 'muted' };

/** Live belonging to one course: schedule, go on air, record. */
export function CourseLivePanel({ course, onChanged }) {
  const { showError, showSuccess } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [hostSession, setHostSession] = useState(null);
  const [appId, setAppId] = useState('');
  const [savedAppId, setSavedAppId] = useState('');
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await listCourseLiveSessions(course.id);
    if (error) showError(translateLiveError(error.message) ?? 'تعذّر تحميل لايف الدورة');
    else setSessions(data);
  }, [course.id, showError]);

  useEffect(() => {
    reload();
    loadAgoraAppId().then(({ data }) => {
      setAppId(data);
      setSavedAppId(data);
    });
  }, [reload]);

  const onCreate = async () => {
    setCreating(true);
    const { data, error } = await createCourseLiveSession(course);
    setCreating(false);
    if (error) {
      showError(translateLiveError(error.message) ?? 'تعذّر إنشاء اللايف');
      return;
    }
    showSuccess('اتعملت جلسة لايف للدورة دي');
    await reload();
    onChanged?.();
    if (data) setHostSession(data);
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

  return (
    <>
      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <SectionHeader title={`اللايف — ${course.title}`} />
          <button type="button" className="mock-btn mock-btn--primary" disabled={creating} onClick={onCreate}>
            <Plus size={14} /> {creating ? 'جاري الإنشاء…' : 'ابدئي لايف للدورة'}
          </button>
        </div>
        <p className="text-caption">
          اللايف جزء من الدورة دي. الأم بتدخل القاعة من صفحة الدورة.
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

        {sessions.length === 0 ? (
          <p className="text-caption" style={{ marginTop: 12 }}>
            مفيش لايف للدورة دي لسه. اضغطي «ابدئي لايف للدورة».
          </p>
        ) : (
          <ul className="live-requests" style={{ marginTop: 12 }}>
            {sessions.map((s) => (
              <li key={s.id}>
                <Radio size={14} />
                <span style={{ flex: 1 }}>
                  {s.title}
                  {s.scheduledAt && (
                    <span className="text-caption"> — {new Date(s.scheduledAt).toLocaleString('ar-EG')}</span>
                  )}
                </span>
                <StatusBadge tone={statusTone[s.status] ?? 'muted'}>{liveStatusLabel[s.status]}</StatusBadge>
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
        <LiveHostRoom
          session={hostSession}
          onClose={() => {
            setHostSession(null);
            reload();
          }}
          onStatusChange={reload}
        />
      )}
    </>
  );
}
