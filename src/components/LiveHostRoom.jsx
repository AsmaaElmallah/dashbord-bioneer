import AgoraRTC from 'agora-rtc-sdk-ng';
import { Check, Hand, Mic, MicOff, PhoneOff, Radio, UserMinus, Video, VideoOff, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminCard } from './AdminCard';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  fetchLiveToken,
  listStageRequests,
  setLiveStatus,
  setStageRequestStatus,
  watchStageRequests,
} from '../services/supabase/liveService';

AgoraRTC.setLogLevel(3);

function RemoteTile({ user, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (user.videoTrack && ref.current) user.videoTrack.play(ref.current);
    return () => user.videoTrack?.stop();
  }, [user, user.videoTrack]);
  return (
    <div className="live-tile">
      <div ref={ref} className="live-tile__video">
        {!user.videoTrack && <span className="text-caption">الكاميرا مقفولة</span>}
      </div>
      <div className="live-tile__label">{label}</div>
    </div>
  );
}

/** غرفة البث للمدرّبة: كاميرا ومايك، الأمهات على المسرح، وطلبات رفع الإيد. */
export function LiveHostRoom({ session, onClose, onStatusChange }) {
  const { showError, showSuccess } = useSnackbar();
  const [phase, setPhase] = useState('idle');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const localVideoRef = useRef(null);

  const reloadRequests = useCallback(async () => {
    const { data } = await listStageRequests(session.id);
    setRequests(data);
  }, [session.id]);

  useEffect(() => {
    reloadRequests();
    return watchStageRequests(session.id, reloadRequests);
  }, [session.id, reloadRequests]);

  const cleanup = useCallback(async () => {
    tracksRef.current.forEach((t) => {
      t.stop();
      t.close();
    });
    tracksRef.current = [];
    const client = clientRef.current;
    clientRef.current = null;
    if (client) await client.leave().catch(() => {});
    setRemoteUsers([]);
  }, []);

  useEffect(() => () => {
    cleanup();
  }, [cleanup]);

  const syncRemote = () => setRemoteUsers([...(clientRef.current?.remoteUsers ?? [])]);

  const start = async () => {
    setPhase('joining');
    const { data, error } = await fetchLiveToken(session.id);
    if (error) {
      showError(error.message);
      setPhase('idle');
      return;
    }
    try {
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;
      await client.setClientRole('host');
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') user.audioTrack?.play();
        syncRemote();
      });
      client.on('user-unpublished', syncRemote);
      client.on('user-left', syncRemote);
      await client.join(data.app_id, data.channel, data.token, data.account);

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
        { AEC: true, ANS: true },
        { encoderConfig: '720p_2' },
      );
      tracksRef.current = tracks;
      tracks[1].play(localVideoRef.current);
      await client.publish(tracks);

      const { error: statusError } = await setLiveStatus(session.id, 'live');
      if (statusError) throw statusError;
      onStatusChange?.('live');
      setPhase('live');
      showSuccess('اللايف بدأ — الأمهات يقدروا يدخلوا دلوقتي');
    } catch (e) {
      await cleanup();
      setPhase('idle');
      showError(
        e?.name === 'NotAllowedError' || String(e?.message).includes('PERMISSION_DENIED')
          ? 'اسمحي للمتصفح يستخدم الكاميرا والمايك وجرّبي تاني.'
          : `تعذّر بدء اللايف: ${e?.message ?? e}`,
      );
    }
  };

  const end = async () => {
    if (!window.confirm('إنهاء اللايف لكل الأمهات؟')) return;
    await cleanup();
    await setLiveStatus(session.id, 'ended');
    onStatusChange?.('ended');
    setPhase('idle');
    showSuccess('اللايف انتهى');
    onClose();
  };

  const toggleMic = async () => {
    const mic = tracksRef.current[0];
    if (!mic) return;
    await mic.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = async () => {
    const cam = tracksRef.current[1];
    if (!cam) return;
    await cam.setEnabled(!camOn);
    setCamOn(!camOn);
  };

  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const nameFor = (uid) => requests.find((r) => r.user_id === String(uid))?.display_name || 'أم على المسرح';

  const updateRequest = async (userId, status) => {
    const { error } = await setStageRequestStatus(session.id, userId, status);
    if (error) showError('تعذّر التحديث');
    else reloadRequests();
  };

  return (
    <AdminCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <SectionHeader title={`غرفة البث — ${session.title}`} />
        {phase === 'live' ? (
          <StatusBadge tone="error">● مباشر</StatusBadge>
        ) : (
          <button type="button" className="mock-btn mock-btn--outline" onClick={onClose} aria-label="إغلاق">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="live-grid">
        <div className="live-tile live-tile--main">
          <div ref={localVideoRef} className="live-tile__video">
            {phase !== 'live' && <span className="text-caption">الكاميرا هتظهر هنا لما تبدئي اللايف</span>}
          </div>
          <div className="live-tile__label">إنتي (المدرّبة)</div>
        </div>
        {remoteUsers.map((user) => (
          <RemoteTile key={user.uid} user={user} label={nameFor(user.uid)} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {phase !== 'live' ? (
          <button type="button" className="mock-btn mock-btn--primary" disabled={phase === 'joining'} onClick={start}>
            <Radio size={16} /> {phase === 'joining' ? 'جاري التوصيل…' : 'ابدئي اللايف'}
          </button>
        ) : (
          <>
            <button type="button" className="mock-btn mock-btn--outline" onClick={toggleMic}>
              {micOn ? <Mic size={16} /> : <MicOff size={16} />} {micOn ? 'كتم المايك' : 'تشغيل المايك'}
            </button>
            <button type="button" className="mock-btn mock-btn--outline" onClick={toggleCam}>
              {camOn ? <Video size={16} /> : <VideoOff size={16} />} {camOn ? 'قفل الكاميرا' : 'تشغيل الكاميرا'}
            </button>
            <button type="button" className="mock-btn mock-btn--danger" onClick={end}>
              <PhoneOff size={16} /> إنهاء اللايف
            </button>
          </>
        )}
      </div>

      <SectionHeader title={`المسرح (${approvedCount} من ${session.maxStage}) والإيد المرفوعة`} />
      {requests.length === 0 ? (
        <p className="text-caption">لما أم ترفع إيدها من التطبيق هتظهر هنا، وتقدري تطلّعيها على المسرح.</p>
      ) : (
        <ul className="live-requests">
          {requests.map((r) => (
            <li key={r.user_id}>
              {r.status === 'approved' ? <Mic size={14} /> : <Hand size={14} />}
              <span style={{ flex: 1 }}>{r.display_name || 'أم'}</span>
              {r.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    className="mock-btn mock-btn--primary"
                    style={{ padding: '4px 10px' }}
                    disabled={approvedCount >= session.maxStage}
                    title={approvedCount >= session.maxStage ? 'المسرح مليان' : ''}
                    onClick={() => updateRequest(r.user_id, 'approved')}
                  >
                    <Check size={14} /> طلّعيها
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    style={{ padding: '4px 10px' }}
                    onClick={() => updateRequest(r.user_id, 'rejected')}
                  >
                    <X size={14} /> رفض
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  style={{ padding: '4px 10px' }}
                  onClick={() => updateRequest(r.user_id, 'left')}
                >
                  <UserMinus size={14} /> نزّليها
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
