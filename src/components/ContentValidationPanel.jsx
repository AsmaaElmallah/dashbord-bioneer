import { Check, X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';

export function FieldValidationHint({ message }) {
  if (!message) return null;
  return <p className="field-validation-hint">{message}</p>;
}

export function ContentValidationPanel({ validation, compact }) {
  if (!validation) return null;

  const { checks, statusMeta, passedCount, totalCount } = validation;

  return (
    <div className={`content-validation-panel${compact ? ' content-validation-panel--compact' : ''}`}>
      {!compact && <SectionHeader title="ContentValidationPanel" />}
      <div className="content-validation-panel__head">
        <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        <span className="text-caption">
          {passedCount}/{totalCount} فحص
        </span>
      </div>
      <ul className="content-validation-checklist">
        {checks.map((check) => (
          <li
            key={check.id}
            className={
              check.ok ? 'content-validation-checklist__ok' : 'content-validation-checklist__fail'
            }
          >
            {check.ok ? <Check size={14} /> : <X size={14} />}
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
