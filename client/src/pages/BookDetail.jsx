import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function BookDetail() {
  const { id } = useParams();
  const [state, setState] = useState({
    book: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState({ book: null, loading: true, error: null });
      try {
        const book = await api.getBook(id);
        if (!cancelled) {
          setState({ book, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            book: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load book',
          });
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className="page">
        <div className="detail detail--loading">
          <div className="detail__cover-skeleton" />
          <div className="detail__body">
            <div className="skeleton-line skeleton-line--title" style={{ width: '60%' }} />
            <div className="skeleton-line skeleton-line--author" style={{ width: '40%' }} />
            <div className="skeleton-line skeleton-line--genre" style={{ width: '30%' }} />
            <div className="skeleton-line" style={{ width: '100%' }} />
            <div className="skeleton-line" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    const isNotFound = /not found/i.test(state.error);
    return (
      <div className="page">
        <div className="state state--error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h3>{isNotFound ? 'Book not found' : 'Unable to load book'}</h3>
          <p>{state.error}</p>
          <div className="state__actions">
            <Link to="/" className="btn btn--primary">
              Back to catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const book = state.book;
  const isAvailable = book.available && book.totalCopies > 0;
  const coverUrl = `https://covers.openlibrary.org/isbn/${book.isbn}-L.jpg`;
  const published = book.publishedAt ? new Date(book.publishedAt).toLocaleDateString() : null;

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to catalog
      </Link>

      <article className="detail">
        <div className="detail__cover">
          <img
            src={coverUrl}
            alt={`Cover for ${book.title}`}
            width="240"
            height="336"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('detail__cover--placeholder');
            }}
          />
          <div className="detail__cover detail__cover--placeholder" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2 19 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>

        <div className="detail__body">
          <span className="detail__genre">{book.genre?.name ?? 'Unknown genre'}</span>
          <h1 className="detail__title">{book.title}</h1>
          <p className="detail__author">by {book.author}</p>

          <div className="detail__meta">
            <span className="detail__meta-item">
              <strong>ISBN:</strong> {book.isbn}
            </span>
            {published && (
              <span className="detail__meta-item">
                <strong>Published:</strong> {published}
              </span>
            )}
            <span className="detail__meta-item">
              <strong>Copies:</strong> {book.totalCopies}
            </span>
          </div>

          <div className="detail__status">
            {isAvailable ? (
              <span className="badge badge--available">Available</span>
            ) : (
              <span className="badge badge--unavailable">Unavailable</span>
            )}
          </div>

          {book.description && (
            <section className="detail__description">
              <h2>About this book</h2>
              <p>{book.description}</p>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}