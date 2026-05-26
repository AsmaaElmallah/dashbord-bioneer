import { Link2, ListVideo, Video } from 'lucide-react';
import { AppContentPreview } from './AppContentPreview';
import { AdminCard } from './AdminCard';
import { fromLibraryContent } from '../data/appContentPreview';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  buildPlacementLabel,
  deriveItemType,
  getCategoryMeta,
  getLibraryContentValidation,
  getYoutubeThumbnailUrl,
  libraryContentTypes,
  libraryEditorCategories,
  libraryLinkStatusOptions,
  libraryPublishStatusOptions,
  libraryRequiredPlanOptions,
  libraryTargetAgeOptions,
  natureChipOptions,
} from '../data/libraryContentEditor';

const linkStatusTone = {
  سليم: 'success',
  'يحتاج مراجعة': 'warning',
  'معطّل (mock)': 'error',
};

const publishStatusTone = {
  منشور: 'success',
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
};

function LibraryContentPreview({ content }) {
  const itemType = deriveItemType(content);
  const thumbUrl = getYoutubeThumbnailUrl(content.videoId);
  const targetAge = libraryTargetAgeOptions.find((a) => a.id === content.targetAgeId);

  return (
    <div className="library-content-preview" dir="rtl">
      {thumbUrl ? (
        <img className="library-preview-thumb library-content-preview__thumb" src={thumbUrl} alt="" />
      ) : (
        <div className="math-slide-preview__img library-content-preview__placeholder">
          {itemType === 'playlist' ? 'Playlist — بدون thumbnail فيديو' : 'أدخل videoId للمعاينة'}
        </div>
      )}
      <h3 className="library-content-preview__title">{content.title || '— عنوان المحتوى —'}</h3>
      <div className="library-content-preview__meta">
        <StatusBadge tone="info">
          {itemType === 'playlist' ? (
            <>
              <ListVideo size={12} /> Playlist
            </>
          ) : (
            <>
              <Video size={12} /> فيديو YouTube
            </>
          )}
        </StatusBadge>
        <StatusBadge tone={linkStatusTone[content.linkStatus] ?? 'muted'}>{content.linkStatus}</StatusBadge>
        <StatusBadge tone={publishStatusTone[content.publishStatus] ?? 'muted'}>
          {content.publishStatus}
        </StatusBadge>
      </div>
      <p className="library-content-preview__placement">
        <strong>مكان الظهور:</strong> {buildPlacementLabel(content.categoryId)}
      </p>
      {content.videoId && (
        <p className="text-caption">
          videoId: <code>{content.videoId}</code>
        </p>
      )}
      {content.playlistId && (
        <p className="text-caption">
          playlistId: <code style={{ wordBreak: 'break-all' }}>{content.playlistId}</code>
        </p>
      )}
      <p className="text-caption">
        المدة: {content.duration || '—'} · mood: {content.moodTag || '—'}
      </p>
      {content.categoryId === 'nature' && content.natureChip && (
        <p className="text-caption">
          natureChip:{' '}
          {natureChipOptions.find((c) => c.id === content.natureChip)?.label ?? content.natureChip}
        </p>
      )}
      <p className="text-caption">
        العمر: {targetAge?.label ?? '—'} · الباقة: {content.requiredPlan}
      </p>
    </div>
  );
}

