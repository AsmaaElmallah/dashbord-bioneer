import { Cloud, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AudioFilePick } from '../AudioFilePick';
import { AdminCard } from '../AdminCard';
import { AdminTableContainer } from '../AdminTableContainer';
import { SectionHeader } from '../SectionHeader';
import { StatusBadge } from '../StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import {
  buildKhatmahDayNodes,
  buildKhatmahJourneyNodes,
  attachAudioToSession,
  createNewSessionForDay,
  ensureKhatmahPlanSessions,
  filterQuranSessions,
  getSessionsForKhatmahDay,
  QURAN_TARGET_KHATMAH,
  quranDayLabel,
  seedQuranJourneySessions,
} from '../../data/quranJourneyAdmin';
import { getKhatmahPlanSummary } from '../../data/quranSessionEditor';
import { quranOverview } from '../../data/mockData';
import { isSupabaseEnabled } from '../../lib/supabaseClient';
import {
  adminSessionToRow,
  deleteQuranSession,
  fetchAllQuranSessions,
  translateQuranSaveError,
  uploadQuranAudio,
  upsertQuranSession,
} from '../../services/supabase/quranService';
import {
  ADMIN_STORAGE_KEYS,
  loadAdminArrayState,
  saveAdminState,
} from '../../utils/adminLocalStorage';
import { JourneyBreadcrumb } from './JourneyBreadcrumb';
import { JourneyPathView } from './JourneyPathView';

const sessionStatusTone = {
  موجود: 'success',
  ناقص: 'error',
  'يحتاج مراجعة': 'warning',
  مسودة: 'muted',
};

function markSessionAudioReady(session, audioFile, storagePath) {
  const fileName = audioFile?.name ?? session.file;
  return {
    ...session,
    file: fileName,
    storagePath: storagePath ?? session.storagePath ?? null,
    status: 'موجود',
    statusKey: 'ok',
    publishStatus: storagePath ? 'published' : session.publishStatus,
    cloudSaved: Boolean(storagePath),
    audioFile: audioFile
      ? {
          name: audioFile.name,
          sizeMock: audioFile.sizeMock ?? '—',
          notUploaded: !storagePath,
          uploaded: Boolean(storagePath),
        }
      : session.audioFile,
  };
}

