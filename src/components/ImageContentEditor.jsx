import { Upload, X } from 'lucide-react';
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
  getImageContentValidation,
  getUsageLabel,
  imagePublishStatusOptions,
  imageUsageOptions,
} from '../data/imageContentEditor';
import { mockFileFromInput } from '../utils/mediaUpload';

const publishTone = {
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
  منشور: 'success',
};

const ageOptions = ['كل الأعمار', '0-6 أشهر', '6-12 شهر', '9-36 شهر'];

function ImageDropzone({ file, onPick, onClear }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handlePick = (fileList) => {
    const picked = mockFileFromInput(fileList?.[0]);
    if (picked) {
      onPick(picked);
      showMock('اختيار صورة (mock) — لم يُرفع فعلياً');
    }
  };

  return (
    <div className="media-dropzone">
      <p className="media-dropzone__label">ملف الصورة</p>
      <div
        className="media-dropzone__zone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Upload size={28} strokeWidth={1.5} />
        <p className="media-dropzone__title">PNG / JPG / WebP (mock)</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          اختر صورة
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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

function ImagePreviewPanel({ content }) {
  return (
    <div className="image-content-preview" dir="rtl">
      {content.imageFile ? (
        <div className="image-content-preview__img">[معاينة mock: {content.imageFile.name}]</div>
      ) : (
        <div className="image-content-preview__img image-content-preview__img--empty">
          لا صورة — اختر ملف mock
        </div>
      )}
      <h3 className="image-content-preview__title">{content.title || '— عنوان الصورة —'}</h3>
      {content.caption && <p className="text-caption">{content.caption}</p>}
      <div className="image-content-preview__meta">
        <StatusBadge tone="info">{getUsageLabel(content.usageId)}</StatusBadge>
        <StatusBadge tone={publishTone[content.publishStatus] ?? 'muted'}>{content.publishStatus}</StatusBadge>
      </div>
      {content.altText && (
        <p className="text-caption">
          <strong>alt:</strong> {content.altText}
        </p>
      )}
      {content.assetPath && (
        <p className="text-caption">
          <code>{content.assetPath}</code>
        </p>
      )}
      {content.dimensions && <p className="text-caption">الأبعاد: {content.dimensions}</p>}
      <p className="text-caption">العمر: {content.targetAudience}</p>
      {content.placement && <p className="text-caption">الظهور: {content.placement}</p>}
    </div>
  );
}

function toAppPreview(content) {
  return createEmptyAppPreview({
    contentType: 'slide',
    title: content.title || 'صورة',
    subtitle: getUsageLabel(content.usageId),
    bodyPreview: content.caption || content.altText,
    imageUrl: content.imageFile ? 'mock://image' : null,
    ageLabel: content.targetAudience,
    section: getUsageLabel(content.usageId),
    placement: content.placement || content.assetPath,
    status: content.publishStatus,
  });
}

export function ImageContentEditor({ value, onChange }) {
  const content = value;
  const validation = getImageContentValidation(content);
  const patch = (partial) => onChange({ ...content, ...partial });

  return (
    <div className="image-content-editor">
      <InfoBanner tone="info">
        ImageContentEditor — رفع mock فقط. للربط بشرائح/أصول — متوافق مع <code>/assets</code>.
      </InfoBanner>

      <div className="grid-2 image-content-editor__layout">
        <div className="image-content-editor__form">
          <AdminCard>
            <SectionHeader title="الصورة" />
            <ImageDropzone
              file={content.imageFile}
              onPick={(imageFile) => patch({ imageFile })}
              onClear={() => patch({ imageFile: null })}
            />
            <label className="cms-field">
              alt text
              <input
                type="text"
                value={content.altText}
                onChange={(e) => patch({ altText: e.target.value })}
                placeholder="وصف للقارئ الآلي"
              />
            </label>
            <label className="cms-field">
              caption
              <input type="text" value={content.caption} onChange={(e) => patch({ caption: e.target.value })} />
            </label>
            <label className="cms-field">
              الأبعاد (mock)
              <input
                type="text"
                value={content.dimensions}
                onChange={(e) => patch({ dimensions: e.target.value })}
                placeholder="1024×768"
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
                {imageUsageOptions.map((u) => (
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
                placeholder="assets/math/slides/..."
              />
            </label>
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
                  {imagePublishStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </AdminCard>

          {validation.length > 0 && (
            <div className="image-content-validation">
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

        <AdminCard className="image-content-editor__preview-wrap">
          <SectionHeader title="معاينة الصورة" />
          <ImagePreviewPanel content={content} />
          <SectionHeader title="شاشة التطبيق (mock)" />
          <AppContentPreview preview={toAppPreview(content)} compact />
        </AdminCard>
      </div>
    </div>
  );
}
