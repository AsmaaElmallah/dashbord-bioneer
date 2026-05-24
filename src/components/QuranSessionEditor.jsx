import { Clock, ScrollText, Upload, Users, Volume2, X } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  audioFileLabel,
  buildAudioPathMock,
  buildKhatmahPlanRows,
  buildSessionTitle,
  getKhatmahPlanSummary,
  getQuranSessionValidation,
  getReciterOptions,
  halfHizbOptions,
  quranSessionFileStatusOptions,
  sessionFromPlan,
} from '../data/quranSessionEditor';
import { mockFileFromInput } from '../utils/mediaUpload';

const fileStatusTone = {
  موجود: 'success',
  ناقص: 'error',
  'يحتاج مراجعة': 'warning',
};

function MockAudioPick({ file, onPick }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const pick = (fileList) => {
    if (!fileList?.[0]) return;
    onPick(mockFileFromInput(fileList[0]));
    showMock('اختيار mp3 (UI فقط) — لا upload');
  };

  return (
    <div className="quran-session-file-pick">
      <span className="quran-session-file-pick__label">ملف الصوت (mock upload)</span>
      {file ? (
        <p className="quran-session-file-pick__name">
          {audioFileLabel(file)} · {file.sizeMock}
          <StatusBadge tone="warning">لم يُرفع</StatusBadge>
          <button type="button" className="media-dropzone__remove" onClick={() => onPick(null)}>
            <X size={14} />
          </button>
        </p>
      ) : (
        <p className="text-caption">لم يُختَر mp3</p>
      )}
      <button type="button" className="mock-btn mock-btn--outline" onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> اختر mp3
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3"
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function QuranSessionPreview({ session }) {
  const reciters = getReciterOptions();
  const reciter = reciters.find((r) => r.id === session.reciterId);
  const title = buildSessionTitle(session.sessionNumber);
  const audioPath = buildAudioPathMock(session.reciterId, session.sessionNumber);

  return (
    <div className="quran-session-preview" dir="rtl">
      <div className="quran-session-preview__head">
        <ScrollText size={22} color="var(--track-quran)" />
        <h3 className="quran-session-preview__title">{title}</h3>
      </div>
      <div className="quran-session-preview__meta">
        <StatusBadge tone="info">ختمة {session.khatmahNumber}</StatusBadge>
        <StatusBadge tone="info">جلسة {session.sessionNumber}</StatusBadge>
        <StatusBadge tone={fileStatusTone[session.fileStatus]}>{session.fileStatus}</StatusBadge>
      </div>
      <p className="quran-session-preview__range">
        <strong>الآيات:</strong> {session.rangeStart} → {session.rangeEnd}
      </p>
      <p className="quran-session-preview__reciter">
        <strong>القارئ:</strong> {reciter?.label ?? session.reciterId}
      </p>
      <div className="quran-session-preview__duration">
        <Clock size={16} />
        <span>مدة الاستماع: ~{session.durationMinutes} دقيقة</span>
      </div>
      <div className="quran-session-preview__audio">
        <Volume2 size={16} />
        <code>{audioPath}</code>
      </div>
      <InfoBanner tone="info" style={{ marginTop: 12 }}>
        <Users size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
        يظهر لـ <strong>كل الأطفال</strong> حسب خطة القرآن العمرية (mock — لا تشغيل صوت).
      </InfoBanner>
    </div>
  );
}

function KhatmahPlanTable({ khatmahNumber, activeSession, onSelectSession }) {
  const rows = useMemo(() => buildKhatmahPlanRows(khatmahNumber), [khatmahNumber]);
  const summary = getKhatmahPlanSummary(khatmahNumber);

  return (
    <AdminCard className="quran-session-plan">
      <SectionHeader title={`خطة الختمة — ${khatmahNumber}`} />
      <p className="text-caption" style={{ marginTop: 0 }}>
        {summary.dailySessions} جلسات/يوم · ~{summary.daysToFinish} يوم · {summary.note}
      </p>
      <AdminTableContainer className="quran-session-plan__scroll">
        <table className="admin-table admin-table--compact quran-session-plan__table">
          <thead>
            <tr>
              <th>جلسة</th>
              <th>حزب</th>
              <th>نصف</th>
              <th>يوم</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.sessionNumber}
                className={activeSession === row.sessionNumber ? 'selected' : ''}
                onClick={() => onSelectSession(row.sessionNumber)}
                style={{ cursor: 'pointer' }}
                title={row.title}
              >
                <td>{row.sessionNumber}</td>
                <td>{row.hizbNumber}</td>
                <td>{row.halfLabel}</td>
                <td>
                  {row.dayIndex}
                  <span className="text-caption"> ({row.sessionInDay}/{row.dailySessions})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableContainer>
      <p className="text-caption" style={{ marginTop: 8 }}>
        120 جلسة — انقر صفاً لتحميل الجلسة في المحرر.
      </p>
    </AdminCard>
  );
}

export function QuranSessionEditor({ value, onChange }) {
  const session = value;
  const validation = getQuranSessionValidation(session);
  const reciters = getReciterOptions();

  const patch = (partial) => onChange({ ...session, ...partial });

  const syncFromSessionNumber = (sessionNumber) => {
    const hizb = Math.floor((sessionNumber + 1) / 2);
    const half = sessionNumber % 2 === 1 ? 1 : 2;
    const fromPlan = sessionFromPlan(session.khatmahNumber, sessionNumber);
    onChange({
      ...session,
      sessionNumber,
      hizbNumber: hizb,
      halfHizb: half,
      rangeStart: fromPlan.rangeStart,
      rangeEnd: fromPlan.rangeEnd,
      durationMinutes: fromPlan.durationMinutes,
      fileSizeMb: fromPlan.fileSizeMb,
    });
  };

  const handleKhatmahChange = (khatmahNumber) => {
    patch({ khatmahNumber: Number(khatmahNumber) || 1 });
  };

  const handlePlanSelect = (sessionNumber) => {
    onChange(sessionFromPlan(session.khatmahNumber, sessionNumber));
  };

  return (
    <div className="quran-session-editor">
      <InfoBanner tone="info">
        QuranSessionEditor UI فقط — لا manifest، لا رفع mp3 حقيقي، لا تشغيل صوت.
      </InfoBanner>

      <div className="grid-2 quran-session-editor__layout">
        <div className="quran-session-editor__main">
          <AdminCard>
            <SectionHeader title="تعريف الجلسة" />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                رقم الختمة
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={session.khatmahNumber}
                  onChange={(e) => handleKhatmahChange(e.target.value)}
                />
              </label>
              <label className="cms-field">
                رقم الجلسة (1–120)
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={session.sessionNumber}
                  onChange={(e) => syncFromSessionNumber(Number(e.target.value) || 1)}
                />
              </label>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                رقم الحزب
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={session.hizbNumber}
                  onChange={(e) => patch({ hizbNumber: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="cms-field">
                نصف الحزب
                <select
                  value={session.halfHizb}
                  onChange={(e) => patch({ halfHizb: Number(e.target.value) })}
                >
                  {halfHizbOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                rangeStart
                <input
                  type="text"
                  value={session.rangeStart}
                  onChange={(e) => patch({ rangeStart: e.target.value })}
                  placeholder="1:1"
                />
              </label>
              <label className="cms-field">
                rangeEnd
                <input
                  type="text"
                  value={session.rangeEnd}
                  onChange={(e) => patch({ rangeEnd: e.target.value })}
                  placeholder="2:31"
                />
              </label>
            </div>
            <label className="cms-field">
              القارئ
              <select value={session.reciterId} onChange={(e) => patch({ reciterId: e.target.value })}>
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                    {r.active ? ' (نشط)' : ''}
                  </option>
                ))}
              </select>
            </label>
          </AdminCard>

          <AdminCard>
            <SectionHeader title="ملف الصوت والمدة" />
            <MockAudioPick
              file={session.audioFile}
              onPick={(audioFile) =>
                patch({
                  audioFile,
                  fileStatus: audioFile ? 'يحتاج مراجعة' : 'ناقص',
                  fileSizeMb: audioFile?.sizeMock?.replace(' MB', '') ?? session.fileSizeMb,
                })
              }
            />
            <div className="grid-2" style={{ gap: 12 }}>
              <label className="cms-field">
                مدة الجلسة (دقيقة)
                <input
                  type="number"
                  min="1"
                  value={session.durationMinutes}
                  onChange={(e) => patch({ durationMinutes: Number(e.target.value) || '' })}
                />
              </label>
              <label className="cms-field">
                حجم الملف (mock MB)
                <input
                  type="text"
                  value={session.fileSizeMb}
                  onChange={(e) => patch({ fileSizeMb: e.target.value })}
                  placeholder="4.83"
                />
              </label>
            </div>
            <label className="cms-field">
              حالة الملف
              <select value={session.fileStatus} onChange={(e) => patch({ fileStatus: e.target.value })}>
                {quranSessionFileStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="cms-field">
              ملاحظات المراجعة
              <textarea
                rows={3}
                value={session.reviewNotes}
                onChange={(e) => patch({ reviewNotes: e.target.value })}
                placeholder="مثال: mp3 غير موجود في assets"
              />
            </label>
          </AdminCard>

          {validation.length > 0 && (
            <div className="quran-session-validation">
              {validation.map((v) => (
                <InfoBanner key={v.id} tone={v.severity === 'error' ? 'warning' : 'info'}>
                  {v.message}
                </InfoBanner>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MockActionButton action="save">حفظ جلسة</MockActionButton>
            <MockActionButton action="check" message="إرسال للمراجعة (UI فقط)">
              إرسال للمراجعة
            </MockActionButton>
            <MockActionButton
              action="delete"
              message="تحديد كناقص (UI فقط)"
              onClick={() =>
                patch({
                  audioFile: null,
                  fileStatus: 'ناقص',
                  reviewNotes: session.reviewNotes || 'تم التحديد كناقص — mp3 غير متوفر.',
                })
              }
            >
              تحديد كناقص
            </MockActionButton>
          </div>
        </div>

        <div className="quran-session-editor__side">
          <AdminCard className="quran-session-editor__preview-wrap">
            <SectionHeader title="معاينة الجلسة" />
            <QuranSessionPreview session={session} />
          </AdminCard>

          <KhatmahPlanTable
            khatmahNumber={session.khatmahNumber}
            activeSession={session.sessionNumber}
            onSelectSession={handlePlanSelect}
          />
        </div>
      </div>
    </div>
  );
}
