import { Eye, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { MediaCoverPick } from './MediaCoverPick';
import { MediaVideoSourceFields } from './MediaVideoSourceFields';
import { MockLoading } from './MockLoading';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { parseYoutubeVideoId } from '../data/contentLibraryAdmin';
import { ageBandLabel, libraryAgeBands } from '../data/libraryAgeBands';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';
import { libraryPdfPublishOptions, publishLabel } from '../services/supabase/libraryPdfService';
import {
  deleteVisualVideo,
  emptyVisualVideoDraft,
  listVisualVideos,
  saveVisualVideo,
  translateSectionsError,
} from '../services/supabase/librarySectionsService';

const publishTone = { published: 'success', review: 'warning', draft: 'muted', archived: 'muted' };

function thumbFor(video) {
  if (video.coverUrl) return video.coverUrl;
  return video.youtubeVideoId ? getYoutubeThumbnailUrl(video.youtubeVideoId) : '';
}

export function LibraryVisualVideosManager() {
  const { showError, showSuccess } = useSnackbar();
  const { needsLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listVisualVideos();
    setLoading(false);
    if (error) showError(translateSectionsError(error.message) ?? 'تعذّر تحميل الفيديوهات');
    else setItems(data);
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((v) => v.ageBand === filter)),
    [items, filter],
  );

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const onYoutubeInput = (value) => {
    patch({ youtubeInput: value, youtubeVideoId: parseYoutubeVideoId(value) });
  };

  const onSave = async () => {
    if (!draft.title.trim()) {
      showError('العنوان مطلوب.');
      return;
    }
    const hasSource = draft.sourceType === 'upload' ? Boolean(draft.videoUrl) : Boolean(draft.youtubeVideoId);
    if (draft.sourceType !== 'upload' && draft.youtubeInput.trim() && !draft.youtubeVideoId) {
      showError('رابط YouTube غير صحيح — استخدمي رابط فيديو (مش playlist).');
      return;
    }
    if (draft.publishStatus === 'published' && !hasSource) {
      showError('أضيفي رابط YouTube أو ارفعي فيديو قبل النشر.');
      return;
    }
    if (needsLogin) {
      showError('سجّلي الدخول أولاً.');
      return;
    }
    setSaving(true);
    const { error } = await saveVisualVideo(draft);
    setSaving(false);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر الحفظ');
      return;
    }
    showSuccess(draft.publishStatus === 'published' ? 'تم الحفظ والنشر في التطبيق' : 'تم الحفظ');
    setDraft(null);
    await reload();
  };

  const onDelete = async (video) => {
    if (!window.confirm(`حذف «${video.title}» نهائياً؟`)) return;
    const { error } = await deleteVisualVideo(video.id);
    if (error) {
      showError(translateSectionsError(error.message) ?? 'تعذّر الحذف');
      return;
    }
    showSuccess('تم الحذف');
    if (draft?.id === video.id) setDraft(null);
    await reload();
  };

  return (
    <div className="page-stack">
      <AdminCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SectionHeader title="فيديوهات التحفيز البصري" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="mock-btn mock-btn--outline" onClick={reload}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => setDraft(emptyVisualVideoDraft(items.length))}
            >
              <Plus size={16} /> فيديو جديد
            </button>
          </div>
        </div>
        <div className="filters-row" style={{ marginTop: 12 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">كل الأعمار</option>
            {libraryAgeBands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      {draft && (
        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={draft.id ? 'تعديل فيديو' : 'فيديو تحفيز بصري جديد'} />
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <label className="cms-field">
            العنوان
            <input type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <label className="cms-field">
            وصف قصير (اختياري)
            <input type="text" value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>
          <MediaVideoSourceFields
            draft={draft}
            setDraft={setDraft}
            onYoutubeInput={onYoutubeInput}
            youtubePlaceholder="https://youtu.be/…"
            allowPlaylist={false}
          />
          <MediaCoverPick
            value={draft.coverUrl}
            onChange={(url) => patch({ coverUrl: url })}
            fallbackUrl={draft.sourceType !== 'upload' && draft.youtubeVideoId ? getYoutubeThumbnailUrl(draft.youtubeVideoId) : ''}
          />
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              الفئة العمرية
              <select value={draft.ageBand} onChange={(e) => patch({ ageBand: e.target.value })}>
                {libraryAgeBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              حالة النشر
              <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                {libraryPdfPublishOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="cms-field">
            الترتيب
            <input type="number" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
            <button type="button" className="mock-btn mock-btn--outline" onClick={() => setDraft(null)}>
              <X size={14} /> إلغاء
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <MockLoading label="جاري تحميل الفيديوهات…" />
        ) : visible.length === 0 ? (
          <EmptyState icon={Eye} title="لا توجد فيديوهات" description="اضغطي «فيديو جديد» لإضافة أول فيديو." compact />
        ) : (
          <AdminTableContainer>
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>الغلاف</th>
                  <th>العنوان</th>
                  <th>المصدر</th>
                  <th>العمر</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((video) => (
                  <tr key={video.id} className={draft?.id === video.id ? 'selected' : ''}>
                    <td>
                      {thumbFor(video) ? (
                        <img src={thumbFor(video)} alt="" style={{ width: 64, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 220 }}>{video.title}</td>
                    <td>{video.sourceType === 'upload' ? 'ملف مرفوع' : 'YouTube'}</td>
                    <td>{ageBandLabel(video.ageBand)}</td>
                    <td>
                      <StatusBadge tone={publishTone[video.publishStatus] ?? 'muted'}>
                        {publishLabel(video.publishStatus)}
                      </StatusBadge>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="تعديل"
                        onClick={() => setDraft({ ...video })}
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        type="button"
                        className="mock-btn mock-btn--outline"
                        style={{ padding: '4px 8px' }}
                        aria-label="حذف"
                        onClick={() => onDelete(video)}
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
    </div>
  );
}
