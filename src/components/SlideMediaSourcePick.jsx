import { ImageIcon, Layers, Presentation, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { AudioFilePick } from './AudioFilePick';
import { ImageFilePick } from './ImageFilePick';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { mockPptxSlideBundleFromInput } from '../utils/mediaUpload';

const MODES = [
  { id: 'pptx', label: 'شريحة PowerPoint', hint: 'PNG + صوت من ملف واحد' },
  { id: 'separate', label: 'ملفات منفصلة', hint: 'صورة و/أو صوت' },
];

export function SlideMediaSourcePick({
  mode = 'pptx',
  onModeChange,
  imageFile,
  audioFile,
  pptxFile,
  onImagePick,
  onAudioPick,
  onPptxPick,
  compact = false,
}) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handlePptx = (fileList) => {
    const bundle = mockPptxSlideBundleFromInput(fileList?.[0]);
    if (!bundle) return;
    onPptxPick?.(bundle);
    showMock('تم استخراج الصورة والصوت من الملف');
  };

  const clearPptx = () => {
    onPptxPick?.(null);
  };

  return (
    <div className={`slide-media-source${compact ? ' slide-media-source--compact' : ''}`}>
      <div className="slide-media-source__modes" role="tablist" aria-label="طريقة رفع الوسائط">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`slide-media-source__mode${mode === m.id ? ' slide-media-source__mode--active' : ''}`}
            onClick={() => onModeChange?.(m.id)}
          >
            <span className="slide-media-source__mode-label">{m.label}</span>
            <span className="slide-media-source__mode-hint">{m.hint}</span>
          </button>
        ))}
      </div>

      {mode === 'pptx' && (
        <div className="slide-media-source__pptx">
          <div
            className="media-dropzone__zone slide-media-source__pptx-zone"
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            <Presentation size={32} strokeWidth={1.5} />
            <p className="media-dropzone__title">ملف PowerPoint — شريحة واحدة</p>
            <p className="text-caption" style={{ margin: '0 0 8px', maxWidth: 320 }}>
              يُستخرج تلقائياً: صورة الشريحة (PNG) + التعليق الصوتي (m4a) من نفس الملف
            </p>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Upload size={16} />
              اختر .pptx
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              hidden
              onChange={(e) => {
                handlePptx(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {pptxFile && (
            <ul className="media-dropzone__files">
              <li className="media-dropzone__file">
                <Layers size={16} />
                <span className="media-dropzone__file-name">{pptxFile.name}</span>
                <span className="text-caption">{pptxFile.sizeMock}</span>
                <StatusBadge tone="info">جاهز</StatusBadge>
                <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={clearPptx}>
                  <X size={14} />
                </button>
              </li>
            </ul>
          )}

          {imageFile?.source === 'pptx' && audioFile?.source === 'pptx' && (
            <div className="slide-media-source__extracted">
              <p className="slide-media-source__extracted-title">مستخرج من PowerPoint</p>
              <div className="slide-media-source__extracted-row">
                <ImageIcon size={14} />
                <span>{imageFile.name}</span>
                <span className="text-caption">{imageFile.sizeMock}</span>
              </div>
              <div className="slide-media-source__extracted-row">
                <span aria-hidden>🔊</span>
                <span>{audioFile.name}</span>
                <span className="text-caption">{audioFile.sizeMock}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'separate' && (
        <div className="grid-2 slide-media-source__separate" style={{ gap: 12 }}>
          <ImageFilePick file={imageFile} onPick={onImagePick} />
          <AudioFilePick label="صوت الشريحة (m4a)" file={audioFile} onPick={onAudioPick} />
        </div>
      )}
    </div>
  );
}
