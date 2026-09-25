import { Film, Link2, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { parseYoutubeInput } from '../data/contentLibraryAdmin';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';
import {
  loadOnboardingVideos,
  saveOnboardingSlot,
  slotHasVideo,
  translateOnboardingError,
  uploadOnboardingVideo,
} from '../services/supabase/onboardingVideosService';

const ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-m4v';

function parseYoutubeVideoId(input) {
  const raw = (input ?? '').trim();
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const v = url.searchParams.get('v');
    if (v) return v;
  } catch {
    /* not a URL */
  }
  return parseYoutubeInput(raw).videoId || '';
}

export function OnboardingVideosPage() {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busySlot, setBusySlot] = useState(null);

  const reload = async () => {
    setLoading(true);
    const { data, error, offline } = await loadOnboardingVideos();
    setLoading(false);
    if (offline) {
      showError('Supabase غير مفعّل');
      setSlots(data);
      return;
    }
    if (error) {
      showError(translateOnboardingError(error.message) ?? 'تعذّر تحميل فيديوهات التعريف');
    }
    setSlots(data);
  };

  useEffect(() => {
    reload();
  }, []);

  const patchSlot = (slotNumber, patch) => {
    setSlots((prev) => prev.map((s) => (s.slot === slotNumber ? { ...s, ...patch } : s)));
  };

  const persist = async (slot) => {
    if (needsLogin) {
      showError('سجّلي الدخول أولاً لحفظ فيديوهات التعريف.');
      return false;
    }
    const { error } = await saveOnboardingSlot(slot);
    if (error) {
      showError(translateOnboardingError(error.message) ?? 'فشل الحفظ');
      return false;
    }
    return true;
  };

  const handleUpload = async (slot, file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showError('اختاري ملف فيديو (MP4 أو WEBM أو MOV).');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً لرفع الفيديو.');
      return;
    }
    setBusySlot(slot.slot);
    const { data, error } = await uploadOnboardingVideo(slot.slot, file);
    if (error || !data?.url) {
      setBusySlot(null);
      showError(translateOnboardingError(error?.message) ?? 'تعذّر رفع الفيديو');
      return;
    }
    const next = {
      ...slot,
      sourceType: 'upload',
      videoUrl: data.url,
      storagePath: data.path,
      published: true,
    };
    const ok = await persist(next);
    setBusySlot(null);
    if (!ok) return;
    patchSlot(slot.slot, next);
    showSuccess(`تم رفع ونشر فيديو ${slot.slot}`);
  };

  const handleSave = async (slot) => {
    let next = slot;
    if (slot.sourceType === 'youtube') {
      const videoId = parseYoutubeVideoId(slot.youtubeInput);
      if (!videoId) {
        showError('أدخلي رابط فيديو YouTube صحيح (مش playlist).');
        return;
      }
      const becameAvailable = !slot.youtubeVideoId;
      next = {
        ...slot,
        youtubeVideoId: videoId,
        published: becameAvailable ? true : slot.published,
      };
    }
    setBusySlot(slot.slot);
    const ok = await persist(next);
    setBusySlot(null);
    if (!ok) return;
    patchSlot(slot.slot, next);
    showSuccess(`تم حفظ فيديو ${slot.slot}`);
  };

  const publishedCount = slots.filter((s) => s.published && slotHasVideo(s)).length;

  return (
    <div className="page-stack">
      <PageHeader title="فيديوهات التعريف" extraBadges={[`${publishedCount} / 7 منشور`]} />
      <InfoBanner tone="info">
        التطبيق يعرض الفيديوهات المنشورة بالترتيب (1 ثم 2…) في شاشة البداية قبل تسجيل الدخول. للفيديوهات الطويلة
        (أكبر من 50 ميجا) استخدمي «رابط YouTube» — ارفعي الفيديو على يوتيوب كـ Unlisted وحطي الرابط.
      </InfoBanner>

      {loading ? (
        <AdminCard>
          <p className="text-caption">جاري التحميل من Supabase…</p>
        </AdminCard>
      ) : (
        <div className="onboarding-slots">
          {slots.map((slot) => {
            const busy = busySlot === slot.slot;
            const live = slot.published && slotHasVideo(slot);
            const isYoutube = slot.sourceType === 'youtube';
            const previewId = isYoutube
              ? parseYoutubeVideoId(slot.youtubeInput) || slot.youtubeVideoId
              : '';
            return (
              <AdminCard key={slot.slot} className="onboarding-slot">
                <div className="onboarding-slot__head">
                  <strong>الخانة {slot.slot}</strong>
                  <span className={`onboarding-slot__status ${live ? 'is-live' : ''}`}>
                    {live ? 'منشور في التطبيق' : 'مسودة'}
                  </span>
                </div>

                <div className="media-source-toggle" style={{ marginBottom: 10 }}>
                  <button
                    type="button"
                    className={`mock-btn ${!isYoutube ? 'mock-btn--primary' : 'mock-btn--outline'}`}
                    onClick={() => patchSlot(slot.slot, { sourceType: 'upload' })}
                    disabled={busy}
                  >
                    <Upload size={14} /> رفع فيديو
                  </button>
                  <button
                    type="button"
                    className={`mock-btn ${isYoutube ? 'mock-btn--primary' : 'mock-btn--outline'}`}
                    onClick={() => patchSlot(slot.slot, { sourceType: 'youtube' })}
                    disabled={busy}
                  >
                    <Link2 size={14} /> رابط YouTube
                  </button>
                </div>

                {isYoutube ? (
                  previewId ? (
                    <img
                      className="onboarding-slot__video"
                      style={{ objectFit: 'cover' }}
                      src={getYoutubeThumbnailUrl(previewId)}
                      alt=""
                    />
                  ) : (
                    <div className="onboarding-slot__empty">
                      <Link2 size={28} />
                      <span>حطي رابط فيديو YouTube</span>
                    </div>
                  )
                ) : slot.videoUrl ? (
                  <video className="onboarding-slot__video" src={slot.videoUrl} controls preload="metadata" />
                ) : (
                  <div className="onboarding-slot__empty">
                    <Film size={28} />
                    <span>لا يوجد فيديو بعد</span>
                  </div>
                )}

                <label className="cms-field">
                  العنوان
                  <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => patchSlot(slot.slot, { title: e.target.value })}
                  />
                </label>

                {isYoutube && (
                  <label className="cms-field">
                    رابط YouTube
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://youtu.be/… أو https://www.youtube.com/watch?v=…"
                      value={slot.youtubeInput}
                      onChange={(e) => patchSlot(slot.slot, { youtubeInput: e.target.value })}
                    />
                  </label>
                )}

                <label className="onboarding-slot__publish">
                  <input
                    type="checkbox"
                    checked={live}
                    disabled={!slotHasVideo(slot) || busy}
                    onChange={(e) => patchSlot(slot.slot, { published: e.target.checked })}
                  />
                  نشر في التطبيق
                </label>

                <div className="onboarding-slot__actions">
                  {!isYoutube && (
                    <label className="mock-btn mock-btn--primary" style={{ cursor: 'pointer' }}>
                      {busy ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                      {busy ? 'جاري الرفع…' : slot.videoUrl ? 'تغيير الفيديو' : 'اختيار فيديو'}
                      <input
                        type="file"
                        accept={ACCEPT}
                        style={{ display: 'none' }}
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) handleUpload(slot, file);
                        }}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className={`mock-btn ${isYoutube ? 'mock-btn--primary' : 'mock-btn--outline'}`}
                    disabled={busy}
                    onClick={() => handleSave(slot)}
                  >
                    {busy && isYoutube ? 'جاري الحفظ…' : 'حفظ'}
                  </button>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
