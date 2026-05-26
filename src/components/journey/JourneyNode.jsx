import { CheckCircle2, Gift, Lock, Play, Star, Unlock } from 'lucide-react';

export function JourneyNode({
  label,
  subtitle,
  speechBubble,
  isDone,
  isActive,
  isLocked,
  isAdminOpen,
  isBonus,
  onClick,
  disabled,
}) {
  const canClick = onClick && !disabled && (!isLocked || isAdminOpen);

  let circleClass = 'journey-node__circle';
  if (isDone) circleClass += ' journey-node__circle--done';
  else if (isActive) circleClass += ' journey-node__circle--active';
  else if (isAdminOpen) circleClass += ' journey-node__circle--open';
  else if (isBonus) circleClass += ' journey-node__circle--bonus';
  else circleClass += ' journey-node__circle--locked';

  return (
    <div className="journey-node">
      {speechBubble && isActive && <div className="journey-node__bubble">{speechBubble}</div>}
      <button
        type="button"
        className={circleClass}
        onClick={canClick ? onClick : undefined}
        disabled={!canClick}
        aria-label={label}
      >
        {isDone && <CheckCircle2 size={36} strokeWidth={2} />}
        {isActive && <Play size={40} strokeWidth={2} fill="currentColor" />}
        {!isDone && !isActive && isAdminOpen && <Unlock size={30} strokeWidth={2} />}
        {!isDone && !isActive && !isAdminOpen && isBonus && (isLocked ? <Lock size={32} /> : <Gift size={32} />)}
        {!isDone && !isActive && !isAdminOpen && !isBonus && (isLocked ? <Lock size={32} /> : <Star size={32} />)}
        {isActive && <span className="journey-node__ring" aria-hidden />}
      </button>
      <p className="journey-node__label">{label}</p>
      {subtitle && <p className="journey-node__subtitle">{subtitle}</p>}
    </div>
  );
}
