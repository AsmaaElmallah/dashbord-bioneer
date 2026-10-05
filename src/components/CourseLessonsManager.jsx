import { Film, Link2, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';
import { parseYoutubeVideoId } from '../data/contentLibraryAdmin';
import {
  COURSE_VIDEO_ACCEPT,
  COURSE_VIDEO_MAX_BYTES,
  coursePublishLabel,
  coursePublishOptions,
  deleteLesson,
  emptyLessonDraft,
  listLessons,
  prepareLesson,
  removeCourseVideo,
  saveLesson,
  signedCourseVideoUrl,
  translateCoursesError,
  uploadCourseVideo,
} from '../services/supabase/coursesService';
import { formatBytes } from '../services/supabase/libraryPdfService';

const publishTone = { published: 'success', draft: 'muted', archived: 'muted' };

function LessonVideoPreview({ lesson }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    if (lesson.sourceType === 'upload' && lesson.videoPath) {
      signedCourseVideoUrl(lesson.videoPath).then((signed) => {
        if (!cancelled) setUrl(signed);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [lesson.sourceType, lesson.videoPath]);

  if (lesson.sourceType === 'youtube') {
    const id = parseYoutubeVideoId(lesson.youtubeInput) || lesson.youtubeVideoId;
    return id ? (
      <img className="media-video-pick__preview" src={getYoutubeThumbnailUrl(id)} alt="" style={{ objectFit: 'cover' }} />
    ) : (
      <div className="media-video-pick__empty">
        <Link2 size={24} />
      </div>
    );
  }
  if (url) return <video className="media-video-pick__preview" src={url} controls preload="metadata" />;
  return (
    <div className="media-video-pick__empty">
      <Film size={24} />
    </div>
  );
}

export function CourseLessonsManager({ course, onLessonsChanged }) {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listLessons(course.id);
    setLoading(false);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر تحميل الدروس');
    else setLessons(data);
  }, [course.id, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const handlePickVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showError('اختاري ملف فيديو (MP4 أو WEBM أو MOV).');
      return;
    }
    if (file.size > COURSE_VIDEO_MAX_BYTES) {
      showError(
        `حجم الفيديو ${formatBytes(file.size)} — الحد 50 ميجا. اضغطيه ببرنامج HandBrake (720p) أو استخدمي رابط YouTube.`,
      );
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً لرفع الفيديو.');
      return;
    }
    setUploading(true);
    const { data, error } = await uploadCourseVideo(course.id, file);
    setUploading(false);
    if (error || !data?.path) {
      showError(translateCoursesError(error?.message) ?? 'تعذّر رفع الفيديو');
      return;
    }
    const previous = draft.videoPath;
    const savedPaths = new Set(lessons.map((l) => l.videoPath).filter(Boolean));
    if (previous && !savedPaths.has(previous)) await removeCourseVideo(previous);
    patch({ sourceType: 'upload', videoPath: data.path, videoSizeBytes: data.size });
    showSuccess('تم رفع الفيديو — اضغطي «حفظ الدرس»');
  };

  const onSave = async () => {
    const { lesson, error: issue } = prepareLesson(draft);
    if (issue) {
      showError(issue);
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setSaving(true);
    const original = lessons.find((l) => l.id === lesson.id);
    const { error } = await saveLesson(lesson);
    setSaving(false);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر حفظ الدرس');
      return;
    }
    const replacedVideo =
      original?.videoPath && original.videoPath !== (lesson.sourceType === 'upload' ? lesson.videoPath : '');
    if (replacedVideo) await removeCourseVideo(original.videoPath);
    showSuccess('تم حفظ الدرس');
    setDraft(null);
    await reload();
    onLessonsChanged?.();
  };

  const onCancel = async () => {
    const savedPaths = new Set(lessons.map((l) => l.videoPath).filter(Boolean));
    if (draft?.videoPath && !savedPaths.has(draft.videoPath)) await removeCourseVideo(draft.videoPath);
    setDraft(null);
  };

  const onDelete = async (lesson) => {
    if (!window.confirm(`حذف درس «${lesson.title}» نهائياً؟`)) return;
    const { error } = await deleteLesson(lesson);
    if (error) {
      showError(translateCoursesError(error.message) ?? 'تعذّر الحذف');
      return;
    }
    showSuccess('تم حذف الدرس');
    if (draft?.id === lesson.id) setDraft(null);
    await reload();
    onLessonsChanged?.();
  };

  const isYoutube = draft?.sourceType === 'youtube';

  return (
    <AdminCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SectionHeader title={`دروس — ${course.title}`} />
        <button
          type="button"
          className="mock-btn mock-btn--primary"
          disabled={Boolean(draft)}
          onClick={() => setDraft(emptyLessonDraft(course.id, lessons.length))}
        >
          <Plus size={16} /> درس جديد
        </button>
      </div>

      {draft && (
        <div className="quran-session-add-form" style={{ margin: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{draft.id ? `تعديل — ${draft.title}` : 'درس جديد'}</strong>
            <button type="button" className="mock-btn mock-btn--outline" onClick={onCancel} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <label className="cms-field">
            عنوان الدرس
            <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <label className="cms-field">
            وصف أو ملاحظات (اختياري)
            <textarea rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>

          <div className="cms-field">
            <span>مصدر الفيديو</span>
            <div className="media-source-toggle">
              <button
                type="button"
                className={`mock-btn ${!isYoutube ? 'mock-btn--primary' : 'mock-btn--outline'}`}
                onClick={() => patch({ sourceType: 'upload' })}
              >
                <Upload size={14} /> رفع فيديو (حتى 50 ميجا)
              </button>
              <button
                type="button"
                className={`mock-btn ${isYoutube ? 'mock-btn--primary' : 'mock-btn--outline'}`}
                onClick={() => patch({ sourceType: 'youtube' })}
              >
                <Link2 size={14} /> رابط YouTube
              </button>
            </div>
          </div>

          <div className="cms-field">
            <div className="media-video-pick">
              <LessonVideoPreview lesson={draft} />
              {!isYoutube && (
                <div className="media-cover-pick__actions">
                  <label className="mock-btn mock-btn--outline" style={{ cursor: 'pointer' }}>
                    {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                    {uploading ? 'جاري رفع الفيديو…' : draft.videoPath ? 'تغيير الفيديو' : 'اختيار فيديو'}
                    <input
                      type="file"
                      accept={COURSE_VIDEO_ACCEPT}
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={handlePickVideo}
                    />
                  </label>
                  {draft.videoSizeBytes ? (
                    <span className="text-caption">{formatBytes(draft.videoSizeBytes)}</span>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {isYoutube && (
            <label className="cms-field">
              رابط فيديو YouTube (يفضّل «غير مُدرج»)
              <input
                type="text"
                dir="ltr"
                placeholder="https://youtu.be/… أو https://www.youtube.com/watch?v=…"
                value={draft.youtubeInput}
                onChange={(e) => patch({ youtubeInput: e.target.value })}
              />
            </label>
          )}

          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              المدة بالدقايق (اختياري)
              <input
                type="number"
                min="0"
                value={draft.durationMinutes}
                onChange={(e) => patch({ durationMinutes: e.target.value })}
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
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              الترتيب
              <input type="number" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} />
            </label>
            {course.accessType !== 'free' && (
              <label className="cms-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={draft.isPreview}
                  onChange={(e) => patch({ isPreview: e.target.checked })}
                />
                درس تجريبي (متاح لأي أم حتى لو الدورة مقفولة)
              </label>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving || uploading} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ الدرس'}
            </button>
            <button type="button" className="mock-btn mock-btn--outline" disabled={uploading} onClick={onCancel}>
              <X size={14} /> إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <MockLoading label="جاري تحميل الدروس…" />
      ) : lessons.length === 0 ? (
        <EmptyState icon={Film} title="لا توجد دروس" description="اضغطي «درس جديد» لإضافة أول درس." compact />
      ) : (
        <AdminTableContainer>
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>#</th>
                <th>الدرس</th>
                <th>المصدر</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, index) => (
                <tr key={lesson.id} className={draft?.id === lesson.id ? 'selected' : ''}>
                  <td>{index + 1}</td>
                  <td className="text-truncate" style={{ maxWidth: 260 }}>
                    {lesson.title}
                    <div className="text-caption">
                      {lesson.durationMinutes ? `${lesson.durationMinutes} دقيقة` : ''}
                      {lesson.isPreview ? ' · تجريبي' : ''}
                    </div>
                  </td>
                  <td>{lesson.sourceType === 'youtube' ? 'YouTube' : lesson.videoPath ? 'فيديو مرفوع' : '—'}</td>
                  <td>
                    <StatusBadge tone={publishTone[lesson.publishStatus] ?? 'muted'}>
                      {coursePublishLabel(lesson.publishStatus)}
                    </StatusBadge>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '4px 8px' }}
                      aria-label="تعديل"
                      disabled={Boolean(draft)}
                      onClick={() => setDraft({ ...lesson })}
                    >
                      <Pencil size={14} />
                    </button>{' '}
                    <button
                      type="button"
                      className="mock-btn mock-btn--outline"
                      style={{ padding: '4px 8px' }}
                      aria-label="حذف"
                      onClick={() => onDelete(lesson)}
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
  );
}
