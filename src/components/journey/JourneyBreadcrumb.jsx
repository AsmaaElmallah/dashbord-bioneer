import { ChevronLeft } from 'lucide-react';

export function JourneyBreadcrumb({ items, onNavigate }) {
  if (!items?.length) return null;

  return (
    <nav className="journey-breadcrumb" aria-label="مسار التنقل">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.id} className="journey-breadcrumb__segment">
            {index > 0 && (
              <ChevronLeft size={14} className="journey-breadcrumb__sep" aria-hidden />
            )}
            {isLast ? (
              <span className="journey-breadcrumb__current">{item.label}</span>
            ) : (
              <button
                type="button"
                className="journey-breadcrumb__link"
                onClick={() => onNavigate?.(item)}
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
