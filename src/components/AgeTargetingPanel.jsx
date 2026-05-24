import { Baby, Dumbbell } from 'lucide-react';
import { InfoBanner } from './InfoBanner';
import { SectionHeader } from './SectionHeader';
import { mediaAgeGroups, onboardingAgeGroups } from '../data/mockData';
import {
  AGE_TARGET_MODES,
  buildAgePreview,
  getAgeTargetingWarnings,
} from '../utils/ageTargeting';

function toggleSelection(value, matrix, id, onChange) {
  const key = matrix === 'onboarding' ? 'onboardingSelected' : 'mediaSelected';
  const otherKey = matrix === 'onboarding' ? 'mediaSelected' : 'onboardingSelected';
  const current = value[key];

  if (value.mode === 'single') {
    const isActive = current.includes(id);
    onChange({
      ...value,
      [key]: isActive ? [] : [id],
      [otherKey]: [],
    });
    return;
  }

  const has = current.includes(id);
  onChange({
    ...value,
    [key]: has ? current.filter((x) => x !== id) : [...current, id],
  });
}

export function AgeTargetingPanel({ value, onChange, contentType, section }) {
  const preview = buildAgePreview(value);
  const warnings = getAgeTargetingWarnings(value, { contentType, section });

  const setMode = (mode) => {
    if (mode === 'all') {
      onChange({
        ...value,
        mode,
        onboardingSelected: [],
        mediaSelected: [],
      });
      return;
    }
    onChange({ ...value, mode });
  };

  return (
    <div className="age-targeting-panel">
      <SectionHeader title="استهداف العمر" />
      <p className="text-caption age-targeting-panel__intro">
        حدّد للأطفال من أي عمر يظهر المحتوى. الفئات الأساسية من{' '}
        <code>BabyAgeRange</code>؛ الأنشطة والرياضة تستخدم تقسيماً أدق بالأشهر.
      </p>

      <p className="cms-field" style={{ marginBottom: 8 }}>
        طريقة الاختيار
      </p>
      <div className="chip-grid age-targeting-modes">
        {AGE_TARGET_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`chip-btn${value.mode === m.id ? ' chip-btn--active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="age-matrix-legend">
        <div className="age-matrix-legend__item age-matrix-legend__item--onboarding">
          <Baby size={18} />
          <div>
            <strong>فئات onboarding الأساسية</strong>
            <span>5 فئات — ملف الطفل وonboarding (BabyAgeRange)</span>
          </div>
        </div>
        <div className="age-matrix-legend__item age-matrix-legend__item--media">
          <Dumbbell size={18} />
          <div>
            <strong>فئات الأنشطة والرياضة</strong>
            <span>7 فئات — tamareen / MediaAgeHub / قوائم YouTube</span>
          </div>
        </div>
      </div>

      {value.mode !== 'all' && value.mode !== 'custom' && (
        <>
          <h5 className="age-matrix__heading">فئات onboarding الأساسية</h5>
          <div className="age-matrix age-matrix--onboarding">
            {onboardingAgeGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`age-matrix__chip${value.onboardingSelected.includes(g.id) ? ' age-matrix__chip--active' : ''}`}
                onClick={() => toggleSelection(value, 'onboarding', g.id, onChange)}
              >
                <span className="age-matrix__chip-label">{g.label}</span>
                <span className="age-matrix__chip-range">
                  {g.minMonths}–{g.maxMonths} شهر
                </span>
              </button>
            ))}
          </div>

          <h5 className="age-matrix__heading">فئات الأنشطة والرياضة التفصيلية</h5>
          <div className="age-matrix age-matrix--media">
            {mediaAgeGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`age-matrix__chip${value.mediaSelected.includes(g.id) ? ' age-matrix__chip--active' : ''}`}
                onClick={() => toggleSelection(value, 'media', g.id, onChange)}
              >
                <span className="age-matrix__chip-label">{g.label}</span>
                <span className="age-matrix__chip-range">
                  {g.minMonths}–{g.maxMonths} شهر
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {value.mode === 'custom' && (
        <div className="age-targeting-custom grid-2">
          <label className="cms-field">
            من (شهر)
            <input
              type="number"
              min="0"
              max="48"
              value={value.customFromMonths}
              onChange={(e) =>
                onChange({ ...value, customFromMonths: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="cms-field">
            إلى (شهر)
            <input
              type="number"
              min="0"
              max="48"
              value={value.customToMonths}
              onChange={(e) =>
                onChange({ ...value, customToMonths: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
      )}

      <div className="age-targeting-preview">
        <strong>معاينة:</strong> {preview}
      </div>

      {warnings.map((w) => (
        <InfoBanner key={w.id} tone="warning">
          {w.message}
        </InfoBanner>
      ))}
    </div>
  );
}
