import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgeTargetingPanel } from '../components/AgeTargetingPanel';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { MediaUploadPanel } from '../components/MediaUploadPanel';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { PlacementPicker } from '../components/PlacementPicker';
import {
  contentStudioTypes,
  contentWizardLanguages,
  contentWizardPlans,
  targetingConditionOptions,
} from '../data/mockData';
import {
  ageTargetingShortLabel,
  buildAgePreview,
  createEmptyAgeTargeting,
} from '../utils/ageTargeting';
import { buildPlacementPreview, placementSectionKey } from '../utils/placement';
import {
  createEmptyMediaUpload,
  mediaFileLabel,
  mediaUploadSummary,
} from '../utils/mediaUpload';
import { ContentValidationPanel, FieldValidationHint } from '../components/ContentValidationPanel';
import { buildContentValidation, getFieldError } from '../utils/contentValidation';
import { useSnackbar } from '../context/SnackbarContext';

const STEPS = [
  { full: 'نوع المحتوى', short: 'النوع' },
  { full: 'بيانات المحتوى', short: 'البيانات' },
  { full: 'الوسائط والملفات', short: 'الوسائط' },
  { full: 'الجمهور ومكان الظهور', short: 'الجمهور' },
  { full: 'المراجعة والنشر', short: 'النشر' },
];

const MOCK_FILES = {
  cover: 'cover-bayanour.jpg',
  extra: 'slide-extra-01.png',
  audio: 'session-audio.m4a',
  video: 'lesson-intro.mp4',
};

const mockFile = (name, sizeMock = '124 KB') => ({ name, sizeMock, notUploaded: true });

const publishTone = {
  مسودة: 'muted',
  'يحتاج مراجعة': 'warning',
  منشور: 'success',
};

function resolveContentType(typeId) {
  if (!typeId) return 'مقال';
  const match = contentStudioTypes.find((t) => t.id === typeId);
  return match?.label ?? 'مقال';
}

function createDefaultWizard(contentType) {
  return {
    contentType,
    title: '',
    subtitle: '',
    shortDescription: '',
    body: '',
    tags: '',
    language: 'ar',
    sortOrder: '10',
    mediaUpload: createEmptyMediaUpload(),
    ageTargeting: createEmptyAgeTargeting(),
    placementId: 'library',
    requiredPlan: 'فضية',
    dateStart: '2026-05-01',
    dateEnd: '2026-12-31',
    conditions: ['دائم'],
    publishStatus: 'مسودة',
  };
}

function buildShowsWhen(wizard) {
  const parts = [];
  if (wizard.conditions.includes('دائم')) parts.push('دائماً عند فتح القسم');
  if (wizard.conditions.includes('تاريخ بداية ونهاية')) {
    parts.push(`من ${wizard.dateStart} إلى ${wizard.dateEnd}`);
  }
  if (wizard.conditions.includes('بعد إكمال درس')) parts.push('بعد إكمال الدرس السابق');
  if (wizard.conditions.includes('بعد إكمال اختبار')) parts.push('بعد إكمال اختبار المهارات');
  if (wizard.conditions.includes('يوم منهج معين')) parts.push('يوم منهج محدد');
  if (wizard.conditions.includes('مرة واحدة')) parts.push('مرة واحدة لكل جهاز');
  if (wizard.conditions.includes('للمشتركين فقط')) parts.push(`باقة ${wizard.requiredPlan} أو أعلى`);
  return parts.length ? parts.join(' · ') : '—';
}

