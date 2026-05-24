import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  applyBulkArchive,
  applyBulkSendReview,
  applyBulkStatusChange,
  countInventoryStats,
  createInitialInventory,
  filterInventory,
  getFileStatusTone,
  getPublishStatusTone,
  inventoryAgeOptions,
  inventoryBulkMessages,
  inventoryContentTypes,
  inventoryPublishOptions,
  inventorySections,
  searchInventory,
} from '../data/contentInventory';
import { reviewWorkflowStates } from '../data/contentReview';

const defaultFilters = {
  contentType: 'all',
  section: 'all',
  age: 'all',
  publishStatus: 'all',
  missingFilesOnly: false,
  needsReviewOnly: false,
};

function InventoryDetailPanel({ item }) {
  if (!item) {
    return (
      <EmptyState compact title="اختر عنصراً" description="انقر صفاً في الجدول لعرض التفاصيل." />
    );
  }

  return (
    <div className="content-inventory-detail">
      <div className="content-inventory-detail__head">
        <h3>{item.title}</h3>
        <StatusBadge tone={getPublishStatusTone(item.publishStatusId)}>{item.publishStatus}</StatusBadge>
      </div>
      <p className="text-caption">
        {item.contentType} · {item.section} · {item.ageLabel}
      </p>

      <SectionHeader title="ملخص" />
      <p className="content-inventory-detail__summary">{item.summary}</p>

      <dl className="content-inventory-detail__meta">
        <div>
          <dt>اللغة</dt>
          <dd>{item.language}</dd>
        </div>
        <div>
          <dt>حالة الملفات</dt>
          <dd>
            <StatusBadge tone={getFileStatusTone(item.fileStatus)}>{item.fileStatus}</StatusBadge>
          </dd>
        </div>
        <div>
          <dt>مكان الظهور</dt>
          <dd>{item.placement || '—'}</dd>
        </div>
        <div>
          <dt>آخر تعديل</dt>
          <dd>{item.lastModified}</dd>
        </div>
        <div>
          <dt>المسؤول</dt>
          <dd>{item.owner}</dd>
        </div>
      </dl>

      {item.missingFiles && (
        <InfoBanner tone="warning">ناقص ملفات — PNG/mp3/YouTube embed يحتاج إكمال.</InfoBanner>
      )}
      {item.needsReview && !item.missingFiles && (
        <InfoBanner tone="info">يحتاج مراجعة — بانتظار Content Manager.</InfoBanner>
      )}

      <Link to={item.editorPath} className="mock-btn mock-btn--outline" style={{ marginTop: 12, textDecoration: 'none' }}>
        فتح المحرر
      </Link>
    </div>
  );
}

