import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import {
  applyReviewAction,
  buildReviewChecks,
  createInitialReviewQueue,
  getReviewStateMeta,
  reviewActionMessages,
  reviewWorkflowStates,
} from '../data/contentReview';

const viewModes = [
  ['board', 'Board'],
  ['table', 'جدول'],
];

function ReviewDetailPanel({ item, onAction }) {
  if (!item) {
    return (
      <EmptyState compact title="اختر عنصراً" description="انقر بطاقة أو صفاً لعرض التفاصيل." />
    );
  }

  const state = getReviewStateMeta(item.status);
  const checks = buildReviewChecks(item);

  return (
    <div className="content-review-detail">
      <div className="content-review-detail__head">
        <h3>{item.title}</h3>
        <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
      </div>
      <p className="text-caption">
        {item.contentType} · {item.section} · {item.ageLabel}
      </p>

      <SectionHeader title="ملخص المحتوى" />
      <p className="content-review-detail__summary">{item.summary}</p>

      <SectionHeader title="سبب المراجعة" />
      <p className="content-review-detail__reason">{item.reviewReason || '—'}</p>

      <SectionHeader title="قائمة الفحوصات" />
      <ul className="content-review-checks">
        {checks.map((c) => (
          <li key={c.id} className={c.ok ? 'content-review-checks__ok' : 'content-review-checks__fail'}>
            {c.ok ? <Check size={14} /> : <X size={14} />}
            {c.label}
          </li>
        ))}
      </ul>

      {item.notes && (
        <>
          <SectionHeader title="ملاحظات" />
          <p className="text-caption">{item.notes}</p>
        </>
      )}

      <p className="text-caption">
        المراجع: {item.reviewer} · آخر تعديل: {item.lastModified}
      </p>

      <div className="content-review-detail__actions">
        <MockActionButton action="check" message={reviewActionMessages.approve} onClick={() => onAction('approve')}>
          اعتماد
        </MockActionButton>
        <MockActionButton
          variant="outline"
          action="save"
          message={reviewActionMessages.request_edit}
          onClick={() => onAction('request_edit')}
        >
          طلب تعديل
        </MockActionButton>
        <MockActionButton action="publish" message={reviewActionMessages.publish} onClick={() => onAction('publish')}>
          نشر
        </MockActionButton>
        <MockActionButton
          variant="outline"
          action="delete"
          message={reviewActionMessages.archive}
          onClick={() => onAction('archive')}
        >
          أرشفة
        </MockActionButton>
      </div>
    </div>
  );
}

function ReviewBoard({ items, selectedId, onSelect }) {
  return (
    <div className="review-board">
      {reviewWorkflowStates.map((state) => {
        const columnItems = items.filter((i) => i.status === state.id);
        return (
          <div key={state.id} className="review-board__column">
            <p className="review-board__title">
              {state.label}
              <span className="review-board__count">{columnItems.length}</span>
            </p>
            {columnItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ticket-board__card${selectedId === item.id ? ' ticket-board__card--selected' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <strong>{item.title}</strong>
                <span className="text-caption">
                  {item.contentType} · {item.section}
                </span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ReviewTable({ items, selectedId, onSelect, statusFilter, onStatusFilter }) {
  const filtered =
    statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter);

  return (
    <>
      <div className="filters-row" style={{ marginBottom: 12 }}>
        <select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          {reviewWorkflowStates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <AdminTableContainer style={{ maxHeight: 420 }}>
        {filtered.length === 0 ? (
          <EmptyState
            compact
            title="لا توجد نتائج"
            description="لا عناصر بهذه الحالة — غيّر فلتر الحالة أو ارجع للـ Board."
          />
        ) : (
        <table className="admin-table admin-table--compact admin-table--cards content-review-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>النوع</th>
              <th>القسم</th>
              <th>العمر</th>
              <th>آخر تعديل</th>
              <th>المراجع</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const state = getReviewStateMeta(item.status);
              return (
                <tr
                  key={item.id}
                  className={selectedId === item.id ? 'selected' : ''}
                  onClick={() => onSelect(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td data-label="العنوان" className="content-entry-text-clamp">{item.title}</td>
                  <td data-label="النوع">{item.contentType}</td>
                  <td data-label="القسم">{item.section}</td>
                  <td data-label="العمر">{item.ageLabel}</td>
                  <td data-label="آخر تعديل" style={{ fontSize: '0.78rem' }}>{item.lastModified}</td>
                  <td data-label="المراجع">{item.reviewer}</td>
                  <td data-label="الحالة">
                    <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
                  </td>
                  <td data-label="ملاحظات" className="content-entry-text-clamp" style={{ fontSize: '0.78rem' }}>
                    {item.notes || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </AdminTableContainer>
    </>
  );
}

export function ContentReviewPage() {
  const [items, setItems] = useState(() => createInitialReviewQueue());
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const [viewMode, setViewMode] = useState('board');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showMock } = useSnackbar();

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const map = {};
    reviewWorkflowStates.forEach((s) => {
      map[s.id] = items.filter((i) => i.status === s.id).length;
    });
    return map;
  }, [items]);

  const handleAction = (action) => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selected.id ? applyReviewAction(i, action) : i)),
    );
    showMock(reviewActionMessages[action]);
  };

  return (
    <div className="page-stack content-review-page content-entry-page">
      <PageHeader title="مراجعة المحتوى" extraBadges={['Workflow']} />

      <div className="review-state-chips">
        {reviewWorkflowStates.map((s) => (
          <StatusBadge key={s.id} tone={s.tone}>
            {s.label}: {counts[s.id] ?? 0}
          </StatusBadge>
        ))}
      </div>

      <div className="tabs">
        {viewModes.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${viewMode === id ? 'active' : ''}`}
            onClick={() => setViewMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid-2 content-review-page__layout">
        <AdminCard>
          {viewMode === 'board' ? (
            <>
              <SectionHeader title="Board — حالات النشر" />
              <ReviewBoard items={items} selectedId={selectedId} onSelect={setSelectedId} />
            </>
          ) : (
            <>
              <SectionHeader title="جدول عناصر المراجعة" />
              <ReviewTable
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
              />
            </>
          )}
        </AdminCard>

        <AdminCard className="content-review-page__detail">
          <SectionHeader title="Detail panel" />
          <ReviewDetailPanel item={selected} onAction={handleAction} />
        </AdminCard>
      </div>
    </div>
  );
}
