import { Link2, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { useSnackbar } from '../context/SnackbarContext';
import {
  createEmptyMediaUpload,
  getMediaValidation,
  mockFileFromInput,
  mockLinkedAssetCatalog,
} from '../utils/mediaUpload';
import { InfoBanner } from './InfoBanner';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';

function FileDropzone({
  label,
  accept,
  multiple,
  file,
  files,
  onPick,
  compact,
}) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handleFiles = (fileList) => {
    if (!fileList?.length) return;
    if (multiple) {
      const picked = Array.from(fileList).map(mockFileFromInput).filter(Boolean);
      onPick([...(files ?? []), ...picked]);
    } else {
      onPick(mockFileFromInput(fileList[0]));
    }
    showMock('اختيار ملف (UI فقط) — لم يُرفع ولم يُحفظ');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('media-dropzone--drag');
  };

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove('media-dropzone--drag');
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('media-dropzone--drag');
    handleFiles(e.dataTransfer.files);
  };

  const displayList = multiple ? files ?? [] : file ? [file] : [];

  return (
    <div className={`media-dropzone${compact ? ' media-dropzone--compact' : ''}`}>
      <p className="media-dropzone__label">{label}</p>
      <div
        className="media-dropzone__zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Upload size={compact ? 22 : 28} strokeWidth={1.5} />
        <p className="media-dropzone__title">اسحب الملفات هنا</p>
        <p className="text-caption">أو</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={() => inputRef.current?.click()}
        >
          اختر ملف
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {displayList.length > 0 && (
        <ul className="media-dropzone__files">
          {displayList.map((f, i) => (
            <li key={`${f.name}-${i}`} className="media-dropzone__file">
              <span className="media-dropzone__file-name">{f.name}</span>
              {f.sizeMock && <span className="text-caption">{f.sizeMock}</span>}
              <StatusBadge tone="warning">لم يتم رفعه فعلياً</StatusBadge>
              <button
                type="button"
                className="media-dropzone__remove"
                aria-label="إزالة"
                onClick={() => {
                  if (multiple) {
                    onPick(displayList.filter((_, idx) => idx !== i));
                  } else {
                    onPick(null);
                  }
                }}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MediaUploadPanel({ value, onChange, contentType }) {
  const media = value ?? createEmptyMediaUpload();
  const validation = getMediaValidation(contentType, media);
  const { showMock } = useSnackbar();

  const patch = (partial) => onChange({ ...media, ...partial });

  const linkAsset = (asset) => {
    if (media.linkedAssets.some((a) => a.id === asset.id)) return;
    patch({ linkedAssets: [...media.linkedAssets, asset] });
    showMock(`ربط ${asset.name} (mock) — UI فقط`);
  };

  const unlinkAsset = (id) => {
    patch({ linkedAssets: media.linkedAssets.filter((a) => a.id !== id) });
  };

  return (
    <div className="media-upload-panel">
      <SectionHeader title="الوسائط والملفات" />
      <InfoBanner tone="info">
        رفع وهمي — اختيار الملف يعرض الاسم فقط في الواجهة. <strong>لا upload</strong> ولا حفظ بعد
        refresh.
      </InfoBanner>

      {!media.coverImage &&
        !media.audioFile &&
        !media.videoFile &&
        !media.youtubeVideoId?.trim() &&
        !media.extraImages?.length && (
          <EmptyState
            compact
            title="لا يوجد محتوى مضاف"
            description="اختر ملفاً mock أو أدخل YouTube videoId — لم يُرفع شيء فعلياً."
          />
        )}

      <FileDropzone
        label="صورة رئيسية"
        accept="image/*"
        file={media.coverImage}
        onPick={(coverImage) => patch({ coverImage })}
      />

      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          alt text
          <input
            type="text"
            value={media.imageAlt}
            onChange={(e) => patch({ imageAlt: e.target.value })}
          />
        </label>
        <label className="cms-field">
          caption
          <input
            type="text"
            value={media.caption}
            onChange={(e) => patch({ caption: e.target.value })}
          />
        </label>
      </div>

      <FileDropzone
        compact
        label="صور إضافية"
        accept="image/*"
        multiple
        files={media.extraImages}
        onPick={(extraImages) => patch({ extraImages })}
      />

      <div className="grid-2" style={{ gap: 12 }}>
        <FileDropzone
          compact
          label="ملف صوت"
          accept="audio/*"
          file={media.audioFile}
          onPick={(audioFile) => patch({ audioFile })}
        />
        <FileDropzone
          compact
          label="ملف فيديو"
          accept="video/*"
          file={media.videoFile}
          onPick={(videoFile) => patch({ videoFile })}
        />
      </div>

      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          YouTube videoId
          <input
            type="text"
            value={media.youtubeVideoId}
            onChange={(e) => patch({ youtubeVideoId: e.target.value })}
            placeholder="dQw4w9WgXcQ"
          />
        </label>
        <label className="cms-field">
          YouTube playlistId
          <input
            type="text"
            value={media.playlistId}
            onChange={(e) => patch({ playlistId: e.target.value })}
          />
        </label>
      </div>

      <label className="cms-field">
        مدة المحتوى
        <input
          type="text"
          value={media.duration}
          onChange={(e) => patch({ duration: e.target.value })}
          placeholder="4:32"
        />
      </label>

      <label className="cms-field">
        حقوق الاستخدام / source note
        <textarea
          rows={2}
          value={media.sourceNote}
          onChange={(e) => patch({ sourceNote: e.target.value })}
          placeholder="مصدر المحتوى، ترخيص، ملاحظات للفريق…"
        />
      </label>

      <AdminCardSection title="أصول مرتبطة (mock)">
        {media.linkedAssets.length > 0 ? (
          <ul className="media-linked-list">
            {media.linkedAssets.map((a) => (
              <li key={a.id} className="media-linked-list__item">
                <Link2 size={14} />
                <span>
                  <strong>{a.name}</strong>
                  <code className="text-caption">{a.path}</code>
                </span>
                <StatusBadge tone="muted">{a.type}</StatusBadge>
                <button type="button" className="media-dropzone__remove" onClick={() => unlinkAsset(a.id)}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            title="لا توجد ملفات مرتبطة"
            description="اختر أصلاً من القائمة أدناه — رش mock بدون رفع."
          />
        )}
        <div className="media-linked-catalog">
          {mockLinkedAssetCatalog.map((a) => (
            <button
              key={a.id}
              type="button"
              className="mock-btn mock-btn--outline"
              disabled={media.linkedAssets.some((x) => x.id === a.id)}
              onClick={() => linkAsset(a)}
            >
              ربط {a.name}
            </button>
          ))}
        </div>
      </AdminCardSection>

      {validation.length > 0 && (
        <div className="media-validation">
          <p className="cms-field" style={{ marginBottom: 8 }}>
            تحقق شكلي (UI فقط)
          </p>
          {validation.map((v) => (
            <InfoBanner key={v.id} tone="warning">
              {v.message}
            </InfoBanner>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminCardSection({ title, children }) {
  return (
    <div className="media-linked-section">
      <SectionHeader title={title} />
      {children}
    </div>
  );
}
