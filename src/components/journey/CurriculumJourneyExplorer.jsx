import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlideMediaSourcePick } from '../SlideMediaSourcePick';
import { slideMediaReady } from '../../utils/mediaUpload';
import { AdminCard } from '../AdminCard';
import { AdminTableContainer } from '../AdminTableContainer';
import { InfoBanner } from '../InfoBanner';
import { SectionHeader } from '../SectionHeader';
import { StatusBadge } from '../StatusBadge';
import { useSnackbar } from '../../context/SnackbarContext';
import {
  attachSlideMedia,
  buildLessonDayNodes,
  buildLessonJourneyNodes,
  createNewSlideForDay,
  curriculumLessonDayLabel,
  curriculumLessonDaySpan,
  ensureAllTrackSlides,
  ensureLessonSlides,
  filterCurriculumSlides,
  getSlidesForLessonDay,
} from '../../data/curriculumJourneyAdmin';
import {
  LESSON_AGE_PHASES,
  filterLessonsByAgeGroup,
  filterLessonsByProgramPhase,
  getProgramPhaseLabel,
  getCurriculumGlobalDayForLessonDay,
  getDailyRepeatsForCurriculumDay,
} from '../../data/curriculumProgramAdmin';
import {
  ADMIN_STORAGE_KEYS,
  loadAdminArrayState,
  saveAdminState,
} from '../../utils/adminLocalStorage';
import { JourneyBreadcrumb } from './JourneyBreadcrumb';
import { JourneyPathView } from './JourneyPathView';

const assetTone = { موجود: 'success', ناقص: 'error', 'يحتاج مراجعة': 'warning' };

