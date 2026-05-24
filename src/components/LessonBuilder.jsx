import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  Plus,
} from 'lucide-react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import {
  createEmptySlide,
  getTrackMeta,
  lessonTracks,
  moveSlide,
  reindexSlides,
  slideStatusOptions,
} from '../data/lessonBuilder';
import { onboardingAgeGroups } from '../data/mockData';
import { useSnackbar } from '../context/SnackbarContext';

const publishTone = {
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
  منشور: 'success',
};

function LessonPreviewCard({ lesson }) {
  const track = getTrackMeta(lesson.track);
  const slide =
    lesson.slides[lesson.previewSlideIndex] ?? lesson.slides[0] ?? null;
  const total = lesson.slides.length;
  const current = slide ? slide.order : 0;
  const progress = total ? Math.round((current / total) * 100) : 0;

  return (
    <div className="lesson-preview-card" dir="rtl">
      <div className="lesson-preview-card__header" style={{ borderColor: track.color }}>
        <StatusBadge tone="info">{track.label}</StatusBadge>
        <span className="lesson-preview-card__lesson-num">درس {lesson.lessonNumber}</span>
      </div>
      <h3 className="lesson-preview-card__title">{lesson.title || 'عنوان الدرس'}</h3>
      {lesson.goal && <p className="lesson-preview-card__goal">{lesson.goal}</p>}
      <div className="lesson-preview-card__slide-frame">
        {slide?.imageName ? (
          <span>[صورة mock: {slide.imageName}]</span>
        ) : (
          <span className="text-caption">placeholder — أضف صورة للشريحة</span>
        )}
      </div>
      {slide && (
        <>
          <p className="lesson-preview-card__slide-title">{slide.title || `شريحة ${slide.order}`}</p>
          <p className="text-caption">{slide.description || '—'}</p>
          <p className="text-caption">
            {slide.audioName ? `🔊 ${slide.audioName}` : 'بدون صوت mock'} · {slide.durationSec}s
          </p>
        </>
      )}
      <div className="lesson-preview-card__progress">
        <div className="lesson-preview-card__progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="text-caption">
          شريحة {current} / {total} — {progress}%
        </span>
      </div>
      <p className="text-caption lesson-preview-card__meta">
        {lesson.appearanceDays} · {lesson.dailyRepetitions}×/يوم · تركيز {lesson.focusDurationMin} د
      </p>
    </div>
  );
}

