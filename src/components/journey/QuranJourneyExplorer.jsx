import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioFilePick } from '../AudioFilePick';
import { AdminCard } from '../AdminCard';
import { AdminTableContainer } from '../AdminTableContainer';
import { SectionHeader } from '../SectionHeader';
import { StatusBadge } from '../StatusBadge';
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

export function QuranJourneyExplorer() {
  const { showMock } = useSnackbar();
  const [sessions, setSessions] = useState(() =>
    loadAdminArrayState(ADMIN_STORAGE_KEYS.quranSessions, seedQuranJourneySessions),
  );

  useEffect(() => {
    saveAdminState(ADMIN_STORAGE_KEYS.quranSessions, sessions);
  }, [sessions]);
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
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [filters, setFilters] = useState({ khatmah: 'all', status: 'all' });

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

  const selectedSession =
    daySessions.find((s) => s.id === selectedSessionId) ?? daySessions[0] ?? null;

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
      setSelectedSessionId(null);
      return;
    }
    if (item.view === 'days') {
      setView('days');
      setSelectedKhatmah(item.khatmah);
      setSelectedDay(null);
      setSelectedSessionId(null);
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
    setSelectedSessionId(null);
    setView('days');
    showMock(`تم تحميل خطة الختمة ${k}`);
  };

  const openDay = (node) => {
    const { khatmah, day } = node.payload ?? {};
    setSessions((prev) => {
      const next = ensureKhatmahPlanSessions(prev, khatmah);
      const first = getSessionsForKhatmahDay(next, khatmah, day)[0];
      if (first) setSelectedSessionId(first.id);
      else setSelectedSessionId(null);
      return next;
    });
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

  const handleSaveNewSession = () => {
    const result = createNewSessionForDay(sessions, selectedKhatmah, selectedDay, addDraft);
    if (result.error) {
      showMock(result.error);
      return;
    }
    setSessions((prev) => [...prev, result.session]);
    setSelectedSessionId(result.session.id);
    setShowAddForm(false);
    resetAddDraft();
    showMock(`تم ربط ${result.session.file} بالجلسة`);
  };

  const handleAttachAudioToSelected = (audioFile) => {
    if (!selectedSessionId || !audioFile) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId ? attachAudioToSession(s, audioFile) : s,
      ),
    );
    showMock(`تم تحديث الصوت: ${audioFile.name}`);
  };

  const handleDeleteSession = (id) => {
    if (!window.confirm('حذف هذه الجلسة؟')) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSessionId === id) setSelectedSessionId(null);
    showMock('تم حذف الجلسة');
  };

  const khatmahFilterOptions = useMemo(
    () => Array.from({ length: QURAN_TARGET_KHATMAH }, (_, i) => i + 1),
    [],
  );

  return (
    <div className="quran-journey-explorer">
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
        <div className="grid-2 quran-day-detail">
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
                    disabled={!addDraft.audioFile}
                  >
                    حفظ الجلسة
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
                      <tr
                        key={s.id}
                        className={selectedSessionId === s.id ? 'selected' : ''}
                        onClick={() => setSelectedSessionId(s.id)}
                        style={{ cursor: 'pointer' }}
                      >
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
                        </td>
                        <td>
                          <button
                            type="button"
                            className="mock-btn mock-btn--outline"
                            style={{ padding: '4px 8px' }}
                            aria-label="حذف"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(s.id);
                            }}
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

          <AdminCard>
            <SectionHeader title="تفاصيل الجلسة / السورة" />
            {selectedSession ? (
              <>
                <h4 style={{ margin: '0 0 8px', color: 'var(--track-quran)' }}>
                  {selectedSession.title}
                </h4>
                <p>
                  <strong>ختمة {selectedSession.khatmah}</strong> — جلسة {selectedSession.session}
                </p>
                <p>
                  <strong>نطاق الآيات:</strong> {selectedSession.surahRange}
                </p>
                <SectionHeader title="ملف الصوت" />
                <AudioFilePick
                  label="رفع / استبدال mp3"
                  file={selectedSession.audioFile}
                  onPick={(audioFile) => {
                    if (audioFile) handleAttachAudioToSelected(audioFile);
                    else {
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === selectedSessionId
                            ? { ...s, audioFile: null, status: 'ناقص', statusKey: 'missing' }
                            : s,
                        ),
                      );
                    }
                  }}
                />
                <p>
                  <strong>مسار الملف:</strong>
                  <br />
                  <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                    {selectedSession.audioPath}
                  </code>
                </p>
                <p>
                  <strong>المدة:</strong> ~{selectedSession.durationMinutes} دقيقة
                </p>
                <StatusBadge tone={sessionStatusTone[selectedSession.status]}>
                  {selectedSession.status}
                </StatusBadge>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  <Link
                    to="/content-studio/quran-session"
                    className="mock-btn mock-btn--primary"
                    style={{ textDecoration: 'none' }}
                  >
                    فتح محرر الجلسة
                  </Link>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => showMock('تشغيل الصوت')}
                  >
                    معاينة تشغيل
                  </button>
                </div>
              </>
            ) : (
              <p className="text-caption">اختر جلسة من الجدول أو أضف جلسة جديدة.</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