export function LibraryContentEditor({ value, onChange }) {
  const content = value;
  const validation = getLibraryContentValidation(content);
  const category = getCategoryMeta(content.categoryId);
  const { showMock } = useSnackbar();

  const patch = (partial) => onChange({ ...content, ...partial });

  const handleCheckLink = () => {
    const hasId = content.videoId?.trim() || content.playlistId?.trim();
    showMock(
      hasId
        ? 'فحص الرابط (UI فقط) — لا تحقق YouTube فعلي؛ الحالة mock: سليم'
        : 'فحص الرابط — أدخل videoId أو playlistId أولاً',
    );
    if (hasId && content.linkStatus === 'معطّل (mock)') {
      patch({ linkStatus: 'يحتاج مراجعة' });
    }
  };

  return (
    <div className="library-content-editor">

      <div className="grid-2 library-content-editor__layout">
        <div className="library-content-editor__form">
          <AdminCard>
            <SectionHeader title="نوع المحتوى والفئة" />
            <div className="chip-grid">
              {libraryContentTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-btn${content.contentType === t.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patch({ contentType: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="cms-field" style={{ marginTop: 12 }}>
              الفئة
              <select
                value={content.categoryId}
                onChange={(e) =>
                  patch({
                    categoryId: e.target.value,
                    natureChip: e.target.value === 'nature' ? content.natureChip || 'rain' : content.natureChip,
                  })
                }
              >
                {libraryEditorCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              العنوان
              <input
                type="text"
                value={content.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder={`عنوان في ${category.title}`}
              />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="روابط YouTube" />
            <label className="cms-field">
              videoId
              <input
                type="text"
                value={content.videoId}
                onChange={(e) => patch({ videoId: e.target.value.trim() })}
                placeholder="UHVcRjfufic"
              />
            </label>
            <label className="cms-field">
              playlistId
              <input
                type="text"
                value={content.playlistId}
                onChange={(e) => patch({ playlistId: e.target.value.trim() })}
                placeholder="PLVdBsyVAy4VRfI-rG7LvjNSalxOdcSv-e"
              />
            </label>
            <p className="text-caption">
              أدخل videoId أو playlistId — إذا أدخلت الاثنين معاً تظهر رسالة توضيح.
            </p>
            <button type="button" className="mock-btn mock-btn--outline" onClick={handleCheckLink}>
              <Link2 size={14} /> فحص الرابط (mock)
            </button>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="تفاصيل العرض" />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                duration
                <input
                  type="text"
                  value={content.duration}
                  onChange={(e) => patch({ duration: e.target.value })}
                  placeholder="03:45"
                />
              </label>
              <label className="cms-field">
                moodTag
                <input
                  type="text"
                  value={content.moodTag}
                  onChange={(e) => patch({ moodTag: e.target.value })}
                  placeholder="هادئة جداً"
                />
              </label>
            </div>

            {content.categoryId === 'nature' && (
              <>
                <p className="cms-field" style={{ marginBottom: 8 }}>
                  natureChip
                </p>
                <div className="chip-grid">
                  {natureChipOptions.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={`chip-btn${content.natureChip === chip.id ? ' chip-btn--active' : ''}`}
                      onClick={() => patch({ natureChip: chip.id })}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="cms-field">
              حالة الرابط
              <select value={content.linkStatus} onChange={(e) => patch({ linkStatus: e.target.value })}>
                {libraryLinkStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="استهداف ونشر" />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                العمر المستهدف
                <select value={content.targetAgeId} onChange={(e) => patch({ targetAgeId: e.target.value })}>
                  {libraryTargetAgeOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                الباقة المطلوبة
                <select value={content.requiredPlan} onChange={(e) => patch({ requiredPlan: e.target.value })}>
                  {libraryRequiredPlanOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="cms-field">
              حالة النشر
              <select value={content.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                {libraryPublishStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </AdminCard>

          {validation.length > 0 && (
            <div className="library-content-validation">
              {validation.map((v) => (
                <InfoBanner
                  key={v.id}
                  tone={v.severity === 'error' ? 'warning' : 'info'}
                >
                  {v.message}
                </InfoBanner>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ</MockActionButton>
            <MockActionButton action="publish">نشر في المكتبة</MockActionButton>
          </div>
        </div>

        <AdminCard className="library-content-editor__preview-wrap">
          <SectionHeader title="معاينة المكتبة" />
          <LibraryContentPreview content={content} />
          <SectionHeader title="شاشة التطبيق (mock)" />
          <AppContentPreview preview={fromLibraryContent(content)} compact />
        </AdminCard>
      </div>
    </div>
  );
}
