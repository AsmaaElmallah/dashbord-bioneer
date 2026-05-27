import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { EmptyState } from './EmptyState';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
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
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  adminItemToRow,
  ageHubGroupToRow,
  ageHubItemToRow,
  deleteAgeHubItemById,
  deleteLibraryItem,
  loadContentLibraryState,
  translateLibrarySaveError,
  upsertAgeHubGroup,
  upsertAgeHubItem,
  upsertLibraryItem,
} from '../services/supabase/libraryService';
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
  const { showMock, showSuccess, showError } = useSnackbar();
  const { needsLogin } = useAuth();
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
  const [remoteLoading, setRemoteLoading] = useState(isSupabaseEnabled);

  const tabMeta = contentLibraryHubTabs.find((t) => t.id === tab);
  const isAgeHub = isAgeHubTab(tab);
  const isExercises = tab === 'exercises';

  useEffect(() => {
    if (!isSupabaseEnabled) {
      saveAdminState(ADMIN_STORAGE_KEYS.contentLibrary, state);
    }
  }, [state]);

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;

    let cancelled = false;
    (async () => {
      const { state: remote, error } = await loadContentLibraryState();
      if (cancelled) return;
      if (error) {
        showError(translateLibrarySaveError(error.message) ?? 'تعذّر تحميل المكتبة من Supabase');
      } else if (remote) {
        setState(remote);
      }
      setRemoteLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const hubTypeForTab = (tabId) => (tabId === 'exercises' ? 'exercises' : 'activities');

  const persistAgeHubItem = async (item, groupId, tabId) => {
    if (!isSupabaseEnabled) return { ok: true };

    if (needsLogin) {
      showError('سجّلي الدخول أولاً لحفظ الرياضة والأنشطة على السحابة.');
      return { ok: false };
    }

    const groups = getAgeHubGroups(state, tabId);
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      showError('فئة العمر غير موجودة.');
      return { ok: false };
    }

    const sortIndex = group.items.findIndex((i) => i.id === item.id);
    const groupSort = groups.findIndex((g) => g.id === groupId);

    const { error: gErr } = await upsertAgeHubGroup(
      ageHubGroupToRow(group, hubTypeForTab(tabId), groupSort >= 0 ? groupSort : 0),
    );
    if (gErr) {
      showError(translateLibrarySaveError(gErr.message) ?? 'فشل حفظ فئة العمر');
      return { ok: false };
    }

    const sortOrder = sortIndex >= 0 ? sortIndex : group.items.length;
    const { error: iErr } = await upsertAgeHubItem(ageHubItemToRow(item, groupId, sortOrder));
    if (iErr) {
      showError(translateLibrarySaveError(iErr.message) ?? 'فشل الحفظ في Supabase');
      return { ok: false };
    }

    return { ok: true };
  };

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

  const handleAddMedia = async () => {
    const result = createMediaItem(tab, mediaDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }

    if (isSupabaseEnabled) {
      if (needsLogin) {
        showError('سجّلي الدخول أولاً لحفظ المكتبة على السحابة.');
        return;
      }
      const row = adminItemToRow(result.item, tab);
      const { error } = await upsertLibraryItem(row);
      if (error) {
        showError(translateLibrarySaveError(error.message) ?? 'فشل الحفظ في Supabase');
        return;
      }
    }

    setState((prev) => mergeMediaState(prev, tab, result.item));
    setSelectedId(result.item.id);
    setShowAddForm(false);
    setMediaDraft(emptyMediaDraft());
    showSuccess(`تمت الإضافة إلى ${tabMeta?.title}${isSupabaseEnabled ? ' — محفوظ على السحابة' : ''}`);
  };

  const handleDeleteMedia = async (itemId) => {
    if (!window.confirm('حذف هذا العنصر؟')) return;

    if (isSupabaseEnabled) {
      if (needsLogin) {
        showError('سجّلي الدخول أولاً لحذف من السحابة.');
        return;
      }
      const { error } = await deleteLibraryItem(itemId);
      if (error) {
        showError(translateLibrarySaveError(error.message) ?? 'فشل الحذف من Supabase');
        return;
      }
    }

    setState((prev) => removeMediaFromState(prev, tab, itemId));
    if (selectedId === itemId) setSelectedId(null);
    showSuccess('تم الحذف');
  };

  const handleAddAgeHub = async () => {
    const groups = getAgeHubGroups(state, tab);
    const result = isExercises
      ? createExerciseItem(groups, selectedAgeGroupId, ageHubDraft)
      : createActivityItem(groups, selectedAgeGroupId, ageHubDraft);
    if (result.error) {
      showError(result.error);
      return;
    }

    const saved = await persistAgeHubItem(result.item, selectedAgeGroupId, tab);
    if (!saved.ok) return;

    const stateKey = getAgeHubStateKey(tab);
    setState((prev) => ({ ...prev, [stateKey]: result.groups }));
    setSelectedId(result.item.id);
    setShowAddForm(false);
    setAgeHubDraft(emptyAgeHubDraft(isExercises ? 'video' : 'playlist'));
    showSuccess(
      isExercises
        ? 'تمت إضافة التمرين — محفوظ على السحابة'
        : 'تمت إضافة النشاط — محفوظ على السحابة',
    );
  };

  const handleDeleteAgeHub = async (itemId) => {
    if (!window.confirm(isExercises ? 'حذف هذا التمرين؟' : 'حذف هذا النشاط؟')) return;

    if (isSupabaseEnabled) {
      if (needsLogin) {
        showError('سجّلي الدخول أولاً لحذف من السحابة.');
        return;
      }
      const { error } = await deleteAgeHubItemById(itemId);
      if (error) {
        showError(translateLibrarySaveError(error.message) ?? 'فشل الحذف من Supabase');
        return;
      }
    }

    const stateKey = getAgeHubStateKey(tab);
    setState((prev) => ({
      ...prev,
      [stateKey]: deleteAgeHubItem(getAgeHubGroups(prev, tab), selectedAgeGroupId, itemId),
    }));
    if (selectedId === itemId) setSelectedId(null);
    showSuccess('تم الحذف');
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

  const handleSaveEdit = async () => {
    if (!preview || !editDraft) return;
    if (isAgeHub) {
      const result = buildAgeHubItemPatchFromDraft(editDraft, { isExercise: isExercises });
      if (result.error) {
        showMock(result.error);
        return;
      }
      const stateKey = getAgeHubStateKey(tab);
      const nextGroups = updateAgeHubItem(
        getAgeHubGroups(state, tab),
        selectedAgeGroupId,
        preview.id,
        result.patch,
      );
      const updated = nextGroups
        .find((g) => g.id === selectedAgeGroupId)
        ?.items.find((i) => i.id === preview.id);

      if (updated) {
        const saved = await persistAgeHubItem(updated, selectedAgeGroupId, tab);
        if (!saved.ok) return;
      }

      setState((prev) => ({
        ...prev,
        [stateKey]: nextGroups,
      }));
    } else {
      const result = buildMediaItemPatchFromDraft(editDraft, tab);
      if (result.error) {
        showMock(result.error);
        return;
      }
      const nextState = updateMediaItemInState(state, tab, preview.id, result.patch);
      const updated = getMediaItemsForTab(nextState, tab).find((i) => i.id === preview.id);
      if (isSupabaseEnabled && updated) {
        if (needsLogin) {
          showError('سجّلي الدخول أولاً لحفظ التعديل على السحابة.');
          return;
        }
        const { error } = await upsertLibraryItem(adminItemToRow(updated, tab));
        if (error) {
          showError(translateLibrarySaveError(error.message) ?? 'فشل حفظ التعديل في Supabase');
          return;
        }
      }
      setState(nextState);
    }
    setEditing(false);
    setEditDraft(null);
    showSuccess(isSupabaseEnabled ? 'تم حفظ التعديل على السحابة' : 'تم حفظ التعديل');
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
      {isSupabaseEnabled && (
        <p className="text-caption" style={{ marginBottom: 12 }}>
          {remoteLoading
            ? 'جاري تحميل المكتبة من Supabase…'
            : needsLogin
              ? 'متصل بـ Supabase — سجّلي الدخول لحفظ كل التبويبات (وسائط + رياضة + أنشطة)'
              : 'متصل بـ Supabase — كل التبويبات تُحفظ في السحابة (library_items + age_hub)'}
        </p>
      )}
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
