import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'لا توجد بيانات',
  description,
  icon: Icon = Inbox,
  compact = false,
}) {
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <Icon size={compact ? 36 : 48} strokeWidth={1.5} className="empty-state__icon" />
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
    </div>
  );
}
