import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildGlobalSearchResults } from '../data/mockData';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => buildGlobalSearchResults(query), [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const goSearchPage = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  return (
    <div className="global-search" ref={wrapRef}>
      <input
        className="admin-topbar__search"
        placeholder="ابحث عن طفل، محتوى، شكوى، درس..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goSearchPage();
          if (e.key === 'Escape') setOpen(false);
        }}
        aria-label="بحث شامل"
        aria-expanded={open && !!query.trim()}
        aria-haspopup="listbox"
      />
      {open && query.trim() && (
        <div className="global-search__dropdown" role="listbox">
          {results.length === 0 ? (
            <p className="global-search__empty">لا نتائج mock — جرّبي كلمات مثل «يوسف» أو «مطر» أو «شكوى»</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                className="global-search__item"
                role="option"
                onClick={() => {
                  navigate(r.path);
                  setOpen(false);
                }}
              >
                <span className={`global-search__badge global-search__badge--${r.type}`}>{r.typeLabel}</span>
                <span className="global-search__title">{r.title}</span>
                {r.subtitle && <span className="global-search__sub">{r.subtitle}</span>}
              </button>
            ))
          )}
          <button type="button" className="global-search__footer" onClick={goSearchPage}>
            عرض كل النتائج (UI فقط)
          </button>
        </div>
      )}
    </div>
  );
}
