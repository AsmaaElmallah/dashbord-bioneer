import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  buildAgeHubItemPatchFromDraft,
  buildInitialContentLibraryState,
  buildMediaItemPatchFromDraft,
  contentLibraryHubTabs,
  createActivityItem,
  createExerciseItem,
  createMediaItem,
  deleteAgeHubItem,
  getAgeHubGroups,
  getAgeHubStateKey,
  getMediaItemsForTab,
  isAgeHubTab,
  mergeMediaState,
  natureChipOptions,
  parseYoutubeInput,
  removeMediaFromState,
  updateAgeHubItem,
  updateMediaItemInState,
} from '../data/contentLibraryAdmin';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';
import {
  ADMIN_STORAGE_KEYS,
  clearAdminState,
  loadAdminState,
  saveAdminState,
} from '../utils/adminLocalStorage';

const linkTone = {
  سليم: 'success',
  'يحتاج مراجعة': 'warning',
  معطّل: 'error',
};

const emptyMediaDraft = () => ({
  title: '',
  youtubeInput: '',
  contentType: 'video',
  duration: '',
  moodTag: '',
  natureChip: 'rain',
});

const emptyAgeHubDraft = (contentType = 'video') => ({
  title: '',
  youtubeInput: '',
  contentType,
  moodTag: '',
});

function firstAgeGroupId(state, tabId) {
  return getAgeHubGroups(state, tabId)[0]?.id ?? 'age_0_3';
}

