import { useEffect, useRef, useState } from 'react';

export default function SearchBar({ value, onSearch }) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocal(next);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(next);
    }, 300);
  };

  const handleClear = () => {
    setLocal('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch('');
  };

  return (
    <div className="search-bar">
      <svg
        className="search-bar__icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        className="search-bar__input"
        placeholder="Search by title or author..."
        value={local}
        onChange={handleChange}
        aria-label="Search books"
      />
      {local && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}