import { Dumbbell, Sparkles, Users } from 'lucide-react';
import { AdminCard } from './AdminCard';
import { EmptyState } from './EmptyState';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  activityExercisePlanOptions,
  activityExercisePublishOptions,
  activityExerciseTypes,
  editorAgeGroups,
  getActivityExerciseValidation,
  getAgeGroupLabel,
  getSectionLabel,
} from '../data/activityExerciseEditor';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';

const publishTone = {
  منشور: 'success',
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
};

function ActivityExercisePreview({ item }) {
  const section = getSectionLabel(item.itemType);
  const ageLabel = getAgeGroupLabel(item.ageGroupId);
  const thumbUrl = getYoutubeThumbnailUrl(item.videoId);

  return (
    <div className="activity-exercise-preview" dir="rtl">
      {thumbUrl ? (
        <img className="library-preview-thumb" src={thumbUrl} alt="" />
      ) : (
        <div className="math-slide-preview__img">
          {item.playlistId ? 'Playlist — بدون thumbnail' : 'أدخل videoId للمعاينة'}
        </div>
      )}
      <h3 className="activity-exercise-preview__title">{item.title || '— العنوان —'}</h3>
      <div className="activity-exercise-preview__meta">
        <StatusBadge tone="info">
          {item.itemType === 'activity' ? (
            <>
              <Sparkles size={12} /> نشاط
            </>
          ) : (
            <>
              <Dumbbell size={12} /> تمرين
            </>
          )}
        </StatusBadge>
        <StatusBadge tone={publishTone[item.publishStatus] ?? 'muted'}>{item.publishStatus}</StatusBadge>
      </div>
      <InfoBanner tone="info">
        <strong>سيظهر في:</strong> {section}
      </InfoBanner>
      <p className="activity-exercise-preview__line">
        <strong>سيظهر لعمر:</strong> {ageLabel}
      </p>
      <p className="activity-exercise-preview__line">
        <Users size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
        <strong>يتطلب إشراف:</strong> {item.requiresSupervision ? 'نعم' : 'لا'}
      </p>
      {item.moodTag && (
        <p className="text-caption">
          moodTag: <code>{item.moodTag}</code>
        </p>
      )}
      {item.parentNote && (
        <p className="activity-exercise-preview__note">
          <strong>parentNote:</strong> {item.parentNote}
        </p>
      )}
      {item.safetyInstructions && (
        <p className="activity-exercise-preview__safety">
          <strong>السلامة:</strong> {item.safetyInstructions}
        </p>
      )}
      <p className="text-caption">الباقة: {item.requiredPlan}</p>
    </div>
  );
}

function NewItemsList({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <EmptyState
        compact
        title="لا عناصر جديدة بعد"
        description="اضغط «إضافة للقائمة» لحفظ mock — القائمة تُفرغ بعد refresh."
      />
    );
  }

  return (
    <ul className="activity-exercise-draft-list">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <button type="button" className="activity-exercise-draft-list__btn" onClick={() => onSelect?.(item)}>
            <StatusBadge tone={item.itemType === 'activity' ? 'info' : 'warning'}>
              {item.itemType === 'activity' ? 'نشاط' : 'تمرين'}
            </StatusBadge>
            <span>{item.title || 'بدون عنوان'}</span>
            <span className="text-caption">{getAgeGroupLabel(item.ageGroupId)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ActivityExerciseEditor({ value, onChange, draftItems = [], onAddDraft, onSelectDraft }) {
  const item = value;
  const validation = getActivityExerciseValidation(item);
  const { showMock } = useSnackbar();

  const patch = (partial) => onChange({ ...item, ...partial });

  const handleAddToList = () => {
    onAddDraft?.({ ...item, id: `draft_${Date.now()}` });
    showMock('أُضيف للقائمة (UI فقط) — لا حفظ فعلي');
  };

  return (
    <div className="activity-exercise-editor">
      <InfoBanner tone="info">
        ActivityExerciseEditor UI فقط — لا فتح YouTube، لا حفظ بعد refresh.
      </InfoBanner>

      <div className="grid-2 activity-exercise-editor__layout">
        <div className="activity-exercise-editor__form">
          <AdminCard>
            <SectionHeader title="النوع والعمر" />
            <div className="chip-grid">
              {activityExerciseTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-btn${item.itemType === t.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patch({ itemType: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="cms-field" style={{ marginTop: 12, marginBottom: 8 }}>
              الفئة العمرية التفصيلية
            </p>
            <div className="chip-grid activity-exercise-age-grid">
              {editorAgeGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`chip-btn chip-btn--sm${item.ageGroupId === g.id ? ' chip-btn--active' : ''}`}
                  onClick={() => patch({ ageGroupId: g.id })}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="المحتوى" />
            <label className="cms-field">
              العنوان
              <input
                type="text"
                value={item.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="تمرين قصير ١"
              />
            </label>
            <label className="cms-field">
              الوصف
              <textarea
                rows={3}
                value={item.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="وصف مختصر للأم"
              />
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                videoId
                <input
                  type="text"
                  value={item.videoId}
                  onChange={(e) => patch({ videoId: e.target.value.trim() })}
                  placeholder="puUzPozUdP0"
                />
              </label>
              <label className="cms-field">
                playlistId
                <input
                  type="text"
                  value={item.playlistId}
                  onChange={(e) => patch({ playlistId: e.target.value.trim() })}
                  placeholder="PLFYChdc..."
                />
              </label>
            </div>
            <label className="cms-field">
              moodTag
              <input
                type="text"
                value={item.moodTag}
                onChange={(e) => patch({ moodTag: e.target.value })}
                placeholder="تمرين"
              />
            </label>
            <label className="cms-field">
              parentNote
              <textarea
                rows={2}
                value={item.parentNote}
                onChange={(e) => patch({ parentNote: e.target.value })}
                placeholder="ملاحظة للأم في أعلى الشاشة"
              />
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="السلامة والنشر" />
            <label className="cms-field">
              تعليمات السلامة
              <textarea
                rows={2}
                value={item.safetyInstructions}
                onChange={(e) => patch({ safetyInstructions: e.target.value })}
                placeholder="إشراف ولي الأمر..."
              />
            </label>
            <label className="cms-field activity-exercise-checkbox">
              <input
                type="checkbox"
                checked={item.requiresSupervision}
                onChange={(e) => patch({ requiresSupervision: e.target.checked })}
              />
              يحتاج إشراف ولي الأمر
            </label>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                الاشتراك المطلوب
                <select value={item.requiredPlan} onChange={(e) => patch({ requiredPlan: e.target.value })}>
                  {activityExercisePlanOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">
                حالة النشر
                <select value={item.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value })}>
                  {activityExercisePublishOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </AdminCard>

          {validation.length > 0 && (
            <div className="activity-exercise-validation">
              {validation.map((v) => (
                <InfoBanner key={v.id} tone={v.severity === 'error' ? 'warning' : 'info'}>
                  {v.message}
                </InfoBanner>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save" onClick={handleAddToList}>
              إضافة للقائمة
            </MockActionButton>
            <MockActionButton action="publish">نشر (mock)</MockActionButton>
          </div>
        </div>

        <div className="activity-exercise-editor__side">
          <AdminCard className="activity-exercise-editor__preview-wrap">
            <SectionHeader title="معاينة الظهور" />
            <ActivityExercisePreview item={item} />
          </AdminCard>

          <AdminCard>
            <SectionHeader title="العناصر الجديدة (جلسة)" />
            <NewItemsList items={draftItems} onSelect={onSelectDraft} />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
