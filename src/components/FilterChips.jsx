import { publishFilterChips } from '../data/mockData';

export function FilterChips({ value, onChange, chips = publishFilterChips }) {
  return (
    <div className="filter-chips" role="group" aria-label="فلاتر الحالة">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className={`filter-chip${value === chip.id ? ' filter-chip--active' : ''}`}
          onClick={() => onChange(chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
