export function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
