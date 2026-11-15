import { useEffect, useState } from 'react';
import BookCard from './BookCard';
import { api } from '../api/client';

export default function BookGrid({ genreId, search }) {
  const [state, setState] = useState({
    books: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await api.getBooks({
          genreId: genreId || undefined,
          search: search || undefined,
          page: 1,
          limit: 12,
        });
        if (!cancelled) {
          setState({
            books: result.data,
            total: result.meta.total,
            page: result.meta.page,
            limit: result.meta.limit,
            totalPages: result.meta.totalPages,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load books',
          }));
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [genreId, search]);

  if (state.loading) {
    return (
      <div className="book-grid" aria-live="polite">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="book-card book-card--skeleton">
            <div className="book-card__cover-skeleton" />
            <div className="book-card__body">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--author" />
              <div className="skeleton-line skeleton-line--genre" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="state state--error" role="alert">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h3>Unable to load books</h3>
        <p>{state.error}</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (state.books.length === 0) {
    return (
      <div className="state state--empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2 19 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <h3>No books found</h3>
        <p>
          {search
            ? `No books match "${search}". Try a different search term or clear the filter.`
            : 'There are no books in this genre yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="book-grid" aria-live="polite">
      {state.books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}