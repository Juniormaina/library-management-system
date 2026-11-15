import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import BookGrid from '../components/BookGrid';
import { api } from '../api/client';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState(null);
  const [genres, setGenres] = useState([]);

  // Load genres once; the grid still works if this fails.
  useEffect(() => {
    let cancelled = false;
    api.getGenres().then((list) => {
      if (!cancelled) setGenres(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Library Catalog</h1>
        <p className="page__subtitle">Browse, search, and explore our collection.</p>
      </header>

      <div className="toolbar">
        <SearchBar value={search} onSearch={setSearch} />
        <GenreFilter genres={genres} selectedId={genreId} onSelect={setGenreId} />
      </div>

      <BookGrid genreId={genreId} search={search} />
    </div>
  );
}