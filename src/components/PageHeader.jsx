export function PageHeader({ title, badge = null, extraBadges = [] }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="page-header__badges">
        {extraBadges.map((t) => (
          <span key={t} className="page-header__chip">
            {t}
          </span>
        ))}
        {badge && <span className="ui-only-badge">{badge}</span>}
      </div>
    </div>
  );
}
