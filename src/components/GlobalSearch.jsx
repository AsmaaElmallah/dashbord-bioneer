import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { searchCloudContent } from '../services/supabase/searchService';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!isSupabaseEnabled || !q) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      const { data } = await searchCloudContent(q, 8);
      setResults(data ?? []);
      setLoading(false);
    }, 280);
    return () => window.clearTimeout(t);
  }, [query]);

  const goSearchPage = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  return (
    <div className="global-search" ref={wrapRef}>
      <input
        className="admin-topbar__search"
        placeholder="ابحث في المحتوى والشكاوى…"
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
          {loading ? (
            <p className="global-search__empty">جاري البحث…</p>
          ) : results.length === 0 ? (
            <p className="global-search__empty">لا نتائج</p>
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
                <span className={`global-search__badge global-search__badge--${r.type}`}>
                  {r.typeLabel}
                </span>
                <span className="global-search__title">{r.title}</span>
                {r.subtitle && <span className="global-search__sub">{r.subtitle}</span>}
              </button>
            ))
          )}
          <button type="button" className="global-search__footer" onClick={goSearchPage}>
            عرض كل النتائج
          </button>
        </div>
      )}
    </div>
  );
}