export function ContentWizardPage() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [step, setStep] = useState(typeFromUrl ? 1 : 0);
  const [wizard, setWizard] = useState(() => createDefaultWizard(resolveContentType(typeFromUrl)));
  const { showMock } = useSnackbar();

  const showsWhen = useMemo(() => buildShowsWhen(wizard), [wizard]);
  const agePreview = useMemo(() => buildAgePreview(wizard.ageTargeting), [wizard.ageTargeting]);
  const placementPreview = useMemo(
    () => buildPlacementPreview(wizard.placementId),
    [wizard.placementId],
  );
  const placementSection = useMemo(
    () => placementSectionKey(wizard.placementId),
    [wizard.placementId],
  );
  const tagList = wizard.tags
    .split(/،|,/)
    .map((t) => t.trim())
    .filter(Boolean);

  const validation = useMemo(() => buildContentValidation(wizard), [wizard]);
  const fieldErrors = validation.fieldErrors;

  const update = (field, value) => setWizard((w) => ({ ...w, [field]: value }));

  const toggleCondition = (label) => {
    setWizard((w) => {
      const has = w.conditions.includes(label);
      return {
        ...w,
        conditions: has ? w.conditions.filter((c) => c !== label) : [...w.conditions, label],
      };
    });
  };

  const loadVideoExample = () => {
    setWizard({
      ...createDefaultWizard('فيديو'),
      title: 'فيديو تغذية — 4-6 أشهر',
      subtitle: 'مقدمة للأمهات عن التغذية التكميلية',
      shortDescription: 'فيديو قصير يشرح خطوات البدء بالتغذية التكميلية بأمان.',
      body: 'محتوى الوصف الكامل للفيديو — يظهر في تفاصيل المكتبة.\n\nنصائح عملية للأمهات.',
      tags: 'تغذية, 4-6 أشهر, مكتبة',
      language: 'ar',
      sortOrder: '5',
      mediaUpload: createEmptyMediaUpload({
        coverImage: mockFile(MOCK_FILES.cover),
        youtubeVideoId: 'dQw4w9WgXcQ',
        playlistId: 'PL-bayanour-feeding',
        duration: '4:32',
        imageAlt: 'أم تقدّم طعاماً لطفل 5 أشهر',
      }),
      ageTargeting: createEmptyAgeTargeting({
        mode: 'single',
        onboardingSelected: ['age3to6'],
        mediaSelected: [],
      }),
      placementId: 'calm_music',
      requiredPlan: 'فضية',
      conditions: ['دائم', 'للمشتركين فقط'],
      publishStatus: 'مسودة',
    });
    setStep(4);
    showMock('تحميل مثال فيديو mock — UI فقط');
  };

  const loadExerciseExample = () => {
    setWizard({
      ...createDefaultWizard('تمرين'),
      title: 'تمرين 4-6 أشهر — تنشيط مبكر',
      subtitle: 'تمارين قصيرة للرضيع',
      shortDescription: 'فيديو تمرين من tamareen لعمر 4–6 أشهر.',
      body: 'تمرين mock — يُعرض في MediaAgeHub ضمن فئة 4–6 أشهر.',
      tags: 'رياضة, 4-6 أشهر, tamareen',
      mediaUpload: createEmptyMediaUpload({
        youtubeVideoId: 'puUzPozUdP0',
        playlistId: 'PLFYChdcFDqm1OvmAgkeCIrZ-Rzevai8km',
        duration: '3:15',
      }),
      ageTargeting: createEmptyAgeTargeting({
        mode: 'single',
        onboardingSelected: [],
        mediaSelected: ['age_4_6'],
      }),
      placementId: 'exercises',
      requiredPlan: 'فضية',
      conditions: ['دائم', 'للمشتركين فقط'],
      publishStatus: 'مسودة',
    });
    setStep(3);
    showMock('تحميل مثال تمرين mock — UI فقط');
  };

  const loadLullabiesExample = () => {
    setWizard({
      ...createDefaultWizard('صوت'),
      title: 'تهويدة هادئة للنوم',
      subtitle: 'موسيقى نوم للرضيع',
      shortDescription: 'ملف صوتي mock لقسم تهويدات المكتبة.',
      tags: 'تهويدات, نوم, مكتبة',
      mediaUpload: createEmptyMediaUpload({
        audioFile: mockFile(MOCK_FILES.audio),
        duration: '2:10',
      }),
      ageTargeting: createEmptyAgeTargeting({ mode: 'all', onboardingSelected: [], mediaSelected: [] }),
      placementId: 'lullabies',
      requiredPlan: 'بدون اشتراك',
      conditions: ['دائم'],
      publishStatus: 'مسودة',
    });
    setStep(3);
    showMock('تحميل مثال تهويدات mock — UI فقط');
  };

  return (
    <div className="page-stack content-entry-page">
      <Link to="/content-studio" className="content-wizard-back">
        <ArrowRight size={16} />
        العودة إلى استوديو المحتوى
      </Link>

      <PageHeader title="إنشاء محتوى جديد" extraBadges={['معالج موحّد']} />

      <InfoBanner tone="warning">
        معالج شكلي <strong>UI فقط</strong> — البيانات في <code>useState</code> محلي وتُفقد بعد
        refresh. لا Backend ولا API.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="مثال سريع" />
        <div className="content-entry-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="mock-btn mock-btn--outline" onClick={loadVideoExample}>
            تحميل مثال فيديو mock
          </button>
          <button type="button" className="mock-btn mock-btn--outline" onClick={loadExerciseExample}>
            تحميل مثال تمرين 4-6 أشهر
          </button>
          <button type="button" className="mock-btn mock-btn--outline" onClick={loadLullabiesExample}>
            تحميل مثال المكتبة → تهويدات
          </button>
        </div>
      </AdminCard>

      <div className="grid-2 content-wizard-layout">
        <AdminCard>
          <div className="wizard-steps">
            {STEPS.map((stepDef, i) => (
              <button
                key={stepDef.full}
                type="button"
                className={`wizard-steps__item${step === i ? ' wizard-steps__item--active' : ''}${i < step ? ' wizard-steps__item--done' : ''}`}
                onClick={() => setStep(i)}
              >
                {i + 1}.{' '}
                <span className="wizard-steps__label-full">{stepDef.full}</span>
                <span className="wizard-steps__label-short">{stepDef.short}</span>
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="wizard-panel">
              <h4>الخطوة 1: نوع المحتوى</h4>
              <div className="chip-grid">
                {contentStudioTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`chip-btn${wizard.contentType === t.label ? ' chip-btn--active' : ''}`}
                    onClick={() => update('contentType', t.label)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-caption" style={{ marginTop: 12 }}>
                {contentStudioTypes.find((t) => t.label === wizard.contentType)?.description ??
                  '—'}
              </p>
              <FieldValidationHint message={getFieldError(fieldErrors, 'contentType')} />
            </div>
          )}

          {step === 1 && (
            <div className="wizard-panel">
              <h4>الخطوة 2: بيانات المحتوى</h4>
              <label className="cms-field">
                العنوان
                <input
                  type="text"
                  className={getFieldError(fieldErrors, 'title') ? 'cms-field__input--invalid' : ''}
                  value={wizard.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="عنوان المحتوى"
                />
              </label>
              <FieldValidationHint message={getFieldError(fieldErrors, 'title')} />
              <label className="cms-field">
                العنوان الفرعي
                <input
                  type="text"
                  value={wizard.subtitle}
                  onChange={(e) => update('subtitle', e.target.value)}
                />
              </label>
              <label className="cms-field">
                الوصف المختصر
                <input
                  type="text"
                  value={wizard.shortDescription}
                  onChange={(e) => update('shortDescription', e.target.value)}
                />
              </label>
              <label className="cms-field">
                المحتوى (body)
                <textarea
                  rows={6}
                  value={wizard.body}
                  onChange={(e) => update('body', e.target.value)}
                />
              </label>
              <label className="cms-field">
                الوسوم (Tags)
                <input
                  type="text"
                  value={wizard.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  placeholder="وسم1، وسم2"
                />
              </label>
              <div className="grid-2" style={{ gap: 12 }}>
                <label className="cms-field">
                  اللغة
                  <select
                    value={wizard.language}
                    onChange={(e) => update('language', e.target.value)}
                  >
                    {contentWizardLanguages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cms-field">
                  ترتيب العرض
                  <input
                    type="number"
                    min="0"
                    value={wizard.sortOrder}
                    onChange={(e) => update('sortOrder', e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-panel">
              <h4>الخطوة 3: الوسائط والملفات</h4>
              <MediaUploadPanel
                value={wizard.mediaUpload}
                onChange={(mediaUpload) => update('mediaUpload', mediaUpload)}
                contentType={wizard.contentType}
              />
              <FieldValidationHint message={getFieldError(fieldErrors, 'mediaUpload')} />
            </div>
          )}

          {step === 3 && (
            <div className="wizard-panel">
              <h4>الخطوة 4: الجمهور ومكان الظهور</h4>
              <AgeTargetingPanel
                value={wizard.ageTargeting}
                onChange={(ageTargeting) => update('ageTargeting', ageTargeting)}
                contentType={wizard.contentType}
                section={placementSection}
              />
              <PlacementPicker
                value={wizard.placementId}
                onChange={(placementId) => update('placementId', placementId)}
              />
              <FieldValidationHint message={getFieldError(fieldErrors, 'placementId')} />
              <FieldValidationHint message={getFieldError(fieldErrors, 'ageTargeting')} />
              <label className="cms-field">
                الباقة المطلوبة
                <select
                  value={wizard.requiredPlan}
                  onChange={(e) => update('requiredPlan', e.target.value)}
                >
                  {contentWizardPlans.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cms-field">شروط الظهور</label>
              <p className="text-caption" style={{ marginTop: 0 }}>
                {targetingConditionOptions.map((opt) => (
                  <label key={opt.id} style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={wizard.conditions.includes(opt.label)}
                      onChange={() => toggleCondition(opt.label)}
                      style={{ marginLeft: 8 }}
                    />
                    {opt.label}
                  </label>
                ))}
              </p>
              {wizard.conditions.includes('تاريخ بداية ونهاية') && (
                <div className="grid-2" style={{ gap: 12 }}>
                  <label className="cms-field">
                    تاريخ البداية
                    <input
                      type="date"
                      value={wizard.dateStart}
                      onChange={(e) => update('dateStart', e.target.value)}
                    />
                  </label>
                  <label className="cms-field">
                    تاريخ النهاية
                    <input
                      type="date"
                      value={wizard.dateEnd}
                      onChange={(e) => update('dateEnd', e.target.value)}
                    />
                  </label>
                </div>
              )}
              <FieldValidationHint message={getFieldError(fieldErrors, 'conditions')} />
            </div>
          )}

          {step === 4 && (
            <div className="wizard-panel">
              <h4>الخطوة 5: المراجعة والنشر</h4>
              <label className="cms-field">
                حالة النشر
                <select
                  value={wizard.publishStatus}
                  onChange={(e) => update('publishStatus', e.target.value)}
                >
                  <option value="مسودة">مسودة</option>
                  <option value="يحتاج مراجعة">يحتاج مراجعة</option>
                  <option value="منشور">منشور</option>
                </select>
              </label>
              <FieldValidationHint message={getFieldError(fieldErrors, 'publishStatus')} />
              <ContentValidationPanel validation={validation} compact />
              <AdminCard className="content-wizard-review">
                <SectionHeader title="ملخص المعاينة" />
                <dl className="content-wizard-summary">
                  <div>
                    <dt>النوع</dt>
                    <dd>{wizard.contentType}</dd>
                  </div>
                  <div>
                    <dt>العنوان</dt>
                    <dd>{wizard.title || '—'}</dd>
                  </div>
                  <div>
                    <dt>الجمهور (عمر)</dt>
                    <dd>{ageTargetingShortLabel(wizard.ageTargeting)}</dd>
                  </div>
                  <div>
                    <dt>مكان الظهور</dt>
                    <dd>{placementPreview}</dd>
                  </div>
                  <div>
                    <dt>الوسائط</dt>
                    <dd>{mediaUploadSummary(wizard.mediaUpload)}</dd>
                  </div>
                  <div>
                    <dt>شروط الظهور</dt>
                    <dd>{showsWhen}</dd>
                  </div>
                  <div>
                    <dt>الحالة</dt>
                    <dd>
                      <StatusBadge tone={publishTone[wizard.publishStatus]}>
                        {wizard.publishStatus}
                      </StatusBadge>
                    </dd>
                  </div>
                </dl>
              </AdminCard>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                <MockActionButton action="save">حفظ مسودة</MockActionButton>
                <MockActionButton
                  action="check"
                  message="إرسال للمراجعة (UI فقط) — لم يُرسل لأي فريق"
                >
                  إرسال للمراجعة
                </MockActionButton>
                <MockActionButton action="publish">نشر</MockActionButton>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
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
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => s + 1)}
            >
              التالي
            </button>
          </div>
        </AdminCard>

        <AdminCard className="content-wizard-preview">
          <ContentValidationPanel validation={validation} />
          <SectionHeader title="معاينة حية" />
          <article>
            <p className="text-caption" style={{ marginTop: 0 }}>
              <StatusBadge tone="info">{wizard.contentType}</StatusBadge>
            </p>
            <h2 style={{ margin: '8px 0', fontSize: '1.15rem' }}>
              {wizard.title || 'عنوان المحتوى'}
            </h2>
            {wizard.subtitle && (
              <p style={{ margin: '0 0 8px', color: 'var(--on-surface-variant)' }}>
                {wizard.subtitle}
              </p>
            )}
            {wizard.shortDescription && (
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{wizard.shortDescription}</p>
            )}
            {wizard.mediaUpload?.coverImage && (
              <div className="content-wizard-preview__cover">
                [صورة mock: {mediaFileLabel(wizard.mediaUpload.coverImage)}]
              </div>
            )}
            {wizard.mediaUpload?.youtubeVideoId && (
              <p className="text-caption">
                ▶ YouTube: <code>{wizard.mediaUpload.youtubeVideoId}</code>
                {wizard.mediaUpload.duration ? ` · ${wizard.mediaUpload.duration}` : ''}
              </p>
            )}
            {wizard.body && (
              <div
                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem', marginTop: 12 }}
              >
                {wizard.body}
              </div>
            )}
            {tagList.length > 0 && (
              <p style={{ marginTop: 12, fontSize: '0.8rem' }}>
                {tagList.map((t) => (
                  <span key={t} className="page-header__chip" style={{ marginLeft: 6 }}>
                    #{t}
                  </span>
                ))}
              </p>
            )}
            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(196,181,253,0.35)' }} />
            <p className="text-caption">
              <strong>لـ:</strong> {ageTargetingShortLabel(wizard.ageTargeting)} ·{' '}
              <strong>باقة:</strong> {wizard.requiredPlan}
            </p>
            <p className="text-caption age-targeting-preview-inline">{agePreview}</p>
            <p className="text-caption age-targeting-preview-inline">{placementPreview}</p>
            <p className="text-caption">
              <strong>يظهر في:</strong> {placementPreview.replace('سيظهر في: ', '')}
            </p>
            <p className="text-caption">
              <strong>متى:</strong> {showsWhen}
            </p>
            <p className="text-caption">
              <strong>الحالة:</strong>{' '}
              <StatusBadge tone={publishTone[wizard.publishStatus]}>{wizard.publishStatus}</StatusBadge>
            </p>
          </article>
        </AdminCard>
      </div>
    </div>
  );
}
