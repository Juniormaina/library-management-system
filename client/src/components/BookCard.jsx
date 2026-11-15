import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const isAvailable = book.available && book.totalCopies > 0;
  const coverUrl = `https://covers.openlibrary.org/isbn/${book.isbn}-L.jpg`;

  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-card__link" aria-label={`View ${book.title}`}>
        <div className="book-card__cover">
          <img
            src={coverUrl}
            alt={`Cover for ${book.title}`}
            loading="lazy"
            width="160"
            height="224"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('book-card__cover--placeholder');
            }}
          />
          <div className="book-card__cover book-card__cover--placeholder" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2 19 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>

        <div className="book-card__body">
          <h3 className="book-card__title">{book.title}</h3>
          <p className="book-card__author">{book.author}</p>
          <span className="book-card__genre">{book.genre?.name ?? 'Unknown genre'}</span>

          <div className="book-card__footer">
            {isAvailable ? (
              <span className="badge badge--available">Available</span>
            ) : (
              <span className="badge badge--unavailable">Unavailable</span>
            )}
            <span className="book-card__copies">
              {book.totalCopies} {book.totalCopies === 1 ? 'copy' : 'copies'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}