export function LessonBuilder({ value, onChange }) {
  const lesson = value;
  const { showMock } = useSnackbar();

  const patch = (partial) => onChange({ ...lesson, ...partial });

  const updateSlide = (id, field, val) => {
    patch({
      slides: lesson.slides.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

  const addSlide = () => {
    const next = reindexSlides([...lesson.slides, createEmptySlide(lesson.slides.length + 1)]);
    patch({ slides: next, previewSlideIndex: next.length - 1 });
  };

  const removeSlide = (id) => {
    if (lesson.slides.length <= 1) return;
    const next = reindexSlides(lesson.slides.filter((s) => s.id !== id));
    patch({ slides: next, previewSlideIndex: 0 });
  };

  const copyLesson = () => {
    patch({
      title: `${lesson.title || 'درس'} (نسخة)`,
      publishStatus: 'مسودة',
    });
    showMock('نسخ درس (UI فقط) — لم يُنشأ manifest');
  };

  const previewRound = () => {
    const next = (lesson.previewSlideIndex + 1) % Math.max(lesson.slides.length, 1);
    patch({ previewSlideIndex: next });
  };

  return (
    <div className="lesson-builder">
      <InfoBanner tone="info">
        Lesson Builder شكلي — لا manifest حقيقي، لا تعديل assets، لا Backend.
      </InfoBanner>

      <div className="grid-2 lesson-builder__layout">
        <div className="lesson-builder__form">
          <AdminCard>
            <SectionHeader title="المسار والدرس" />
            <div className="chip-grid">
              {lessonTracks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-btn${lesson.track === t.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patch({ track: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
              <label className="cms-field">
                رقم الدرس
                <input
                  type="number"
                  min="1"
                  value={lesson.lessonNumber}
                  onChange={(e) => patch({ lessonNumber: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="cms-field">
                حالة النشر
                <select
                  value={lesson.publishStatus}
                  onChange={(e) => patch({ publishStatus: e.target.value })}
                >
                  <option value="مسودة">مسودة</option>
                  <option value="يحتاج مراجعة">يحتاج مراجعة</option>
                  <option value="منشور">منشور</option>
                </select>
              </label>
            </div>
            <label className="cms-field">
              عنوان الدرس
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label className="cms-field">
              هدف الدرس
              <input type="text" value={lesson.goal} onChange={(e) => patch({ goal: e.target.value })} />
            </label>
            <label className="cms-field">
              وصف قصير
              <textarea
                rows={2}
                value={lesson.shortDescription}
                onChange={(e) => patch({ shortDescription: e.target.value })}
              />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                اليوم / أيام الظهور
                <input
                  type="text"
                  value={lesson.appearanceDays}
                  onChange={(e) => patch({ appearanceDays: e.target.value })}
                  placeholder="1–5"
                />
              </label>
              <label className="cms-field">
                عدد التكرارات اليومية
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={lesson.dailyRepetitions}
                  onChange={(e) => patch({ dailyRepetitions: Number(e.target.value) || 1 })}
                />
              </label>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                مدة التركيز (دقيقة)
                <input
                  type="number"
                  min="1"
                  value={lesson.focusDurationMin}
                  onChange={(e) => patch({ focusDurationMin: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="cms-field">
                الفئة العمرية
                <select
                  value={lesson.ageGroup}
                  onChange={(e) => patch({ ageGroup: e.target.value })}
                >
                  {onboardingAgeGroups.map((g) => (
                    <option key={g.id} value={g.label}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-caption">
              عدد الشرائح: <strong>{lesson.slides.length}</strong> (يُحدَّث تلقائياً من الجدول)
            </p>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="شرائح الدرس" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <button type="button" className="mock-btn mock-btn--primary" onClick={addSlide}>
                <Plus size={16} /> إضافة شريحة
              </button>
              <button type="button" className="mock-btn mock-btn--outline" onClick={copyLesson}>
                <Copy size={16} /> نسخ درس
              </button>
              <button type="button" className="mock-btn mock-btn--outline" onClick={previewRound}>
                <Eye size={16} /> معاينة الجولة
              </button>
            </div>
            <AdminTableContainer style={{ maxHeight: 360 }}>
              <table className="admin-table admin-table--compact lesson-slides-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان / وصف</th>
                    <th>صورة</th>
                    <th>صوت</th>
                    <th>ث</th>
                    <th>الحالة</th>
                    <th>ترتيب</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lesson.slides.map((slide) => (
                    <tr key={slide.id}>
                      <td>{slide.order}</td>
                      <td>
                        <input
                          className="lesson-slides-table__input"
                          value={slide.title}
                          placeholder="عنوان"
                          onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                        />
                        <input
                          className="lesson-slides-table__input"
                          value={slide.description}
                          placeholder="وصف"
                          onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="lesson-slides-table__input"
                          value={slide.imageName}
                          placeholder="slide.png"
                          onChange={(e) => updateSlide(slide.id, 'imageName', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="lesson-slides-table__input"
                          value={slide.audioName}
                          placeholder=".m4a"
                          onChange={(e) => updateSlide(slide.id, 'audioName', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="lesson-slides-table__input lesson-slides-table__input--num"
                          type="number"
                          value={slide.durationSec}
                          onChange={(e) =>
                            updateSlide(slide.id, 'durationSec', Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="lesson-slides-table__select"
                          value={slide.status}
                          onChange={(e) => updateSlide(slide.id, 'status', e.target.value)}
                        >
                          {slideStatusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="lesson-slides-table__reorder">
                          <button
                            type="button"
                            className="lesson-slides-table__icon-btn"
                            aria-label="أعلى"
                            onClick={() => patch({ slides: moveSlide(lesson.slides, slide.id, -1) })}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="lesson-slides-table__icon-btn"
                            aria-label="أسفل"
                            onClick={() => patch({ slides: moveSlide(lesson.slides, slide.id, 1) })}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="article-block__remove"
                          onClick={() => removeSlide(slide.id)}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          </AdminCard>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ مسودة</MockActionButton>
            <MockActionButton action="check" message="إرسال للمراجعة (UI فقط)">
              إرسال للمراجعة
            </MockActionButton>
            <MockActionButton action="publish">نشر</MockActionButton>
          </div>
        </div>

        <AdminCard className="lesson-builder__preview-wrap">
          <SectionHeader title="معاينة — بطاقة الدرس" />
          <StatusBadge tone={publishTone[lesson.publishStatus]}>{lesson.publishStatus}</StatusBadge>
          <LessonPreviewCard lesson={lesson} />
        </AdminCard>
      </div>
    </div>
  );
}
