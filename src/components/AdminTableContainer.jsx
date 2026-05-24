export function AdminTableContainer({ children, className = '' }) {
  return <div className={`admin-table-wrap ${className}`.trim()}>{children}</div>;
}
