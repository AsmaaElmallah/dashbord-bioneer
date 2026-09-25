import { AlertTriangle, ImageOff, Layers, Loader2, Presentation, Upload, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AudioFilePick } from './AudioFilePick';
import { ImageFilePick } from './ImageFilePick';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { extractPptxSlides } from '../utils/pptxSlides';

const MODES = [
  { id: 'pptx', label: 'ملف PowerPoint', hint: 'كل شريحة = صورة + صوت' },
  { id: 'separate', label: 'ملفات منفصلة', hint: 'صورة و/أو صوت' },
];

function SlideThumb({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file?.rawFile) return undefined;
    const next = URL.createObjectURL(file.rawFile);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (!url) {
    return (
      <div className="slide-media-source__thumb slide-media-source__thumb--empty">
        <ImageOff size={18} />
      </div>
    );
  }
  return <img className="slide-media-source__thumb" src={url} alt="" />;
}

export function SlideMediaSourcePick({
  mode = 'pptx',
  onModeChange,
  imageFile,
  audioFile,
  pptxFile,
  pptxSlides = [],
  onImagePick,
  onAudioPick,
  onPptxPick,
  compact = false,
}) {
  const inputRef = useRef(null);
  const { showSuccess, showError } = useSnackbar();
  const [extracting, setExtracting] = useState(false);

  const handlePptx = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const bundle = await extractPptxSlides(file);
      if (bundle.error) {
        showError(bundle.error);
        return;
      }
      onPptxPick?.(bundle);
      const usable = bundle.slides.filter((s) => s.imageFile || s.audioFile).length;
      showSuccess(`تم تجهيز ${usable} شريحة من ${bundle.slides.length}`);
    } finally {
      setExtracting(false);
    }
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
            onClick={() => !extracting && inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !extracting && inputRef.current?.click()}
          >
            <Presentation size={32} strokeWidth={1.5} />
            <p className="media-dropzone__title">ملف PowerPoint — شريحة أو أكثر</p>
            <p className="text-caption" style={{ margin: '0 0 8px', maxWidth: 340 }}>
              كل شريحة تتحول لشريحة في التطبيق: صورها تُجمَّع في صورة واحدة بنفس أماكنها + التعليق الصوتي (m4a/mp3)
            </p>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              disabled={extracting}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              {extracting ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
              {extracting ? 'جاري تجهيز الشرائح…' : 'اختر .pptx'}
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
                <span className="text-caption">{pptxSlides.length} شريحة</span>
                <StatusBadge tone="info">جاهز</StatusBadge>
                <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={clearPptx}>
                  <X size={14} />
                </button>
              </li>
            </ul>
          )}

          {pptxSlides.length > 0 && (
            <ul className="slide-media-source__slides">
              {pptxSlides.map((s) => (
                <li key={s.number} className="slide-media-source__slide">
                  <SlideThumb file={s.imageFile} />
                  <div className="slide-media-source__slide-info">
                    <strong>شريحة {s.number}</strong>
                    <span className="text-caption">
                      {s.audioFile ? <Volume2 size={13} /> : <VolumeX size={13} />}{' '}
                      {s.audioFile ? 'صوت' : 'بدون صوت'}
                    </span>
                    {s.warnings.map((w) => (
                      <span key={w} className="slide-media-source__warn">
                        <AlertTriangle size={12} /> {w}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
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
