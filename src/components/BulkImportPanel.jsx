import { FileSpreadsheet, Layers, ListVideo, Music, Package, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { AdminCard } from './AdminCard';
import { AdminTableContainer } from './AdminTableContainer';
import { BulkImportDropzone } from './BulkImportDropzone';
import { InfoBanner } from './InfoBanner';
import { MockActionButton } from './MockActionButton';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  bulkImportMessages,
  bulkImportTypes,
  createMockBulkFile,
  getBulkImportType,
  getCsvTemplateColumns,
  getMockScanResult,
} from '../data/bulkImport';

const typeIcons = {
  pptx_slides: Layers,
  images_audio: Package,
  csv_questions: FileSpreadsheet,
  csv_youtube: ListVideo,
  quran_mp3: ScrollText,
  manifest_json: Music,
};

function MappingPreview({ scan }) {
  return (
    <AdminCard className="bulk-import-mapping">
      <SectionHeader title="معاينة الربط (mapping)" />
      <p className="text-caption">
        ملف: <code>{scan.fileName}</code> · نوع: {scan.typeLabel}
      </p>
      <div className="grid-4" style={{ marginTop: 12 }}>
        <StatCard label="عدد الصفوف (mock)" value={String(scan.rowCount)} />
        <StatCard label="عناصر صحيحة" value={String(scan.validCount)} />
        <StatCard label="تحتاج مراجعة" value={String(scan.reviewCount)} />
        <StatCard label="أعمدة" value={String(scan.columns.length)} />
      </div>

      <SectionHeader title="الأعمدة المكتشفة" />
      <p className="bulk-import-columns">
        {scan.columns.map((col) => (
          <StatusBadge key={col} tone="info">
            {col}
          </StatusBadge>
        ))}
      </p>

      <SectionHeader title="عينة صفوف (mock)" />
      <AdminTableContainer>
        <table className="admin-table bulk-import-sample-table">
          <thead>
            <tr>
              {scan.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scan.sampleRows.map((row, i) => (
              <tr key={i}>
                {scan.columns.map((col) => (
                  <td key={col}>{row[col] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableContainer>
    </AdminCard>
  );
}

function ValidationTable({ issues }) {
  return (
    <AdminCard>
      <SectionHeader title="جدول التحقق" />
      <AdminTableContainer>
        <table className="admin-table bulk-import-validation-table">
          <thead>
            <tr>
              <th>صف</th>
              <th>حقل</th>
              <th>المشكلة</th>
              <th>الاقتراح</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={`${issue.row}-${issue.field}`}>
                <td>{issue.row}</td>
                <td>
                  <code>{issue.field}</code>
                </td>
                <td>{issue.problem}</td>
                <td className="bulk-import-validation-table__suggestion">{issue.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableContainer>
    </AdminCard>
  );
}

export function BulkImportPanel({ initialTypeId = 'csv_questions' }) {
  const { showMock } = useSnackbar();
  const [typeId, setTypeId] = useState(initialTypeId);
  const [file, setFile] = useState(null);
  const [scan, setScan] = useState(null);

  const type = getBulkImportType(typeId);
  const Icon = typeIcons[typeId] ?? FileSpreadsheet;

  const selectType = (nextTypeId) => {
    setTypeId(nextTypeId);
    setFile(null);
    setScan(null);
  };

  const pickFile = () => {
    setFile(createMockBulkFile(typeId));
    setScan(null);
    showMock(bulkImportMessages.pickFile);
  };

  const runScan = () => {
    if (!file) {
      setFile(createMockBulkFile(typeId));
    }
    setScan(getMockScanResult(typeId));
    showMock(bulkImportMessages.scan);
  };

  const runImport = () => {
    if (!scan) {
      runScan();
    }
    showMock(bulkImportMessages.import);
  };

  const downloadTemplate = () => {
    const cols = getCsvTemplateColumns(typeId);
    showMock(cols ? `قالب CSV (mock): ${cols}` : bulkImportMessages.downloadTemplate);
  };

  return (
    <div className="bulk-import-panel">
      <InfoBanner tone="info">
        استيراد جماعي — UI mock فقط. لا رفع ملفات، لا قراءة CSV، لا Backend.
      </InfoBanner>

      <AdminCard>
        <SectionHeader title="نوع الاستيراد" />
        <div className="bulk-import-type-grid">
          {bulkImportTypes.map((t) => {
            const TypeIcon = typeIcons[t.id] ?? FileSpreadsheet;
            return (
              <button
                key={t.id}
                type="button"
                className={`bulk-import-type-card${typeId === t.id ? ' bulk-import-type-card--active' : ''}`}
                onClick={() => selectType(t.id)}
              >
                <TypeIcon size={22} />
                <strong>{t.label}</strong>
                <span className="text-caption">{t.description}</span>
              </button>
            );
          })}
        </div>
      </AdminCard>

      <div className="grid-2 bulk-import-panel__main">
        <AdminCard>
          <SectionHeader title={type.label} />
          <p className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={16} /> {type.description}
          </p>
          <BulkImportDropzone
            label={`ملف ${type.acceptLabel}`}
            acceptLabel={type.acceptLabel}
            file={file}
            onPick={pickFile}
            onClear={() => {
              setFile(null);
              setScan(null);
            }}
          />
          <div className="bulk-import-actions">
            <MockActionButton action="check" message={bulkImportMessages.scan} onClick={runScan}>
              فحص الملف
            </MockActionButton>
            <MockActionButton action="save" message={bulkImportMessages.import} onClick={runImport}>
              استيراد كمسودات
            </MockActionButton>
            {type.hasTemplate && (
              <MockActionButton
                variant="outline"
                action="export"
                message={bulkImportMessages.downloadTemplate}
                onClick={downloadTemplate}
              >
                تحميل قالب CSV
              </MockActionButton>
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader title="الخطوات" />
          <ol className="bulk-import-steps">
            <li>اختر نوع الاستيراد</li>
            <li>اسحب ملفاً mock أو اضغط «اختر ملف»</li>
            <li>اضغط «فحص الملف» لعرض mapping والتحقق</li>
            <li>«استيراد كمسودات» يضيف العناصر لـ <strong>مراجعة المحتوى</strong></li>
          </ol>
          {!scan && typeId === 'csv_questions' && (
            <InfoBanner tone="warning">
              مثال: CSV أسئلة — 48 صفاً mock، 4 صفوف تحتاج مراجعة بعد الفحص.
            </InfoBanner>
          )}
        </AdminCard>
      </div>

      {scan && (
        <>
          <MappingPreview scan={scan} />
          <ValidationTable issues={scan.issues} />
        </>
      )}
    </div>
  );
}
