import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function GenreFilter({ genres, selectedId, onSelect }) {
  const [localGenres, setLocalGenres] = useState(genres);

  useEffect(() => {
    if (Array.isArray(genres) && genres.length > 0) {
      setLocalGenres(genres);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const list = await api.getGenres();
        if (!cancelled) setLocalGenres(list);
      } catch {
        // Keep the component usable even if genre lookup fails.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [genres]);

  return (
    <div className="genre-filter">
      <label className="genre-filter__label" htmlFor="genre-filter">
        Genre
      </label>
      <select
        id="genre-filter"
        className="genre-filter__select"
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
      >
        <option value="">All genres</option>
        {localGenres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </div>
  );
}