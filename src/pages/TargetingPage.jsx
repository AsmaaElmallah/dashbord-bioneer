import { useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  targetingAudiences,
  targetingConditionOptions,
  targetingContentTypes,
  targetingExamples,
  targetingPlacements,
  targetingRules,
} from '../data/mockData';

const STEPS = ['نوع المحتوى', 'الجمهور', 'مكان الظهور', 'شروط الظهور'];

const defaultWizard = {
  contentType: 'فيديو',
  audience: '4-6 أشهر',
  placement: 'الرياضة',
  conditions: ['دائم', 'للمشتركين فقط'],
  dateStart: '2026-05-01',
  dateEnd: '2026-12-31',
  curriculumDay: '56',
  publishStatus: 'مسودة',
};

function buildShowsWhen(wizard) {
  const parts = [];
  if (wizard.conditions.includes('دائم')) parts.push('دائماً عند فتح القسم');
  if (wizard.conditions.includes('تاريخ بداية ونهاية')) {
    parts.push(`من ${wizard.dateStart} إلى ${wizard.dateEnd}`);
  }
  if (wizard.conditions.includes('بعد إكمال درس')) parts.push('بعد إكمال الدرس السابق في المسار');
  if (wizard.conditions.includes('بعد إكمال اختبار')) parts.push('بعد إكمال اختبار المهارات/الميول');
  if (wizard.conditions.includes('يوم منهج معين')) {
    parts.push(`يوم المنهج ${wizard.curriculumDay}`);
  }
  if (wizard.conditions.includes('مرة واحدة')) parts.push('مرة واحدة لكل جهاز');
  if (wizard.conditions.includes('للمشتركين فقط')) parts.push('اشتراك فضية أو أعلى');
  return parts.length ? parts.join(' · ') : '—';
}