export function CurriculumJourneyExplorer({ trackConfig }) {
  const { showMock } = useSnackbar();
  const slidesStorageKey = ADMIN_STORAGE_KEYS.curriculumSlides(trackConfig.trackId);
  const [slides, setSlides] = useState(() =>
    loadAdminArrayState(slidesStorageKey, trackConfig.seedSlides),
  );

  useEffect(() => {
    saveAdminState(slidesStorageKey, slides);
  }, [slides, slidesStorageKey]);
  const [view, setView] = useState('journey');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [jumpLesson, setJumpLesson] = useState('1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState({
    uploadMode: 'pptx',
    pptxFile: null,
    imageFile: null,
    audioFile: null,
    title: '',
    durationSec: '',
    packageId: '',
  });
  const [filters, setFilters] = useState({
    lesson: 'all',
    packageId: 'all',
    imageStatus: 'all',
    audioStatus: 'all',
    missingOnly: false,
  });
  const [programPhase, setProgramPhase] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');

  const lessonMeta = trackConfig.lessons.find((l) => l.lesson === selectedLesson);

  const filteredSlides = useMemo(
    () => filterCurriculumSlides(slides, filters, trackConfig),
    [slides, filters, trackConfig],
  );

  const visibleLessons = useMemo(() => {
    let list = trackConfig.lessons;
    if (trackConfig.program) {
      list = filterLessonsByProgramPhase(list, programPhase, trackConfig);
      list = filterLessonsByAgeGroup(list, ageGroup, trackConfig);
    }
    return list;
  }, [trackConfig, programPhase, ageGroup]);

  const journeyNodes = useMemo(
    () => buildLessonJourneyNodes(trackConfig, visibleLessons),
    [trackConfig, visibleLessons],
  );

  const program = trackConfig.program;

  const dayNodes = useMemo(() => {
    if (!selectedLesson) return [];
    return buildLessonDayNodes(trackConfig, selectedLesson);
  }, [trackConfig, selectedLesson]);

  const daySlides = useMemo(() => {
    if (!selectedLesson || !selectedDay) return [];
    return getSlidesForLessonDay(slides, selectedLesson, selectedDay);
  }, [slides, selectedLesson, selectedDay]);

  const selectedSlide =
    daySlides.find((s) => s.id === selectedSlideId) ?? daySlides[0] ?? null;

  const breadcrumbs = useMemo(() => {
    const items = [{ id: 'journey', label: trackConfig.breadcrumbJourney, view: 'journey' }];
    if (selectedLesson) {
      items.push({
        id: `l-${selectedLesson}`,
        label: trackConfig.lessonLabel(selectedLesson),
        view: 'days',
        lesson: selectedLesson,
      });
    }
    if (selectedLesson && selectedDay) {
      items.push({
        id: `d-${selectedDay}`,
        label: curriculumLessonDayLabel(selectedDay),
        view: 'dayDetail',
        lesson: selectedLesson,
        day: selectedDay,
      });
    }
    return items;
  }, [trackConfig, selectedLesson, selectedDay]);

  const handleBreadcrumb = (item) => {
    if (item.view === 'journey') {
      setView('journey');
      setSelectedLesson(null);
      setSelectedDay(null);
      setSelectedSlideId(null);
      setShowAddForm(false);
      return;
    }
    if (item.view === 'days') {
      setView('days');
      setSelectedLesson(item.lesson);
      setSelectedDay(null);
      setSelectedSlideId(null);
      setShowAddForm(false);
      return;
    }
    if (item.view === 'dayDetail') {
      setView('dayDetail');
      setSelectedLesson(item.lesson);
      setSelectedDay(item.day);
    }
  };

  const openLesson = (node) => {
    const lesson = node.payload?.lesson;
    setSlides((prev) => ensureLessonSlides(prev, trackConfig, lesson));
    setSelectedLesson(lesson);
    setSelectedDay(null);
    setSelectedSlideId(null);
    setView('days');
    showMock(`تم تحميل شرائح الدرس ${lesson}`);
  };

  const openDay = (node) => {
    const { lesson, dayIndexInLesson } = node.payload ?? {};
    setSlides((prev) => {
      const next = ensureLessonSlides(prev, trackConfig, lesson);
      const first = getSlidesForLessonDay(next, lesson, dayIndexInLesson)[0];
      setSelectedSlideId(first?.id ?? null);
      return next;
    });
    setSelectedLesson(lesson);
    setSelectedDay(dayIndexInLesson);
    setView('dayDetail');
  };

  const handleJumpLesson = () => {
    const n = Math.min(trackConfig.lessonCount, Math.max(1, Number(jumpLesson) || 1));
    setJumpLesson(String(n));
    openLesson({ payload: { lesson: n } });
  };

  const handleLoadAllSlides = () => {
    setSlides((prev) => ensureAllTrackSlides(prev, trackConfig));
    showMock('تم تحميل شرائح كل الدروس');
  };

  const selectedGlobalDay =
    selectedLesson && selectedDay
      ? getCurriculumGlobalDayForLessonDay(selectedLesson, selectedDay, trackConfig)
      : null;

  const resetAddDraft = () => {
    setAddDraft({
      uploadMode: 'pptx',
      pptxFile: null,
      imageFile: null,
      audioFile: null,
      title: '',
      durationSec: '',
      packageId: trackConfig.defaultPackageId(selectedLesson ?? 1),
    });
  };

  const handleSaveNewSlide = () => {
    const result = createNewSlideForDay(slides, trackConfig, selectedLesson, selectedDay, {
      ...addDraft,
      packageId: addDraft.packageId || trackConfig.defaultPackageId(selectedLesson),
    });
    if (result.error) {
      showMock(result.error);
      return;
    }
    setSlides((prev) => [...prev, result.slide]);
    setSelectedSlideId(result.slide.id);
    setShowAddForm(false);
    resetAddDraft();
    showMock(addDraft.pptxFile ? 'تمت إضافة الشريحة من PowerPoint' : 'تمت إضافة الشريحة');
  };

  const handleDeleteSlide = (id) => {
    if (!window.confirm('حذف هذه الشريحة؟')) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (selectedSlideId === id) setSelectedSlideId(null);
    showMock('تم حذف الشريحة');
  };

  const patchSelectedSlide = (partial) => {
    if (!selectedSlideId) return;
    setSlides((prev) =>
      prev.map((s) => (s.id === selectedSlideId ? attachSlideMedia(s, partial) : s)),
    );
  };

  return (
    <div className="curriculum-journey-explorer">
      <JourneyBreadcrumb items={breadcrumbs} onNavigate={handleBreadcrumb} />

      <div className="filters-row" style={{ marginTop: 12, marginBottom: 12 }}>
        <select
          value={filters.lesson}
          onChange={(e) => setFilters((f) => ({ ...f, lesson: e.target.value }))}
        >
          <option value="all">كل الدروس</option>
          {trackConfig.lessons.map((l) => (
            <option key={l.id} value={String(l.lesson)}>
              {trackConfig.lessonLabel(l.lesson)}
            </option>
          ))}
        </select>
        {trackConfig.packageFilterOptions?.length > 0 && (
          <select
            value={filters.packageId}
            onChange={(e) => setFilters((f) => ({ ...f, packageId: e.target.value }))}
          >
            <option value="all">كل الحزم</option>
            {trackConfig.packageFilterOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
        )}
        <select
          value={filters.imageStatus}
          onChange={(e) => setFilters((f) => ({ ...f, imageStatus: e.target.value }))}
        >
          <option value="all">صورة: الكل</option>
          <option value="موجود">موجود</option>
          <option value="ناقص">ناقص</option>
        </select>
        <select
          value={filters.audioStatus}
          onChange={(e) => setFilters((f) => ({ ...f, audioStatus: e.target.value }))}
        >
          <option value="all">صوت: الكل</option>
          <option value="موجود">موجود</option>
          <option value="ناقص">ناقص</option>
        </select>
        <label className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={filters.missingOnly}
            onChange={(e) => setFilters((f) => ({ ...f, missingOnly: e.target.checked }))}
          />
          ناقص ملفات فقط
        </label>
        <span className="text-caption">{filteredSlides.length} شريحة بعد الفلتر</span>
        {program && view === 'journey' && (
          <>
            <select
              value={programPhase}
              onChange={(e) => setProgramPhase(e.target.value)}
              aria-label="مرحلة البرنامج"
            >
              <option value="all">البرنامج: الكل</option>
              <option value="new">محتوى جديد فقط</option>
              <option value="review">دورة المراجعة</option>
            </select>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              aria-label="فئة العمر"
            >
              <option value="all">كل الأعمار</option>
              {LESSON_AGE_PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.dailyRepeats}×/يوم)
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {view === 'journey' && (
        <>
          <AdminCard className="journey-hero-card" style={{ borderColor: `color-mix(in srgb, ${trackConfig.accentVar} 35%, transparent)` }}>
            <h3 className="journey-hero-card__title">{trackConfig.heroTitle} — برنامج 0–2 سنة</h3>
            <p className="journey-hero-card__subtitle">{trackConfig.heroSubtitle}</p>
            {program && (
              <div className="program-summary-grid">
                <div className="program-summary-grid__item">
                  <span className="program-summary-grid__label">المدة</span>
                  <strong>{program.totalDays} يوم</strong>
                </div>
                <div className="program-summary-grid__item">
                  <span className="program-summary-grid__label">محتوى جديد</span>
                  <strong>1 – {program.lastNewContentDay}</strong>
                </div>
                <div className="program-summary-grid__item">
                  <span className="program-summary-grid__label">مراجعة</span>
                  <strong>{program.reviewCycleStartDay} – {program.totalDays}</strong>
                </div>
                <div className="program-summary-grid__item">
                  <span className="program-summary-grid__label">التكرار اليومي</span>
                  <strong>2× → 5×/يوم</strong>
                </div>
              </div>
            )}
            {program && (
              <p className="text-caption" style={{ marginTop: 8 }}>
                {getProgramPhaseLabel(programPhase, trackConfig)} · {visibleLessons.length} درس على المسار
              </p>
            )}
            <div className="journey-jump-row">
              <label className="cms-field" style={{ margin: 0, flex: '1 1 120px' }}>
                انتقل للدرس
                <input
                  type="number"
                  min={1}
                  max={trackConfig.lessonCount}
                  value={jumpLesson}
                  onChange={(e) => setJumpLesson(e.target.value)}
                />
              </label>
              <button type="button" className="mock-btn mock-btn--primary" onClick={handleJumpLesson}>
                فتح الدرس
              </button>
              <button type="button" className="mock-btn mock-btn--outline" onClick={handleLoadAllSlides}>
                تحميل كل شرائح المنهج
              </button>
            </div>
          </AdminCard>

          <div className="journey-path-scroll">
            <JourneyPathView nodes={journeyNodes} onNodeClick={openLesson} />
          </div>

        </>
      )}

      {view === 'days' && selectedLesson && (
        <>
          <AdminCard className="journey-hero-card">
            <h3 className="journey-hero-card__title">{trackConfig.lessonLabel(selectedLesson)}</h3>
            <p className="journey-hero-card__subtitle">
              {lessonMeta?.slideCount ?? '—'} شريحة · أيام {lessonMeta?.days ?? '—'}
              {lessonMeta?.goal && <> · {lessonMeta.goal}</>}
              {lessonMeta?.dailyRepeat && <> · {lessonMeta.dailyRepeat}</>}
              {program && selectedLesson && (() => {
                const span = curriculumLessonDaySpan(selectedLesson, trackConfig.maxLessonNumber);
                return <> · منهج أيام {span.startDay}–{span.endDay}</>;
              })()}
            </p>
          </AdminCard>

          <div className="journey-path-scroll journey-path-scroll--days">
            <JourneyPathView nodes={dayNodes} onNodeClick={openDay} />
          </div>
        </>
      )}

      {view === 'dayDetail' && selectedLesson && selectedDay && (
        <div className="grid-2 quran-day-detail">
          <AdminCard>
            <div className="quran-day-detail__head">
              <SectionHeader
                title={`${curriculumLessonDayLabel(selectedDay)} — ${trackConfig.lessonLabel(selectedLesson)}`}
              />
              {selectedGlobalDay != null && (
                <p className="text-caption" style={{ margin: '4px 0 0' }}>
                  يوم المنهج #{selectedGlobalDay}
                  {program && (
                    <> · {getDailyRepeatsForCurriculumDay(selectedGlobalDay)}×/يوم</>
                  )}
                </p>
              )}
              <button
                type="button"
                className="mock-btn mock-btn--outline"
                onClick={() => {
                  const next = !showAddForm;
                  setShowAddForm(next);
                  if (next) {
                    setAddDraft((d) => ({
                      ...d,
                      packageId: d.packageId || trackConfig.defaultPackageId(selectedLesson),
                    }));
                  } else resetAddDraft();
                }}
              >
                <Plus size={16} />
                {showAddForm ? 'إلغاء' : 'إضافة شريحة + وسائط'}
              </button>
            </div>

            {showAddForm && (
              <AdminCard className="quran-session-add-form">
                <SectionHeader title="شريحة جديدة — PowerPoint أو ملفات منفصلة" />
                <SlideMediaSourcePick
                  mode={addDraft.uploadMode}
                  onModeChange={(uploadMode) =>
                    setAddDraft((d) => ({
                      ...d,
                      uploadMode,
                      ...(uploadMode === 'separate'
                        ? { pptxFile: null }
                        : { imageFile: null, audioFile: null }),
                    }))
                  }
                  imageFile={addDraft.imageFile}
                  audioFile={addDraft.audioFile}
                  pptxFile={addDraft.pptxFile}
                  onImagePick={(imageFile) =>
                    setAddDraft((d) => ({ ...d, imageFile, uploadMode: 'separate', pptxFile: null }))
                  }
                  onAudioPick={(audioFile) =>
                    setAddDraft((d) => ({ ...d, audioFile, uploadMode: 'separate', pptxFile: null }))
                  }
                  onPptxPick={(bundle) => {
                    if (!bundle) {
                      setAddDraft((d) => ({
                        ...d,
                        pptxFile: null,
                        imageFile: null,
                        audioFile: null,
                      }));
                      return;
                    }
                    setAddDraft((d) => ({
                      ...d,
                      uploadMode: 'pptx',
                      pptxFile: bundle.pptxFile,
                      imageFile: bundle.imageFile,
                      audioFile: bundle.audioFile,
                    }));
                  }}
                />
                <label className="cms-field">
                  packageId
                  <input
                    type="text"
                    value={addDraft.packageId}
                    onChange={(e) => setAddDraft((d) => ({ ...d, packageId: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  عنوان (اختياري)
                  <input
                    type="text"
                    value={addDraft.title}
                    onChange={(e) => setAddDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </label>
                <label className="cms-field">
                  المدة (ثانية)
                  <input
                    type="number"
                    min={1}
                    value={addDraft.durationSec}
                    onChange={(e) => setAddDraft((d) => ({ ...d, durationSec: e.target.value }))}
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="mock-btn mock-btn--primary"
                    onClick={handleSaveNewSlide}
                    disabled={!slideMediaReady(addDraft)}
                  >
                    حفظ الشريحة
                  </button>
                  <button
                    type="button"
                    className="mock-btn mock-btn--outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddDraft();
                    }}
                  >
                    <X size={14} /> إلغاء
                  </button>
                </div>
              </AdminCard>
            )}

            <AdminTableContainer>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عالمي</th>
                    <th>حزمة</th>
                    <th>صورة</th>
                    <th>صوت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {daySlides.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-caption">
                        لا شرائح في هذا اليوم — أضف شريحة.
                      </td>
                    </tr>
                  ) : (
                    daySlides.map((s) => (
                      <tr
                        key={s.id}
                        className={selectedSlideId === s.id ? 'selected' : ''}
                        onClick={() => setSelectedSlideId(s.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{s.slideIndex}</td>
                        <td>{s.globalIndex}</td>
                        <td>
                          <code style={{ fontSize: '0.72rem' }}>{s.packageId}</code>
                        </td>
                        <td>
                          <StatusBadge tone={assetTone[s.imageStatus] ?? 'muted'}>
                            {s.imageStatus}
                          </StatusBadge>
                        </td>
                        <td>
                          <StatusBadge tone={assetTone[s.audioStatus] ?? 'muted'}>
                            {s.audioStatus}
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
                              handleDeleteSlide(s.id);
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
            <SectionHeader title="تفاصيل الشريحة" />
            {selectedSlide ? (
              <>
                <h4 style={{ margin: '0 0 8px', color: trackConfig.accentVar }}>
                  {selectedSlide.title ?? `شريحة ${selectedSlide.slideIndex}`}
                </h4>
                <p>
                  <strong>عالمي #{selectedSlide.globalIndex}</strong> — {selectedSlide.packageId}
                  {selectedSlide.pptxSource && (
                    <span className="text-caption"> · مصدر: {selectedSlide.pptxSource.name}</span>
                  )}
                </p>
                <SectionHeader title="تحديث الوسائط" />
                <SlideMediaSourcePick
                  compact
                  mode={selectedSlide.mediaUploadMode ?? 'separate'}
                  onModeChange={(uploadMode) =>
                    patchSelectedSlide({ mediaUploadMode: uploadMode })
                  }
                  imageFile={selectedSlide.imageFile}
                  audioFile={selectedSlide.audioFile}
                  pptxFile={selectedSlide.pptxSource}
                  onImagePick={(imageFile) => {
                    patchSelectedSlide({
                      imageFile: imageFile ?? null,
                      mediaUploadMode: 'separate',
                      pptxSource: null,
                    });
                    if (imageFile) showMock(`صورة: ${imageFile.name}`);
                  }}
                  onAudioPick={(audioFile) => {
                    patchSelectedSlide({
                      audioFile: audioFile ?? null,
                      mediaUploadMode: 'separate',
                      pptxSource: null,
                    });
                    if (audioFile) showMock(`صوت: ${audioFile.name}`);
                  }}
                  onPptxPick={(bundle) => {
                    if (!bundle) {
                      patchSelectedSlide({
                        pptxSource: null,
                        imageFile: null,
                        audioFile: null,
                        imageStatus: 'ناقص',
                        audioStatus: 'ناقص',
                      });
                      return;
                    }
                    patchSelectedSlide({ pptxBundle: bundle });
                    showMock(`استبدال من PPTX: ${bundle.pptxFile.name}`);
                  }}
                />
                {selectedSlide.assetPath && (
                  <p className="text-caption">
                    <code style={{ wordBreak: 'break-all' }}>{selectedSlide.assetPath}</code>
                  </p>
                )}
                {selectedSlide.audioPath && (
                  <p className="text-caption">
                    <code style={{ wordBreak: 'break-all' }}>{selectedSlide.audioPath}</code>
                  </p>
                )}
                <p>
                  <strong>المدة:</strong> {selectedSlide.durationSec} ث
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <Link
                    to={trackConfig.editorSlideLink}
                    className="mock-btn mock-btn--primary"
                    style={{ textDecoration: 'none' }}
                  >
                    محرر الشريحة
                  </Link>
                  <Link
                    to={trackConfig.editorLessonLink}
                    className="mock-btn mock-btn--outline"
                    style={{ textDecoration: 'none' }}
                  >
                    منشئ الدرس
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-caption">اختر شريحة أو أضف واحدة جديدة.</p>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
