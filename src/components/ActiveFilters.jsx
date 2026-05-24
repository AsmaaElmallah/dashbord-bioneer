export function ActiveFilters({ items, onClearAll }) {
  if (!items?.length) return null;

  return (
    <div className="active-filters">
      <span className="active-filters__label">فلاتر نشطة:</span>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="active-filters__tag"
          onClick={item.onRemove}
          title="إزالة الفلتر"
        >
          {item.label}
          <span aria-hidden> ×</span>
        </button>
      ))}
      {onClearAll && (
        <button type="button" className="active-filters__clear" onClick={onClearAll}>
          مسح الكل
        </button>
      )}
    </div>
  );
}
