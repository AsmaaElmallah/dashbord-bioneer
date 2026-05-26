import { Upload, Volume2, X } from 'lucide-react';
import { useRef } from 'react';
import { AppContentPreview } from './AppContentPreview';
import { AdminCard } from './AdminCard';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { createEmptyAppPreview } from '../data/appContentPreview';
import {
  audioFormatOptions,
  audioPublishStatusOptions,
  audioUsageOptions,
  formatDurationLabel,
  getAudioContentValidation,
  getAudioUsageLabel,
} from '../data/audioContentEditor';
import { mockFileFromInput } from '../utils/mediaUpload';

const publishTone = {
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
  منشور: 'success',
};

const ageOptions = ['كل الأعمار', '0-6 أشهر', '6-12 شهر', '9-36 شهر'];

function AudioDropzone({ file, onPick, onClear }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handlePick = (fileList) => {
    const picked = mockFileFromInput(fileList?.[0]);
    if (picked) {
      onPick(picked);
      showMock('اختيار صوت (mock) — لم يُرفع فعلياً');
    }
  };

  return (
    <div className="media-dropzone">
      <p className="media-dropzone__label">ملف الصوت</p>
      <div
        className="media-dropzone__zone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Upload size={28} strokeWidth={1.5} />
        <p className="media-dropzone__title">mp3 / m4a / wav (mock)</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          اختر ملف صوت
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => {
            handlePick(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {file && (
        <ul className="media-dropzone__files">
          <li className="media-dropzone__file">
            <span className="media-dropzone__file-name">{file.name}</span>
            <span className="text-caption">{file.sizeMock}</span>
            <StatusBadge tone="warning">لم يُرفع فعلياً</StatusBadge>
            <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={onClear}>
              <X size={14} />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function AudioPreviewPanel({ content }) {
  return (
    <div className="audio-content-preview" dir="rtl">
      <div className={`audio-content-preview__player${content.audioFile ? '' : ' audio-content-preview__player--empty'}`}>
        <Volume2 size={32} strokeWidth={1.5} aria-hidden />
        {content.audioFile ? (
          <p>[معاينة mock: {content.audioFile.name}]</p>
        ) : (
          <p>لا ملف — اختر mp3/m4a mock</p>
        )}
        {content.durationSec && (
          <span className="audio-content-preview__duration">{formatDurationLabel(content.durationSec)}</span>
        )}
      </div>
      <h3 className="audio-content-preview__title">{content.title || '— عنوان الصوت —'}</h3>
      {content.transcript && <p className="text-caption">{content.transcript}</p>}
      <div className="audio-content-preview__meta">
        <StatusBadge tone="info">{getAudioUsageLabel(content.usageId)}</StatusBadge>
        <StatusBadge tone="muted">{content.format?.toUpperCase() ?? '—'}</StatusBadge>
        <StatusBadge tone={publishTone[content.publishStatus] ?? 'muted'}>{content.publishStatus}</StatusBadge>
      </div>
      {content.assetPath && (
        <p className="text-caption">
          <code>{content.assetPath}</code>
        </p>
      )}
      {content.reciterId && <p className="text-caption">القارئ: {content.reciterId}</p>}
      {content.packageId && <p className="text-caption">Package: {content.packageId}</p>}
      <p className="text-caption">العمر: {content.targetAudience}</p>
      {content.placement && <p className="text-caption">الظهور: {content.placement}</p>}
    </div>
  );
}

function toAppPreview(content) {
  return createEmptyAppPreview({
    contentType: 'slide',
    title: content.title || 'ملف صوت',
    subtitle: getAudioUsageLabel(content.usageId),
    bodyPreview: content.transcript || `مدة ${formatDurationLabel(content.durationSec)} · ${content.format}`,
    imageUrl: null,
    ageLabel: content.targetAudience,
    section: getAudioUsageLabel(content.usageId),
    placement: content.placement || content.assetPath,
    status: content.publishStatus,
  });
}

export function AudioContentEditor({ value, onChange }) {
  const content = value;
  const validation = getAudioContentValidation(content);
  const patch = (partial) => onChange({ ...content, ...partial });

  return (
    <div className="audio-content-editor">
      <div className="grid-2 audio-content-editor__layout">
        <div className="audio-content-editor__form">
          <AdminCard>
            <SectionHeader title="الصوت" />
            <AudioDropzone
              file={content.audioFile}
              onPick={(audioFile) => patch({ audioFile })}
              onClear={() => patch({ audioFile: null })}
            />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                الصيغة
                <select value={content.format} onChange={(e) => patch({ format: e.target.value })}>
                  {audioFormatOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                durationSec
                <input
                  type="number"
                  min="1"
                  value={content.durationSec}
                  onChange={(e) => patch({ durationSec: e.target.value })}
                  placeholder="45"
                />
              </label>
            </div>
            <label className="cms-field">
              transcript / ملاحظة
              <textarea
                rows={2}
                value={content.transcript}
                onChange={(e) => patch({ transcript: e.target.value })}
                placeholder="نص التعليق أو وصف الجلسة"
              />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="بيانات ونشر" />
            <label className="cms-field">
              العنوان
              <input type="text" value={content.title} onChange={(e) => patch({ title: e.target.value })} />
            </label>
            <label className="cms-field">
              الاستخدام
              <select value={content.usageId} onChange={(e) => patch({ usageId: e.target.value })}>
                {audioUsageOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              مسار asset (mock)
              <input
                type="text"
                value={content.assetPath}
                onChange={(e) => patch({ assetPath: e.target.value })}
                placeholder="assets/math/packages/.../slide_001.m4a"
              />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                packageId (اختياري)
                <input type="text" value={content.packageId} onChange={(e) => patch({ packageId: e.target.value })} />
              </label>
              <label className="cms-field">
                reciterId (قرآن)
                <input type="text" value={content.reciterId} onChange={(e) => patch({ reciterId: e.target.value })} />
              </label>
            </div>
            <label className="cms-field">
              مكان الظهور
              <input type="text" value={content.placement} onChange={(e) => patch({ placement: e.target.value })} />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                العمر المستهدف
                <select
                  value={content.targetAudience}
                  onChange={(e) => patch({ targetAudience: e.target.value })}
                >
                  {ageOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                حالة النشر
                <select value={content.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                  {audioPublishStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </AdminCard>

          {validation.length > 0 && (
            <div className="audio-content-validation">
              {validation.map((v) => (
                <InfoBanner key={v.id} tone="warning">
                  {v.message}
                </InfoBanner>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ</MockActionButton>
            <MockActionButton action="check">إرسال للمراجعة</MockActionButton>
            <MockActionButton action="publish">نشر في الأصول</MockActionButton>
          </div>
        </div>

        <AdminCard className="audio-content-editor__preview-wrap">
          <SectionHeader title="معاينة الصوت" />
          <AudioPreviewPanel content={content} />
          <SectionHeader title="شاشة التطبيق (mock)" />
          <AppContentPreview preview={toAppPreview(content)} compact />
        </AdminCard>
      </div>
    </div>
  );
}
