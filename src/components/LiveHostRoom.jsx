import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  Check,
  Circle,
  Hand,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Square,
  UserMinus,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
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

const REC_WIDTH = 1280;
const REC_HEIGHT = 720;

function pickRecordingMime() {
  const options = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return options.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) ?? '';
}

function drawCover(ctx, video, x, y, w, h) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const scale = Math.max(w / vw, h / vh);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, x, y, w, h);
}

/**
 * Records the room as one video: host camera full frame, stage mothers as small tiles,
 * and every audio track mixed together. Returns a Blob when stopped.
 */
function createRoomRecorder(gridEl) {
  const canvas = document.createElement('canvas');
  canvas.width = REC_WIDTH;
  canvas.height = REC_HEIGHT;
  const ctx = canvas.getContext('2d');
  const audioCtx = new AudioContext();
  const mix = audioCtx.createMediaStreamDestination();
  const connected = new Set();

  const draw = () => {
    ctx.fillStyle = '#1f1a2e';
    ctx.fillRect(0, 0, REC_WIDTH, REC_HEIGHT);
    const main = gridEl.querySelector('.live-tile--main video');
    if (main) drawCover(ctx, main, 0, 0, REC_WIDTH, REC_HEIGHT);
    const others = [...gridEl.querySelectorAll('.live-tile:not(.live-tile--main) video')];
    const tileW = 240;
    const tileH = 180;
    others.forEach((video, i) => {
      const x = REC_WIDTH - (tileW + 16) * (i + 1);
      const y = REC_HEIGHT - tileH - 16;
      if (x < 0) return;
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 2, y - 2, tileW + 4, tileH + 4);
      drawCover(ctx, video, x, y, tileW, tileH);
    });
  };
  const timer = setInterval(draw, 1000 / 30);

  const addAudio = (mediaStreamTrack) => {
    if (!mediaStreamTrack || connected.has(mediaStreamTrack.id)) return;
    connected.add(mediaStreamTrack.id);
    audioCtx.createMediaStreamSource(new MediaStream([mediaStreamTrack])).connect(mix);
  };

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...mix.stream.getAudioTracks()]);
  const mimeType = pickRecordingMime();
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_200_000 });
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  recorder.start(1000);
  const startedAt = Date.now();

  const stop = () =>
    new Promise((resolve) => {
      recorder.onstop = () => {
        clearInterval(timer);
        audioCtx.close().catch(() => {});
        const type = (mimeType || 'video/webm').split(';')[0];
        resolve({ blob: new Blob(chunks, { type }), minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)) });
      };
      recorder.stop();
    });

  return { addAudio, stop, startedAt };
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

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
export function LiveHostRoom({ session, onClose, onStatusChange, onRecorded }) {
  const { showError, showSuccess } = useSnackbar();
  const [phase, setPhase] = useState('idle');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recordingSince, setRecordingSince] = useState(null);
  const [, setTick] = useState(0);
  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const gridRef = useRef(null);
  const recorderRef = useRef(null);

  useEffect(() => {
    if (!recordingSince) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [recordingSince]);

  const startRecording = () => {
    if (!window.MediaRecorder) {
      showError('المتصفح ده مش بيدعم التسجيل — استخدمي Chrome أو Edge.');
      return;
    }
    try {
      const rec = createRoomRecorder(gridRef.current);
      rec.addAudio(tracksRef.current[0]?.getMediaStreamTrack());
      (clientRef.current?.remoteUsers ?? []).forEach((u) => rec.addAudio(u.audioTrack?.getMediaStreamTrack()));
      recorderRef.current = rec;
      setRecordingSince(rec.startedAt);
      showSuccess('التسجيل بدأ — خلّي التاب دي مفتوحة لحد ما تخلّصي');
    } catch (e) {
      showError(`تعذّر بدء التسجيل: ${e?.message ?? e}`);
    }
  };

  /** Stops the recorder, saves the file to the computer, and hands it to the page for publishing. */
  const stopRecording = async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    recorderRef.current = null;
    setRecordingSince(null);
    const { blob, minutes } = await rec.stop();
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    const name = `live_${session.title.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 40)}_${new Date().toISOString().slice(0, 10)}.${ext}`;
    downloadBlob(blob, name);
    onRecorded?.({ file: new File([blob], name, { type: blob.type }), minutes });
    showSuccess('التسجيل اتحفظ على الجهاز في Downloads');
  };

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
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec) rec.stop().then(({ blob }) => downloadBlob(blob, `live_recording_${Date.now()}.webm`));
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
        if (mediaType === 'audio') {
          user.audioTrack?.play();
          recorderRef.current?.addAudio(user.audioTrack?.getMediaStreamTrack());
        }
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
    await stopRecording();
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

      <div className="live-grid" ref={gridRef}>
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
            {recordingSince ? (
              <button type="button" className="mock-btn mock-btn--outline" onClick={stopRecording}>
                <Square size={14} /> وقّفي التسجيل ({formatElapsed(Date.now() - recordingSince)})
              </button>
            ) : (
              <button type="button" className="mock-btn mock-btn--outline" onClick={startRecording}>
                <Circle size={14} color="#c0392b" fill="#c0392b" /> سجّلي اللايف
              </button>
            )}
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
