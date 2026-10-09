import { Film, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { AdminCard } from './AdminCard';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import { useSnackbar } from '../context/SnackbarContext';
import { parseYoutubeVideoId } from '../data/contentLibraryAdmin';
import {
  COURSE_VIDEO_MAX_BYTES,
  courseAccessOptions,
  publishLiveRecording,
  translateCoursesError,
} from '../services/supabase/coursesService';
import { setLiveRecording, translateLiveError } from '../services/supabase/liveService';

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} ميجا`;
}

/**
 * Publishes a live recording: as a lesson in an existing course (free preview or behind the course's access),
 * as a brand-new course (free / subscription / paid), or only in the app's lives tab.
 */
export function PublishRecordingPanel({ session, courses, recorded, onClose, onPublished }) {
  const { showError, showSuccess } = useSnackbar();
  const smallEnough = recorded?.file && recorded.file.size <= COURSE_VIDEO_MAX_BYTES;
  const [source, setSource] = useState(smallEnough ? 'file' : 'youtube');
  const [youtubeInput, setYoutubeInput] = useState(session.recordingUrl ?? '');
  const [file, setFile] = useState(smallEnough ? recorded.file : null);
  const [mode, setMode] = useState(session.courseId ? 'existing' : 'new');
  const [courseId, setCourseId] = useState(session.courseId || courses[0]?.id || '');
  const [isPreview, setIsPreview] = useState(false);
  const [lessonTitle, setLessonTitle] = useState(session.title);
  const [minutes, setMinutes] = useState(recorded?.minutes ? String(recorded.minutes) : '');
  const [newCourse, setNewCourse] = useState({
    title: session.title,
    accessType: 'free',
    priceLabel: '',
    priceUsd: '',
  });
  const [busy, setBusy] = useState(false);

  const onPublish = async () => {
    const youtubeVideoId = source === 'youtube' ? parseYoutubeVideoId(youtubeInput.trim()) : null;
    if (source === 'youtube' && !youtubeVideoId) {
      showError('حطي رابط YouTube صحيح للتسجيل.');
      return;
    }
    if (source === 'file') {
      if (!file) {
        showError('اختاري ملف التسجيل.');
        return;
      }
      if (file.size > COURSE_VIDEO_MAX_BYTES) {
        showError(`الملف ${formatMb(file.size)} — أكبر من 50 ميجا. ارفعيه على YouTube «غير مُدرج» وحطي الرابط.`);
        return;
      }
    }
    if (mode !== 'lives_only' && !lessonTitle.trim()) {
      showError('اكتبي عنوان الدرس.');
      return;
    }
    if (mode === 'existing' && !courseId) {
      showError('اختاري الدورة.');
      return;
    }
    if (mode === 'new' && !newCourse.title.trim()) {
      showError('اكتبي اسم الدورة الجديدة.');
      return;
    }
    if (mode === 'lives_only' && source !== 'youtube') {
      showError('قسم اللايفات بيعرض تسجيلات YouTube بس — اختاري رابط YouTube.');
      return;
    }

    setBusy(true);
    if (youtubeVideoId) {
      const { error } = await setLiveRecording(session.id, youtubeVideoId);
      if (error) {
        setBusy(false);
        showError(translateLiveError(error.message) ?? 'تعذّر حفظ رابط التسجيل');
        return;
      }
    }
    if (mode !== 'lives_only') {
      const { error } = await publishLiveRecording({
        session,
        lessonTitle: lessonTitle.trim(),
        durationMinutes: minutes,
        video: source === 'file' ? { file } : { youtubeVideoId },
        target:
          mode === 'existing'
            ? { mode, courseId, isPreview }
            : { mode, ...newCourse, title: newCourse.title.trim() },
      });
      if (error) {
        setBusy(false);
        showError(translateCoursesError(error.message) ?? 'تعذّر نشر التسجيل');
        return;
      }
    }
    setBusy(false);
    showSuccess(
      mode === 'new' && !session.coverUrl
        ? 'اتعملت الدورة كمسودة — ارفعي لها صورة من صفحة الدورات وانشريها'
        : 'التسجيل اتنشر في التطبيق 🎉',
    );
    onPublished?.();
    onClose();
  };

  return (
    <AdminCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionHeader title={`نشر تسجيل — ${session.title}`} />
        <button type="button" className="mock-btn mock-btn--outline" onClick={onClose} aria-label="إغلاق">
          <X size={14} />
        </button>
      </div>

      {recorded?.file && !smallEnough && (
        <InfoBanner tone="info">
          التسجيل اتحفظ على جهازك ({formatMb(recorded.file.size)}) — أكبر من 50 ميجا، فارفعيه على YouTube كـ «غير
          مُدرج» (Unlisted) وحطي الرابط هنا.
        </InfoBanner>
      )}

      <div className="cms-field">
        <span>الفيديو</span>
        <div className="media-source-toggle">
          <button
            type="button"
            className={`mock-btn ${source === 'youtube' ? 'mock-btn--primary' : 'mock-btn--outline'}`}
            onClick={() => setSource('youtube')}
          >
            <Film size={14} /> رابط YouTube
          </button>
          <button
            type="button"
            className={`mock-btn ${source === 'file' ? 'mock-btn--primary' : 'mock-btn--outline'}`}
            onClick={() => setSource('file')}
          >
            <Upload size={14} /> رفع الملف (حتى 50 ميجا)
          </button>
        </div>
      </div>
      {source === 'youtube' ? (
        <label className="cms-field">
          رابط التسجيل على YouTube
          <input
            type="url"
            dir="ltr"
            placeholder="https://youtu.be/..."
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
          />
        </label>
      ) : (
        <label className="cms-field">
          ملف التسجيل {file ? `(${file.name} — ${formatMb(file.size)})` : ''}
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      )}

      <label className="cms-field">
        هيتنشر فين؟
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="existing">درس في دورة موجودة</option>
          <option value="new">دورة جديدة لوحدها</option>
          <option value="lives_only">في قسم اللايفات بس (بنفس صلاحية اللايف)</option>
        </select>
      </label>

      {mode !== 'lives_only' && (
        <div className="grid-2" style={{ gap: 12 }}>
          <label className="cms-field">
            عنوان الدرس
            <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
          </label>
          <label className="cms-field">
            المدة بالدقايق
            <input type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
        </div>
      )}

      {mode === 'existing' && (
        <div className="grid-2" style={{ gap: 12 }}>
          <label className="cms-field">
            الدورة
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">اختاري الدورة</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="cms-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} />
            مجاني لكل الأمهات (حتى لو الدورة مدفوعة)
          </label>
        </div>
      )}

      {mode === 'new' && (
        <div className="grid-2" style={{ gap: 12 }}>
          <label className="cms-field">
            اسم الدورة
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))}
            />
          </label>
          <label className="cms-field">
            الوصول
            <select
              value={newCourse.accessType}
              onChange={(e) => setNewCourse((c) => ({ ...c, accessType: e.target.value }))}
            >
              {courseAccessOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {newCourse.accessType === 'paid' && (
            <>
              <label className="cms-field">
                السعر (يظهر للأم)
                <input
                  type="text"
                  placeholder="مثال: 199 جنيه"
                  value={newCourse.priceLabel}
                  onChange={(e) => setNewCourse((c) => ({ ...c, priceLabel: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                السعر بالدولار للدفع بـ PayPal (اختياري)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  dir="ltr"
                  value={newCourse.priceUsd}
                  onChange={(e) => setNewCourse((c) => ({ ...c, priceUsd: e.target.value }))}
                />
              </label>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button type="button" className="mock-btn mock-btn--primary" disabled={busy} onClick={onPublish}>
          {busy ? 'جاري النشر…' : 'انشري التسجيل'}
        </button>
      </div>
    </AdminCard>
  );
}
