export function AdminCard({ children, className = '', style }) {
  return (
    <div className={`admin-card ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