export function TargetingPage() {
  const [step, setStep] = useState(0);
  const [wizard, setWizard] = useState(defaultWizard);

  const showsWhen = useMemo(() => buildShowsWhen(wizard), [wizard]);

  const toggleCondition = (label) => {
    setWizard((w) => {
      const has = w.conditions.includes(label);
      return {
        ...w,
        conditions: has ? w.conditions.filter((c) => c !== label) : [...w.conditions, label],
      };
    });
  };

  const loadExample = (ex) => {
    setWizard({
      ...defaultWizard,
      contentType: ex.contentType,
      audience: ex.audience,
      placement: ex.placement,
      conditions: ex.conditions,
      publishStatus: ex.publishStatus,
      curriculumDay: ex.contentType === 'شريحة' ? '56' : defaultWizard.curriculumDay,
    });
    setStep(3);
  };

  return (
    <div className="page-stack">
      <PageHeader title="توجيه المحتوى — لمن وأين ومتى" />

      <AdminCard>
        <SectionHeader title="أمثلة جاهزة" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {targetingExamples.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={() => loadExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </AdminCard>

      <div className="grid-2 targeting-layout">
        <AdminCard>
          <div className="wizard-steps">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`wizard-steps__item${step === i ? ' wizard-steps__item--active' : ''}${i < step ? ' wizard-steps__item--done' : ''}`}
                onClick={() => setStep(i)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="wizard-panel">
              <h4>الخطوة 1: نوع المحتوى</h4>
              <div className="chip-grid">
                {targetingContentTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip-btn${wizard.contentType === t ? ' chip-btn--active' : ''}`}
                    onClick={() => setWizard((w) => ({ ...w, contentType: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="wizard-panel">
              <h4>الخطوة 2: الجمهور المستهدف</h4>
              <div className="chip-grid">
                {targetingAudiences.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`chip-btn${wizard.audience === a ? ' chip-btn--active' : ''}`}
                    onClick={() => setWizard((w) => ({ ...w, audience: a }))}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-panel">
              <h4>الخطوة 3: مكان الظهور</h4>
              <div className="chip-grid">
                {targetingPlacements.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`chip-btn${wizard.placement === p ? ' chip-btn--active' : ''}`}
                    onClick={() => setWizard((w) => ({ ...w, placement: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-panel">
              <h4>الخطوة 4: شروط الظهور</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {targetingConditionOptions.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={wizard.conditions.includes(opt.label)}
                      onChange={() => toggleCondition(opt.label)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {wizard.conditions.includes('تاريخ بداية ونهاية') && (
                <div className="filters-row" style={{ marginTop: 12 }}>
                  <input
                    type="date"
                    value={wizard.dateStart}
                    onChange={(e) => setWizard((w) => ({ ...w, dateStart: e.target.value }))}
                  />
                  <input
                    type="date"
                    value={wizard.dateEnd}
                    onChange={(e) => setWizard((w) => ({ ...w, dateEnd: e.target.value }))}
                  />
                </div>
              )}
              {wizard.conditions.includes('يوم منهج معين') && (
                <label style={{ marginTop: 12, display: 'block' }}>
                  يوم المنهج:{' '}
                  <input
                    type="number"
                    min={1}
                    max={730}
                    value={wizard.curriculumDay}
                    onChange={(e) => setWizard((w) => ({ ...w, curriculumDay: e.target.value }))}
                    style={{ width: 80, marginRight: 8 }}
                  />
                </label>
              )}
              <label style={{ marginTop: 16, display: 'block' }}>
                حالة النشر:
                <select
                  value={wizard.publishStatus}
                  onChange={(e) => setWizard((w) => ({ ...w, publishStatus: e.target.value }))}
                  style={{ width: '100%', marginTop: 6 }}
                >
                  <option value="مسودة">مسودة</option>
                  <option value="منشور">منشور</option>
                </select>
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              السابق
            </button>
            <button
              type="button"
              className="mock-btn mock-btn--primary"
              disabled={step === 3}
              onClick={() => setStep((s) => s + 1)}
            >
              التالي
            </button>
            <MockActionButton variant="secondary" action="save">حفظ القاعدة (mock)</MockActionButton>
          </div>
        </AdminCard>

        <AdminCard className="targeting-preview">
          <h3 style={{ marginTop: 0 }}>معاينة التوجيه</h3>
          <p>
            <strong>سيظهر عند:</strong>
            <br />
            {showsWhen}
          </p>
          <p>
            <strong>سيظهر في:</strong>
            <br />
            {wizard.placement}
            {wizard.contentType === 'فيديو' && wizard.placement === 'الرياضة'
              ? ' → tamareen / MediaAgeHub'
              : ''}
          </p>
          <p>
            <strong>لـ:</strong> {wizard.audience}
          </p>
          <p>
            <strong>نوع المحتوى:</strong> {wizard.contentType}
          </p>
          <p>
            <strong>الشروط:</strong> {wizard.conditions.join('، ') || '—'}
          </p>
          <p>
            <strong>حالة النشر:</strong>{' '}
            <StatusBadge tone={wizard.publishStatus === 'منشور' ? 'success' : 'muted'}>
              {wizard.publishStatus}
            </StatusBadge>
          </p>
        </AdminCard>
      </div>

      <AdminCard>
        <SectionHeader title="قواعد الظهور (mock)" />
        <AdminTableContainer>
          <table className="admin-table admin-table--cards">
            <thead>
              <tr>
                <th>المحتوى</th>
                <th>الجمهور</th>
                <th>المكان</th>
                <th>الشرط</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {targetingRules.map((r) => (
                <tr key={r.id}>
                  <td data-label="المحتوى">{r.content}</td>
                  <td data-label="الجمهور">{r.audience}</td>
                  <td data-label="المكان">{r.placement}</td>
                  <td data-label="الشرط" style={{ fontSize: '0.85rem' }}>{r.condition}</td>
                  <td data-label="الحالة">
                    <StatusBadge tone={r.status === 'منشور' ? 'success' : 'muted'}>
                      {r.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableContainer>
      </AdminCard>
    </div>
  );
}
