import { Film, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useSnackbar } from '../context/SnackbarContext';
import {
  translateLibrarySaveError,
  uploadLibraryVideo,
} from '../services/supabase/libraryService';

const ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-m4v';

/** مصدر الفيديو: رابط YouTube أو ملف فيديو يُرفع إلى library-videos. */
export function MediaVideoSourceFields({ draft, setDraft, onYoutubeInput, youtubePlaceholder }) {
  const { showError, showSuccess } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const sourceType = draft.sourceType ?? 'youtube';

  const setSource = (next) => setDraft((d) => ({ ...d, sourceType: next }));

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showError('اختاري ملف فيديو (MP4 أو WEBM أو MOV).');
      return;
    }
    setUploading(true);
    const { data, error } = await uploadLibraryVideo(file);
    setUploading(false);
    if (error || !data?.url) {
      showError(`تعذّر رفع الفيديو: ${translateLibrarySaveError(error?.message) ?? 'خطأ غير معروف'}`);
      return;
    }
    setDraft((d) => ({ ...d, sourceType: 'upload', videoUrl: data.url }));
    showSuccess('تم رفع الفيديو');
  };

  return (
    <>
      <div className="cms-field">
        <span>مصدر الفيديو</span>
        <div className="media-source-toggle">
          <button
            type="button"
            className={`mock-btn ${sourceType === 'youtube' ? 'mock-btn--primary' : 'mock-btn--outline'}`}
            onClick={() => setSource('youtube')}
          >
            <Link2 size={14} /> رابط YouTube
          </button>
          <button
            type="button"
            className={`mock-btn ${sourceType === 'upload' ? 'mock-btn--primary' : 'mock-btn--outline'}`}
            onClick={() => setSource('upload')}
          >
            <Upload size={14} /> رفع فيديو
          </button>
        </div>
      </div>

      {sourceType === 'youtube' ? (
        <>
          <label className="cms-field">
            نوع YouTube
            <select
              value={draft.contentType}
              onChange={(e) => setDraft((d) => ({ ...d, contentType: e.target.value }))}
            >
              <option value="video">فيديو / Short</option>
              <option value="playlist">Playlist</option>
            </select>
          </label>
          <label className="cms-field">
            رابط YouTube (يدعم shorts · youtu.be · playlist)
            <input
              type="text"
              dir="ltr"
              placeholder={youtubePlaceholder}
              value={draft.youtubeInput}
              onChange={(e) => onYoutubeInput(e.target.value)}
            />
          </label>
        </>
      ) : (
        <div className="cms-field">
          <span>ملف الفيديو (MP4 مفضّل)</span>
          <div className="media-video-pick">
            {draft.videoUrl ? (
              <video className="media-video-pick__preview" src={draft.videoUrl} controls preload="metadata" />
            ) : (
              <div className="media-video-pick__empty">
                <Film size={24} />
              </div>
            )}
            <div className="media-cover-pick__actions">
              <label className="mock-btn mock-btn--outline" style={{ cursor: 'pointer' }}>
                {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                {uploading ? 'جاري رفع الفيديو…' : draft.videoUrl ? 'تغيير الفيديو' : 'اختيار فيديو'}
                <input
                  type="file"
                  accept={ACCEPT}
                  style={{ display: 'none' }}
                  disabled={uploading}
                  onChange={handlePick}
                />
              </label>
              {draft.videoUrl && !uploading && (
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  onClick={() => setDraft((d) => ({ ...d, videoUrl: '' }))}
                >
                  <Trash2 size={14} /> إزالة
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
