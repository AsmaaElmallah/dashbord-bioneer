import { AlertTriangle, Info } from 'lucide-react';

export function InfoBanner({ children, tone = 'info' }) {
  const isWarning = tone === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;
  return (
    <div className={`info-banner ${isWarning ? 'warning-banner' : ''}`}>
      <Icon size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{children}</div>
    </div>
  );
}