export function QuranJourneyExplorer() {
  const { showMock, showSuccess, showError } = useSnackbar();
  const { needsLogin } = useAuth();
  const [sessions, setSessions] = useState(() =>
    loadAdminArrayState(ADMIN_STORAGE_KEYS.quranSessions, seedQuranJourneySessions),
  );

  const [remoteLoading, setRemoteLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      saveAdminState(ADMIN_STORAGE_KEYS.quranSessions, sessions);
    }
  }, [sessions]);

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;

    let cancelled = false;
    (async () => {
      const { data, error } = await fetchAllQuranSessions();
      if (cancelled) return;
      if (error) {
        showMock(error.message ?? 'تعذّر تحميل جلسات القرآن');
      } else if (data?.length) {
        setSessions(data);
      }
      setRemoteLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [showMock]);
  const [view, setView] = useState('journey');
  const [jumpKhatmah, setJumpKhatmah] = useState('1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState({
    audioFile: null,
    title: '',
    surahRange: '',
    durationMinutes: '',
  });
  const [selectedKhatmah, setSelectedKhatmah] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filters, setFilters] = useState({ khatmah: 'all', status: 'all' });
  const [savingNew, setSavingNew] = useState(false);
  const [lastSavedSessionId, setLastSavedSessionId] = useState(null);

  const filteredSessions = useMemo(() => filterQuranSessions(sessions, filters), [sessions, filters]);

  const adminJourneyOptions = useMemo(() => ({ adminMode: true }), []);

  const journeyNodes = useMemo(
    () => buildKhatmahJourneyNodes(null, adminJourneyOptions),
    [adminJourneyOptions],
  );

  const dayNodes = useMemo(() => {
    if (!selectedKhatmah) return [];
    return buildKhatmahDayNodes(selectedKhatmah, null, adminJourneyOptions);
  }, [selectedKhatmah, adminJourneyOptions]);

  const daySessions = useMemo(() => {
    if (!selectedKhatmah || !selectedDay) return [];
    return getSessionsForKhatmahDay(sessions, selectedKhatmah, selectedDay);
  }, [sessions, selectedKhatmah, selectedDay]);

  const khatmahSummary = selectedKhatmah ? getKhatmahPlanSummary(selectedKhatmah) : null;

  const breadcrumbs = useMemo(() => {
    const items = [{ id: 'journey', label: 'رحلة الختمات', view: 'journey' }];
    if (selectedKhatmah) {
      items.push({
        id: `k-${selectedKhatmah}`,
        label: `الختمة ${selectedKhatmah}`,
        view: 'days',
        khatmah: selectedKhatmah,
      });
    }
    if (selectedKhatmah && selectedDay) {
      items.push({
        id: `d-${selectedDay}`,
        label: quranDayLabel(selectedDay),
        view: 'dayDetail',
        khatmah: selectedKhatmah,
        day: selectedDay,
      });
    }
    return items;
  }, [selectedKhatmah, selectedDay]);

  const handleBreadcrumb = (item) => {
    if (item.view === 'journey') {
      setView('journey');
      setSelectedKhatmah(null);
      setSelectedDay(null);
      return;
    }
    if (item.view === 'days') {
      setView('days');
      setSelectedKhatmah(item.khatmah);
      setSelectedDay(null);
      return;
    }
    if (item.view === 'dayDetail') {
      setView('dayDetail');
      setSelectedKhatmah(item.khatmah);
      setSelectedDay(item.day);
    }
  };

  const openKhatmah = (node) => {
    const k = node.payload?.khatmah;
    setSessions((prev) => ensureKhatmahPlanSessions(prev, k));
    setSelectedKhatmah(k);
    setSelectedDay(null);
    setView('days');
    showMock(`تم تحميل خطة الختمة ${k}`);
  };

  const openDay = (node) => {
    const { khatmah, day } = node.payload ?? {};
    setSessions((prev) => ensureKhatmahPlanSessions(prev, khatmah));
    setSelectedKhatmah(khatmah);
    setSelectedDay(day);
    setView('dayDetail');
  };

  const handleJumpToKhatmah = () => {
    const k = Math.min(QURAN_TARGET_KHATMAH, Math.max(1, Number(jumpKhatmah) || 1));
    setJumpKhatmah(String(k));
    openKhatmah({ payload: { khatmah: k } });
  };

  const resetAddDraft = () => {
    setAddDraft({ audioFile: null, title: '', surahRange: '', durationMinutes: '' });
  };

  const mergeSavedSession = (saved) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx === -1) return [...prev, saved];
      return prev.map((s) => (s.id === saved.id ? saved : s));
    });
    setLastSavedSessionId(saved.id);
  };

  const persistSession = async (session, audioFile) => {
    const fileMeta = audioFile ?? session.audioFile;
    let next = attachAudioToSession(session, fileMeta);

    if (isSupabaseEnabled && needsLogin) {
      showError('سجّلي الدخول أولاً من الشريط العلوي لحفظ الجلسة والصوت على السحابة.');
      return null;
    }

    if (isSupabaseEnabled && fileMeta?.rawFile) {
      const upload = await uploadQuranAudio(fileMeta, { sessionNumber: next.session });
      if (upload.error) {
        showError(translateQuranSaveError(upload.error.message) ?? 'فشل رفع الصوت');
        return null;
      }
      if (upload.path) {
        next = markSessionAudioReady(
          {
            ...next,
            audioPath: `assets/audio/quran/ahmed_khader/half_hizb/${next.file}`,
          },
          fileMeta,
          upload.path,
        );
      }
    }

    if (isSupabaseEnabled) {
      const { data, error } = await upsertQuranSession(adminSessionToRow(next));
      if (error) {
        showError(translateQuranSaveError(error.message) ?? 'فشل حفظ الجلسة في Supabase');
        return null;
      }
      if (data) next = data;
      else next = markSessionAudioReady(next, fileMeta, next.storagePath);
    } else {
      next = markSessionAudioReady(next, fileMeta, next.storagePath);
    }

    return next;
  };

  const handleSaveNewSession = async () => {
    const result = createNewSessionForDay(sessions, selectedKhatmah, selectedDay, addDraft);
    if (result.error) {
      showError(result.error);
      return;
    }

    setSavingNew(true);
    try {
      const saved = await persistSession(result.session, addDraft.audioFile);
      if (!saved) return;

      mergeSavedSession(saved);
      setShowAddForm(false);
      resetAddDraft();
      showSuccess(
        isSupabaseEnabled
          ? `تم حفظ الجلسة #${saved.session} والصوت على السحابة`
          : `تم حفظ الجلسة #${saved.session} محلياً`,
      );
    } finally {
      setSavingNew(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('حذف هذه الجلسة؟')) return;

    if (isSupabaseEnabled) {
      const { error } = await deleteQuranSession(id);
      if (error) {
        showMock(error.message ?? 'فشل الحذف من Supabase');
        return;
      }
    }

    setSessions((prev) => prev.filter((s) => s.id !== id));
    showMock('تم حذف الجلسة');
  };

  const khatmahFilterOptions = useMemo(
    () => Array.from({ length: QURAN_TARGET_KHATMAH }, (_, i) => i + 1),
    [],
  );

  return (
    <div className="quran-journey-explorer">
      {isSupabaseEnabled && (
        <p className="text-caption" style={{ marginBottom: 12 }}>
          {remoteLoading
            ? 'جاري تحميل الجلسات من Supabase…'
            : needsLogin
              ? 'متصل بـ Supabase — سجّلي الدخول لحفظ الصوت والجلسات'
              : 'متصل بـ Supabase — الحفظ والرفع في السحابة'}
        </p>
      )}
      <JourneyBreadcrumb items={breadcrumbs} onNavigate={handleBreadcrumb} />

      <div className="filters-row" style={{ marginTop: 12, marginBottom: 12 }}>
        <select
          value={filters.khatmah}
          onChange={(e) => setFilters((f) => ({ ...f, khatmah: e.target.value }))}
        >
          <option value="all">كل الختمات</option>
          {khatmahFilterOptions.map((k) => (
            <option key={k} value={String(k)}>
              الختمة {k}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="all">كل الحالات</option>
          <option value="ok">موجود</option>
          <option value="missing">ناقص</option>
          <option value="review">يحتاج مراجعة</option>
          <option value="draft">مسودة</option>
        </select>
        <span className="text-caption">{filteredSessions.length} جلسة بعد الفلتر</span>
      </div>

      {view === 'journey' && (
        <>
          <AdminCard className="journey-hero-card journey-hero-card--quran">
            <h3 className="journey-hero-card__title">رحلة الختمات — وضع الأدمن</h3>
            <p className="journey-hero-card__subtitle">
              {QURAN_TARGET_KHATMAH} ختمة · كل المسارات مفتوحة للإضافة والتعديل
            </p>
            <div className="journey-jump-row">
              <label className="cms-field" style={{ margin: 0, flex: '1 1 120px' }}>
                انتقل للختمة
                <input
                  type="number"
                  min={1}
                  max={QURAN_TARGET_KHATMAH}
                  value={jumpKhatmah}
                  onChange={(e) => setJumpKhatmah(e.target.value)}
                />
              </label>
              <button type="button" className="mock-btn mock-btn--primary" onClick={handleJumpToKhatmah}>
                فتح الختمة
              </button>
            </div>
          </AdminCard>

          <div className="journey-path-scroll">
            <JourneyPathView nodes={journeyNodes} onNodeClick={openKhatmah} />
          </div>

        </>
      )}

      {view === 'days' && selectedKhatmah && khatmahSummary && (
        <>
          <AdminCard className="journey-hero-card journey-hero-card--quran">
            <h3 className="journey-hero-card__title">الختمة {selectedKhatmah}</h3>
            <p className="journey-hero-card__subtitle">
              {khatmahSummary.dailySessions} جلسات يومياً · ~{khatmahSummary.daysToFinish} يوم —{' '}
              {khatmahSummary.note}
            </p>
          </AdminCard>

          <div className="journey-path-scroll journey-path-scroll--days">
            <JourneyPathView nodes={dayNodes} onNodeClick={openDay} />
          </div>

        </>
      )}

      {view === 'dayDetail' && selectedKhatmah && selectedDay && (
        <div className="quran-day-detail">
          <AdminCard>
            <div className="quran-day-detail__head">
              <SectionHeader
                title={`${quranDayLabel(selectedDay)} — الختمة ${selectedKhatmah}`}
              />
              <button
                type="button"
                className="mock-btn mock-btn--outline"
                onClick={() => {
                  setShowAddForm((v) => !v);
                  if (showAddForm) resetAddDraft();
                }}
              >
                <Plus size={16} />
                {showAddForm ? 'إلغاء' : 'إضافة جلسة + صوت'}
              </button>
            </div>

            {showAddForm && (
              <AdminCard className="quran-session-add-form">
                <SectionHeader title="جلسة جديدة — ارفع الصوت أولاً" />
                <AudioFilePick
                  file={addDraft.audioFile}
                  onPick={(audioFile) => setAddDraft((d) => ({ ...d, audioFile }))}
                />
                <label className="cms-field">
                  عنوان الجلسة (اختياري)
                  <input
                    type="text"
                    value={addDraft.title}
                    onChange={(e) => setAddDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder="نصف حزب 12 (الأول)"
                  />
                </label>
                <label className="cms-field">
                  نطاق السورة / الآيات
                  <input
                    type="text"
                    value={addDraft.surahRange}
                    onChange={(e) => setAddDraft((d) => ({ ...d, surahRange: e.target.value }))}
                    placeholder="2:1 → 2:31"
                  />
                </label>
                <label className="cms-field">
                  المدة (دقيقة)
                  <input
                    type="number"
                    min={1}
                    value={addDraft.durationMinutes}
                    onChange={(e) => setAddDraft((d) => ({ ...d, durationMinutes: e.target.value }))}
                    placeholder="15"
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="mock-btn mock-btn--primary"
                    onClick={handleSaveNewSession}
                    disabled={!addDraft.audioFile || savingNew}
                  >
                    {savingNew ? (
                      <>
                        <Loader2 size={16} className="spin" aria-hidden />
                        جاري الحفظ…
                      </>
                    ) : (
                      'حفظ الجلسة'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddDraft();
                    }}
                  >
                    <X size={14} />
                    إلغاء
                  </button>
                </div>
              </AdminCard>
            )}

            <AdminTableContainer>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>جلسة</th>
                    <th>الحزب</th>
                    <th>النصف</th>
                    <th>السورة</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {daySessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-caption">
                        لا جلسات — أضف جلسة جديدة.
                      </td>
                    </tr>
                  ) : (
                    daySessions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          #{s.session}
                          <span className="text-caption"> ({s.sessionInDay}/{s.dailySessions})</span>
                        </td>
                        <td>{s.hizb}</td>
                        <td>{s.half}</td>
                        <td style={{ fontSize: '0.78rem' }}>{s.surahRange}</td>
                        <td>
                          <StatusBadge tone={sessionStatusTone[s.status] ?? 'muted'}>
                            {s.status}
                          </StatusBadge>
                          {s.storagePath && (
                            <StatusBadge tone="success" style={{ marginRight: 6 }}>
                              <Cloud size={12} style={{ verticalAlign: 'middle' }} /> سحابة
                            </StatusBadge>
                          )}
                          {lastSavedSessionId === s.id && (
                            <StatusBadge tone="info" style={{ marginRight: 6 }}>
                              محفوظ للتو
                            </StatusBadge>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: '4px 8px' }}
                            aria-label="حذف"
                            onClick={() => handleDeleteSession(s.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