export function ContentInventoryPage() {
  const { showMock } = useSnackbar();
  const [items, setItems] = useState(() => createInitialInventory());
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('review');

  const filtered = useMemo(() => {
    const afterFilters = filterInventory(items, filters);
    return searchInventory(afterFilters, search);
  }, [items, filters, search]);

  const stats = useMemo(() => countInventoryStats(items), [items]);
  const selected = filtered.find((i) => i.id === selectedId) ?? items.find((i) => i.id === selectedId) ?? null;

  const patchFilter = (partial) => setFilters((f) => ({ ...f, ...partial }));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.id));
    }
  };

  const runBulk = (action) => {
    if (selectedIds.length === 0) {
      showMock('حدّد صفاً واحداً على الأقل (mock)');
      return;
    }
    if (action === 'status') {
      setItems((prev) => applyBulkStatusChange(prev, selectedIds, bulkStatus));
      showMock(inventoryBulkMessages.changeStatus);
    } else if (action === 'review') {
      setItems((prev) => applyBulkSendReview(prev, selectedIds));
      showMock(inventoryBulkMessages.sendReview);
    } else if (action === 'archive') {
      setItems((prev) => applyBulkArchive(prev, selectedIds));
      showMock(inventoryBulkMessages.archive);
    } else if (action === 'export') {
      showMock(`${inventoryBulkMessages.exportCsv} — ${selectedIds.length} صف`);
    }
    setSelectedIds([]);
  };

  return (
    <div className="page-stack content-entry-page content-inventory-page">
      <PageHeader title="فهرس المحتوى" extraBadges={['Inventory', 'Search']} />

      <InfoBanner tone="warning">
        UI فقط — فهرس شامل لكل المحتوى القابل للإدخال. بحث وفلاتر محلية · لا حفظ · لا Backend.
      </InfoBanner>

      <div className="grid-4">
        <StatCard label="إجمالي العناصر" value={String(stats.total)} />
        <StatCard label="ناقص ملفات" value={String(stats.missingFiles)} />
        <StatCard label="يحتاج مراجعة" value={String(stats.needsReview)} />
        <StatCard label="منشور" value={String(stats.published)} />
      </div>

      <AdminCard>
        <SectionHeader title="بحث وفلاتر" />
        <div className="filters-row">
          <input
            type="search"
            placeholder="بحث محلي — عنوان، قسم، مسؤول…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 220px', minWidth: 200 }}
          />
          <select value={filters.contentType} onChange={(e) => patchFilter({ contentType: e.target.value })}>
            {inventoryContentTypes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={filters.section} onChange={(e) => patchFilter({ section: e.target.value })}>
            {inventorySections.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={filters.age} onChange={(e) => patchFilter({ age: e.target.value })}>
            {inventoryAgeOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={filters.publishStatus} onChange={(e) => patchFilter({ publishStatus: e.target.value })}>
            {inventoryPublishOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="content-inventory-toggles">
          <label className="activity-exercise-checkbox">
            <input
              type="checkbox"
              checked={filters.missingFilesOnly}
              onChange={(e) => patchFilter({ missingFilesOnly: e.target.checked })}
            />
            ناقص ملفات فقط
          </label>
          <label className="activity-exercise-checkbox">
            <input
              type="checkbox"
              checked={filters.needsReviewOnly}
              onChange={(e) => patchFilter({ needsReviewOnly: e.target.checked })}
            />
            يحتاج مراجعة فقط
          </label>
          <button
            type="button"
            className="mock-btn mock-btn--outline"
            onClick={() => {
              setFilters(defaultFilters);
              setSearch('');
            }}
          >
            إعادة ضبط
          </button>
        </div>
        <p className="text-caption">{filtered.length} عنصر بعد الفلترة</p>
      </AdminCard>

      <AdminCard>
        <SectionHeader title="إجراءات جماعية (mock)" />
        <div className="content-inventory-bulk">
          <span className="text-caption">محدّد: {selectedIds.length}</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            {reviewWorkflowStates.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <MockActionButton action="save" message={inventoryBulkMessages.changeStatus} onClick={() => runBulk('status')}>
            تغيير الحالة
          </MockActionButton>
          <MockActionButton action="check" message={inventoryBulkMessages.sendReview} onClick={() => runBulk('review')}>
            إرسال للمراجعة
          </MockActionButton>
          <MockActionButton variant="outline" action="delete" message={inventoryBulkMessages.archive} onClick={() => runBulk('archive')}>
            أرشفة
          </MockActionButton>
          <MockActionButton variant="outline" action="export" message={inventoryBulkMessages.exportCsv} onClick={() => runBulk('export')}>
            تصدير CSV
          </MockActionButton>
        </div>
      </AdminCard>

      <div className="grid-2 content-inventory-page__layout">
        <AdminCard>
          <SectionHeader title="جدول فهرس المحتوى" />
          {filtered.length === 0 ? (
            <EmptyState
              compact
              title="لا توجد نتائج بحث"
              description="لا يوجد محتوى يطابق الفلاتر — جرّب «ناقص ملفات» أو أعد ضبط البحث."
            />
          ) : (
            <AdminTableContainer style={{ maxHeight: 520 }}>
              <table className="admin-table admin-table--compact admin-table--cards content-inventory-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={toggleSelectAll}
                        aria-label="تحديد الكل"
                      />
                    </th>
                    <th>العنوان</th>
                    <th>النوع</th>
                    <th>القسم</th>
                    <th>العمر</th>
                    <th>اللغة</th>
                    <th>حالة النشر</th>
                    <th>حالة الملفات</th>
                    <th>آخر تعديل</th>
                    <th>المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={selectedId === item.id ? 'selected' : ''}
                      onClick={() => setSelectedId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td data-label="" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          aria-label={`تحديد ${item.title}`}
                        />
                      </td>
                      <td data-label="العنوان" className="content-entry-text-clamp">{item.title}</td>
                      <td data-label="النوع">{item.contentType}</td>
                      <td data-label="القسم">{item.section}</td>
                      <td data-label="العمر">{item.ageLabel}</td>
                      <td data-label="اللغة">{item.language}</td>
                      <td data-label="حالة النشر">
                        <StatusBadge tone={getPublishStatusTone(item.publishStatusId)}>
                          {item.publishStatus}
                        </StatusBadge>
                      </td>
                      <td data-label="حالة الملفات">
                        <StatusBadge tone={getFileStatusTone(item.fileStatus)}>{item.fileStatus}</StatusBadge>
                      </td>
                      <td data-label="آخر تعديل" style={{ fontSize: '0.78rem' }}>{item.lastModified}</td>
                      <td data-label="المسؤول">{item.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableContainer>
          )}
        </AdminCard>

        <AdminCard className="content-inventory-page__detail">
          <SectionHeader title="Detail panel" />
          <InventoryDetailPanel item={selected} />
        </AdminCard>
      </div>
    </div>
  );
}
