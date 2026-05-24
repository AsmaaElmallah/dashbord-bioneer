import { Loader2 } from 'lucide-react';

export function MockLoading({ label = 'جاري التحميل… (mock)' }) {
  return (
    <div className="mock-loading" role="status" aria-live="polite">
      <Loader2 size={40} strokeWidth={1.5} className="mock-loading__icon" />
      <p className="mock-loading__label">{label}</p>
    </div>
  );
}
