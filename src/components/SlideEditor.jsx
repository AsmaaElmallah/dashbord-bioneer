import { Clock, Image, Upload, Volume2, X } from 'lucide-react';
import { useRef } from 'react';
import { AdminCard } from './AdminCard';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  fileLabel,
  getSlideValidation,
  slideFileStatusOptions,
  slidePackageOptions,
  slideTracks,
} from '../data/slideEditor';
import { getTrackMeta } from '../data/lessonBuilder';
import { mockFileFromInput } from '../utils/mediaUpload';

const fileStatusTone = {
  موجود: 'success',
  ناقص: 'error',
  'يحتاج مراجعة': 'warning',
};

function MockFilePick({ label, accept, file, onPick, compact }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const pick = (fileList) => {
    if (!fileList?.[0]) return;
    onPick(mockFileFromInput(fileList[0]));
    showMock('اختيار ملف (UI فقط) — لا upload');
  };

  return (
    <div className={`slide-file-pick${compact ? ' slide-file-pick--compact' : ''}`}>
      <span className="slide-file-pick__label">{label}</span>
      {file ? (
        <p className="slide-file-pick__name">
          {fileLabel(file)} · {file.sizeMock}
          <StatusBadge tone="warning">لم يُرفع</StatusBadge>
          <button type="button" className="media-dropzone__remove" onClick={() => onPick(null)}>
            <X size={14} />
          </button>
        </p>
      ) : (
        <p className="text-caption">لم يُختَر ملف</p>
      )}
      <button type="button" className="mock-btn mock-btn--outline" onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> اختر ملف
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

function SlideTimeline({ slide }) {
  return (
    <div className="slide-timeline">
      <div className={`slide-timeline__step${slide.mainImage ? ' slide-timeline__step--ok' : ''}`}>
        <Image size={18} />
        <span>صورة</span>
        <small>{slide.mainImage ? '✓' : '—'}</small>
      </div>
      <div className="slide-timeline__line" />
      <div className={`slide-timeline__step${slide.audioFile ? ' slide-timeline__step--ok' : ''}`}>
        <Volume2 size={18} />
        <span>صوت</span>
        <small>{slide.audioFile ? '✓' : '—'}</small>
      </div>
      <div className="slide-timeline__line" />
      <div className={`slide-timeline__step${slide.durationSec ? ' slide-timeline__step--ok' : ''}`}>
        <Clock size={18} />
        <span>مدة</span>
        <small>{slide.durationSec ? `${slide.durationSec}s` : '—'}</small>
      </div>
    </div>
  );
}

function SlidePreviewLarge({ slide }) {
  const track = getTrackMeta(slide.track);
  const tags = slide.tags.split(/،|,/).map((t) => t.trim()).filter(Boolean);

  return (
    <div className="slide-preview-large" dir="rtl">
      <div className="slide-preview-large__meta">
        <StatusBadge tone="info">{track.label}</StatusBadge>
        <StatusBadge tone={fileStatusTone[slide.fileStatus]}>{slide.fileStatus}</StatusBadge>
        <span className="text-caption">
          pkg: <code>{slide.packageId}</code> · #{slide.globalIndex}
        </span>
      </div>
      <div className="slide-preview-large__frame">
        {slide.mainImage ? (
          <span>[صورة mock: {fileLabel(slide.mainImage)}]</span>
        ) : (
          <span className="text-caption">لا صورة — أضف الصورة الأساسية</span>
        )}
      </div>
      {slide.altText && <p className="text-caption">alt: {slide.altText}</p>}
      <SlideTimeline slide={slide} />
      {slide.motherInstructions && (
        <div className="slide-preview-large__instructions">
          <strong>للأم:</strong> {slide.motherInstructions}
        </div>
      )}
      {tags.length > 0 && (
        <p className="slide-preview-large__tags">
          {tags.map((t) => (
            <span key={t} className="page-header__chip">
              #{t}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export function SlideEditor({ value, onChange }) {
  const slide = value;
  const validation = getSlideValidation(slide);
  const packages = slidePackageOptions[slide.track] ?? [];

  const patch = (partial) => onChange({ ...slide, ...partial });

  return (
    <div className="slide-editor">

      <div className="grid-2 slide-editor__layout">
        <div className="slide-editor__form">
          <AdminCard>
            <SectionHeader title="موضع الشريحة" />
            <div className="chip-grid">
              {slideTracks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-btn${slide.track === t.id ? ' chip-btn--active' : ''}`}
                  onClick={() =>
                    patch({
                      track: t.id,
                      packageId: slidePackageOptions[t.id]?.[0] ?? '',
                    })
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
              <label className="cms-field">
                package id (mock)
                <select value={slide.packageId} onChange={(e) => patch({ packageId: e.target.value })}>
                  {packages.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                حالة الملفات
                <select value={slide.fileStatus} onChange={(e) => patch({ fileStatus: e.target.value })}>
                  {slideFileStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                رقم الشريحة في الدرس
                <input
                  type="number"
                  min="1"
                  value={slide.slideIndexInLesson}
                  onChange={(e) => patch({ slideIndexInLesson: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="cms-field">
                global index (mock)
                <input
                  type="number"
                  min="1"
                  value={slide.globalIndex}
                  onChange={(e) => patch({ globalIndex: Number(e.target.value) || 1 })}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="الوسائط" />
            <MockFilePick
              label="الصورة الأساسية"
              accept="image/*"
              file={slide.mainImage}
              onPick={(mainImage) => patch({ mainImage, fileStatus: mainImage ? slide.fileStatus : 'ناقص' })}
            />
            <MockFilePick
              compact
              label="صور إضافية"
              accept="image/*"
              file={slide.extraImages[0] ?? null}
              onPick={(f) => patch({ extraImages: f ? [f] : [] })}
            />
            <MockFilePick
              compact
              label="الصوت"
              accept="audio/*"
              file={slide.audioFile}
              onPick={(audioFile) => patch({ audioFile })}
            />
            <label className="cms-field">
              durationSec
              <input
                type="number"
                min="1"
                value={slide.durationSec}
                onChange={(e) => patch({ durationSec: e.target.value })}
                placeholder="45"
              />
            </label>
            <label className="cms-field">
              alt text
              <input type="text" value={slide.altText} onChange={(e) => patch({ altText: e.target.value })} />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="محتوى ووسوم" />
            <label className="cms-field">
              تعليمات للأم
              <textarea
                rows={3}
                value={slide.motherInstructions}
                onChange={(e) => patch({ motherInstructions: e.target.value })}
              />
            </label>
            <label className="cms-field">
              tags
              <input type="text" value={slide.tags} onChange={(e) => patch({ tags: e.target.value })} />
            </label>
          </AdminCard>

          {validation.length > 0 && (
            <div className="slide-validation">
              <p className="cms-field" style={{ marginBottom: 8 }}>
                تحقق شكلي
              </p>
              {validation.map((v) => (
                <InfoBanner key={v.id} tone={v.severity === 'error' ? 'warning' : 'info'}>
                  {v.message}
                </InfoBanner>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ مسودة</MockActionButton>
            <MockActionButton action="check" message="إرسال للمراجعة (UI فقط)">
              إرسال للمراجعة
            </MockActionButton>
            <MockActionButton
              action="publish"
              message={
                validation.some((v) => v.id === 'noImage')
                  ? 'لا يمكن النشر بدون صورة (UI فقط)'
                  : undefined
              }
            >
              نشر
            </MockActionButton>
          </div>
        </div>

        <AdminCard className="slide-editor__preview-wrap">
          <SectionHeader title="معاينة الشريحة" />
          <SlidePreviewLarge slide={slide} />
        </AdminCard>
      </div>
    </div>
  );
}