export function ContentLibraryManager() {
  const { showMock } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTab = contentLibraryHubTabs.some((t) => t.id === tabFromUrl);
  const [tab, setTab] = useState(validTab ? tabFromUrl : 'exercises');
  const [state, setState] = useState(() =>
    loadAdminState(ADMIN_STORAGE_KEYS.contentLibrary, buildInitialContentLibraryState),
  );
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mediaDraft, setMediaDraft] = useState(emptyMediaDraft);
  const [ageHubDraft, setAgeHubDraft] = useState(emptyAgeHubDraft('video'));
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState('age_0_3');

  const tabMeta = contentLibraryHubTabs.find((t) => t.id === tab);
  const isAgeHub = isAgeHubTab(tab);
  const isExercises = tab === 'exercises';

  useEffect(() => {
    saveAdminState(ADMIN_STORAGE_KEYS.contentLibrary, state);
  }, [state]);

  const switchTab = (id) => {
    setTab(id);
    setSelectedId(null);
    setShowAddForm(false);
    setEditing(false);
    setEditDraft(null);
    if (isAgeHubTab(id)) {
      const groups = getAgeHubGroups(state, id);
      setSelectedAgeGroupId((prev) =>
        groups.some((g) => g.id === prev) ? prev : groups[0]?.id ?? 'age_0_3',
      );
      setAgeHubDraft(emptyAgeHubDraft(id === 'exercises' ? 'video' : 'playlist'));
    }
    setSearchParams({ tab: id }, { replace: true });
  };

  const mediaItems = useMemo(() => {
    if (isAgeHub) return [];
    return getMediaItemsForTab(state, tab);
  }, [state, tab, isAgeHub]);

  const ageHubGroups = getAgeHubGroups(state, tab);
  const selectedAgeGroup = ageHubGroups.find((g) => g.id === selectedAgeGroupId);
  const ageHubItems = selectedAgeGroup?.items ?? [];

  const previewList = isAgeHub ? ageHubItems : mediaItems;
  const preview = previewList.find((i) => i.id === selectedId) ?? previewList[0] ?? null;

  const handleAddMedia = () => {
    const result = createMediaItem(tab, mediaDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }
    setState((prev) => mergeMediaState(prev, tab, result.item));
    setSelectedId(result.item.id);
    setShowAddForm(false);
    setMediaDraft(emptyMediaDraft());
    showMock(`تمت الإضافة إلى ${tabMeta?.title}`);
  };

  const handleDeleteMedia = (itemId) => {
    if (!window.confirm('حذف هذا العنصر؟')) return;
    setState((prev) => removeMediaFromState(prev, tab, itemId));
    if (selectedId === itemId) setSelectedId(null);
    showMock('تم الحذف');
  };

  const handleAddAgeHub = () => {
    const groups = getAgeHubGroups(state, tab);
    const result = isExercises
      ? createExerciseItem(groups, selectedAgeGroupId, ageHubDraft)
      : createActivityItem(groups, selectedAgeGroupId, ageHubDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }
    const stateKey = getAgeHubStateKey(tab);
    setState((prev) => ({ ...prev, [stateKey]: result.groups }));
    setSelectedId(result.item.id);
    setShowAddForm(false);
    setAgeHubDraft(emptyAgeHubDraft(isExercises ? 'video' : 'playlist'));
    showMock(isExercises ? 'تمت إضافة التمرين' : 'تمت إضافة النشاط');
  };

  const handleDeleteAgeHub = (itemId) => {
    if (!window.confirm(isExercises ? 'حذف هذا التمرين؟' : 'حذف هذا النشاط؟')) return;
    const stateKey = getAgeHubStateKey(tab);
    setState((prev) => ({
      ...prev,
      [stateKey]: deleteAgeHubItem(getAgeHubGroups(prev, tab), selectedAgeGroupId, itemId),
    }));
    if (selectedId === itemId) setSelectedId(null);
    showMock('تم الحذف');
  };

  const applyYoutubePaste = (value, setDraft) => {
    const parsed = parseYoutubeInput(value);
    if (!parsed.error && (parsed.videoId || parsed.playlistId)) {
      setDraft((d) => ({
        ...d,
        youtubeInput: value,
        contentType: parsed.playlistId && !parsed.videoId ? 'playlist' : 'video',
      }));
    } else {
      setDraft((d) => ({ ...d, youtubeInput: value }));
    }
  };

  const canSaveMedia =
    mediaDraft.title.trim() &&
    (mediaDraft.contentType === 'playlist'
      ? parseYoutubeInput(mediaDraft.youtubeInput).playlistId
      : parseYoutubeInput(mediaDraft.youtubeInput).videoId);

  const canSaveAgeHub =
    ageHubDraft.title.trim() &&
    (ageHubDraft.contentType === 'playlist'
      ? parseYoutubeInput(ageHubDraft.youtubeInput).playlistId
      : parseYoutubeInput(ageHubDraft.youtubeInput).videoId);

  const itemToEditDraft = (item, isExerciseTab) => {
    const youtubeInput = item.playlistId
      ? `https://www.youtube.com/playlist?list=${item.playlistId}`
      : item.videoId || '';
    return {
      title: item.title ?? '',
      youtubeInput,
      contentType: item.playlistId && !item.videoId ? 'playlist' : 'video',
      duration: item.duration ?? '',
      moodTag: item.moodTag ?? '',
      natureChip: item.natureChip ?? 'rain',
      isAgeHub: isAgeHubTab(tab),
      isExercise: isExerciseTab,
    };
  };

  const startEdit = () => {
    if (!preview) return;
    setEditDraft(itemToEditDraft(preview, isExercises));
    setEditing(true);
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    if (!preview || !editDraft) return;
    if (isAgeHub) {
      const result = buildAgeHubItemPatchFromDraft(editDraft, { isExercise: isExercises });
      if (result.error) {
        showMock(result.error);
        return;
      }
      const stateKey = getAgeHubStateKey(tab);
      setState((prev) => ({
        ...prev,
        [stateKey]: updateAgeHubItem(
          getAgeHubGroups(prev, tab),
          selectedAgeGroupId,
          preview.id,
          result.patch,
        ),
      }));
    } else {
      const result = buildMediaItemPatchFromDraft(editDraft, tab);
      if (result.error) {
        showMock(result.error);
        return;
      }
      setState((prev) => updateMediaItemInState(prev, tab, preview.id, result.patch));
    }
    setEditing(false);
    setEditDraft(null);
    showMock('تم حفظ التعديل');
  };

  const handleResetStorage = () => {
    if (!window.confirm('استرجاع البيانات الأصلية؟ سيتم فقدان التعديلات الحالية.')) return;
    clearAdminState(ADMIN_STORAGE_KEYS.contentLibrary);
    setState(buildInitialContentLibraryState());
    setSelectedId(null);
    setEditing(false);
    showMock('تمت إعادة البيانات الافتراضية');
  };

  const canSaveEdit =
    editDraft?.title?.trim() &&
    (editDraft.contentType === 'playlist'
      ? parseYoutubeInput(editDraft.youtubeInput).playlistId
      : parseYoutubeInput(editDraft.youtubeInput).videoId);

  const ageHubSectionTitle = isExercises
    ? `تمارين — ${selectedAgeGroup?.title}`
    : `أنشطة — ${selectedAgeGroup?.title}`;

  return (
    <div className="content-library-manager">
      <div className="tabs">
        {contentLibraryHubTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>

      {isAgeHub ? (
        <>
          <div className="filters-row">
            <label className="cms-field" style={{ margin: 0, flex: '1 1 200px' }}>
              الفئة العمرية
              <select
                value={selectedAgeGroupId}
                onChange={(e) => {
                  setSelectedAgeGroupId(e.target.value);
                  setSelectedId(null);
                }}
              >
                {ageHubGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.items.length}) — {g.subtitle}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              onClick={() => setShowAddForm((v) => !v)}
            >
              <Plus size={16} />
              {showAddForm
                ? 'إلغاء'
                : isExercises
                  ? 'إضافة تمرين + YouTube'
                  : 'إضافة نشاط + YouTube'}
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={handleResetStorage}
            >
              استرجاع البيانات الأصلية
            </button>
          </div>

          {selectedAgeGroup?.subtitle && (
            <p className="text-caption">
              <strong>{selectedAgeGroup.subtitle}</strong>
              {selectedAgeGroup.parentNote ? ` · ${selectedAgeGroup.parentNote}` : ''}
            </p>
          )}

          {showAddForm && (
            <AdminCard className="quran-session-add-form">
              <SectionHeader
                title={
                  isExercises
                    ? `تمرين جديد — ${selectedAgeGroup?.title}`
                    : `نشاط جديد — ${selectedAgeGroup?.title}`
                }
              />
              <label className="cms-field">
                العنوان
                <input
                  type="text"
                  value={ageHubDraft.title}
                  onChange={(e) => setAgeHubDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                نوع YouTube
                <select
                  value={ageHubDraft.contentType}
                  onChange={(e) =>
                    setAgeHubDraft((d) => ({ ...d, contentType: e.target.value }))
                  }
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
                  placeholder={
                    isExercises
                      ? 'https://youtube.com/shorts/… أو youtu.be/…'
                      : 'https://youtube.com/playlist?list=PL…'
                  }
                  value={ageHubDraft.youtubeInput}
                  onChange={(e) => applyYoutubePaste(e.target.value, setAgeHubDraft)}
                />
              </label>
              <label className="cms-field">
                mood (اختياري)
                <input
                  type="text"
                  value={ageHubDraft.moodTag}
                  onChange={(e) => setAgeHubDraft((d) => ({ ...d, moodTag: e.target.value }))}
                />
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="mock-btn mock-btn--primary"
                  disabled={!canSaveAgeHub}
                  onClick={handleAddAgeHub}
                >
                  {isExercises ? 'حفظ التمرين' : 'حفظ النشاط'}
                </button>
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setAgeHubDraft(emptyAgeHubDraft(isExercises ? 'video' : 'playlist'));
                  }}
                >
                  <X size={14} /> إلغاء
                </button>
              </div>
            </AdminCard>
          )}
        </>
      ) : (
        <div className="filters-row" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="mock-btn mock-btn--primary"
            onClick={() => {
              setShowAddForm((v) => !v);
              if (!showAddForm) setMediaDraft(emptyMediaDraft());
            }}
          >
            <Plus size={16} />
            {showAddForm ? 'إلغاء' : `إضافة إلى ${tabMeta?.title}`}
          </button>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={handleResetStorage}
          >
            استرجاع البيانات الأصلية
          </button>
        </div>
      )}

      {!isAgeHub && showAddForm && (
        <AdminCard className="quran-session-add-form" style={{ marginBottom: 12 }}>
          <SectionHeader title={`عنصر جديد — ${tabMeta?.title}`} />
          <label className="cms-field">
            العنوان
            <input
              type="text"
              value={mediaDraft.title}
              onChange={(e) => setMediaDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </label>
          <label className="cms-field">
            نوع YouTube
            <select
              value={mediaDraft.contentType}
              onChange={(e) => setMediaDraft((d) => ({ ...d, contentType: e.target.value }))}
            >
              <option value="video">فيديو</option>
              <option value="playlist">Playlist</option>
            </select>
          </label>
          <label className="cms-field">
            رابط YouTube أو videoId / playlistId
            <input
              type="text"
              dir="ltr"
              placeholder="https://www.youtube.com/watch?v=… أو shorts/…"
              value={mediaDraft.youtubeInput}
              onChange={(e) => applyYoutubePaste(e.target.value, setMediaDraft)}
            />
          </label>
          {tab === 'nature' && (
            <label className="cms-field">
              شريحة الطبيعة
              <select
                value={mediaDraft.natureChip}
                onChange={(e) => setMediaDraft((d) => ({ ...d, natureChip: e.target.value }))}
              >
                {natureChipOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="cms-field">
              المدة (اختياري)
              <input
                type="text"
                placeholder="10:00"
                value={mediaDraft.duration}
                onChange={(e) => setMediaDraft((d) => ({ ...d, duration: e.target.value }))}
              />
            </label>
            <label className="cms-field">
              mood
              <input
                type="text"
                value={mediaDraft.moodTag}
                onChange={(e) => setMediaDraft((d) => ({ ...d, moodTag: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              disabled={!canSaveMedia}
              onClick={handleAddMedia}
            >
              حفظ
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={() => {
                setShowAddForm(false);
                setMediaDraft(emptyMediaDraft());
              }}
            >
              <X size={14} /> إلغاء
            </button>
          </div>
        </AdminCard>
      )}

      <div className="grid-2">
        <AdminCard>
          <SectionHeader title={isAgeHub ? ageHubSectionTitle : `عناصر — ${tabMeta?.title}`} />
          {previewList.length === 0 ? (
            <EmptyState title="لا عناصر" description="أضف عنصراً بزر الإضافة أعلاه." compact />
          ) : (
            <AdminTableContainer style={{ maxHeight: 420 }}>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>videoId</th>
                    <th>playlist</th>
                    {tab === 'nature' && <th>شريحة</th>}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {previewList.map((item) => (
                    <tr
                      key={item.id}
                      className={preview?.id === item.id ? 'selected' : ''}
                      onClick={() => setSelectedId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-truncate" style={{ maxWidth: 140 }}>
                        {item.title}
                      </td>
                      <td>
                        <code style={{ fontSize: '0.68rem' }}>{item.videoId ?? '—'}</code>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.62rem' }}>
                          {item.playlistId ? `${item.playlistId.slice(0, 10)}…` : '—'}
                        </code>
                      </td>
                      {tab === 'nature' && <td>{item.natureChip ?? '—'}</td>}
                      <td>
                        <button
                          type="button"
                          className="mock-btn mock-btn--outline"
                          style={{ padding: '4px 8px' }}
                          aria-label="حذف"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAgeHub) handleDeleteAgeHub(item.id);
                            else handleDeleteMedia(item.id);
                          }}
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

        <AdminCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title={editing ? 'تعديل العنصر' : 'معاينة'} />
            {preview && !editing && (
              <button type="button" className="mock-btn mock-btn--outline" onClick={startEdit}>
                <Pencil size={14} /> تعديل
              </button>
            )}
          </div>
          {editing && editDraft ? (
            <>
              <label className="cms-field">
                العنوان
                <input
                  value={editDraft.title}
                  onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </label>
              <label className="cms-field">
                نوع YouTube
                <select
                  value={editDraft.contentType}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, contentType: e.target.value }))
                  }
                >
                  <option value="video">فيديو / Short</option>
                  <option value="playlist">Playlist</option>
                </select>
              </label>
              <label className="cms-field">
                رابط YouTube
                <input
                  dir="ltr"
                  value={editDraft.youtubeInput}
                  onChange={(e) => applyYoutubePaste(e.target.value, setEditDraft)}
                />
              </label>
              {!editDraft.isAgeHub && tab === 'nature' && (
                <label className="cms-field">
                  شريحة الطبيعة
                  <select
                    value={editDraft.natureChip}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, natureChip: e.target.value }))
                    }
                  >
                    {natureChipOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {!editDraft.isAgeHub && (
                <div className="grid-2" style={{ gap: 8 }}>
                  <label className="cms-field">
                    المدة
                    <input
                      value={editDraft.duration}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, duration: e.target.value }))
                      }
                    />
                  </label>
                  <label className="cms-field">
                    mood
                    <input
                      value={editDraft.moodTag}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, moodTag: e.target.value }))
                      }
                    />
                  </label>
                </div>
              )}
              {editDraft.isAgeHub && (
                <label className="cms-field">
                  mood
                  <input
                    value={editDraft.moodTag}
                    onChange={(e) => setEditDraft((d) => ({ ...d, moodTag: e.target.value }))}
                  />
                </label>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="mock-btn mock-btn--primary"
                  disabled={!canSaveEdit}
                  onClick={handleSaveEdit}
                >
                  حفظ التعديل
                </button>
                <button
                  type="button"
                  className="mock-btn mock-btn--outline"
                  onClick={() => {
                    setEditing(false);
                    setEditDraft(null);
                  }}
                >
                  <X size={14} /> إلغاء
                </button>
              </div>
            </>
          ) : preview ? (
            <>
              {preview.videoId && (
                <img
                  className="library-preview-thumb"
                  src={getYoutubeThumbnailUrl(preview.videoId)}
                  alt=""
                />
              )}
              <h4 style={{ margin: '0 0 8px' }}>{preview.title}</h4>
              {isAgeHub && (
                <p className="text-caption">
                  {selectedAgeGroup?.title} · التطبيق:{' '}
                  {isExercises ? 'الرياضة' : 'الأنشطة'} &gt; MediaAgeHub (
                  <code>{tabMeta?.appMenuId}</code>)
                </p>
              )}
              {!isAgeHub && (
                <p className="text-caption">
                  التطبيق: <code>{tabMeta?.appMenuId}</code>
                </p>
              )}
              {preview.videoId && (
                <p>
                  <strong>videoId:</strong> <code>{preview.videoId}</code>
                </p>
              )}
              {preview.playlistId && (
                <p>
                  <strong>playlistId:</strong>
                  <br />
                  <code style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
                    {preview.playlistId}
                  </code>
                </p>
              )}
              {preview.duration && (
                <p>
                  <strong>المدة:</strong> {preview.duration}
                </p>
              )}
              {preview.moodTag && (
                <p>
                  <strong>mood:</strong> {preview.moodTag}
                </p>
              )}
              {preview.natureChip && (
                <p>
                  <strong>شريحة:</strong> {preview.natureChip}
                </p>
              )}
              {preview.linkStatus && (
                <StatusBadge tone={linkTone[preview.linkStatus] ?? 'muted'}>
                  {preview.linkStatus}
                </StatusBadge>
              )}
            </>
          ) : (
            <EmptyState title="لا معاينة" description="اختر عنصراً من الجدول." compact />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
