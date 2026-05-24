const map = { success: 'success', warning: 'warning', error: 'error', info: 'info', muted: 'muted' };

export function StatusBadge({ children, tone = 'info' }) {
  return <span className={`status-badge status-badge--${map[tone] || 'info'}`}>{children}</span>;
}
