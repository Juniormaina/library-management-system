import { Link, useLocation } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext';

export default function Navbar() {
  const location = useLocation();
  const { count } = useReadingList();
  const token = typeof window !== 'undefined' ? localStorage.getItem('library_access_token') : null;
  const isDetail = location.pathname.startsWith('/books/');
  const isSpaces = location.pathname === '/spaces';
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="app__header">
      <Link to="/" className="app__brand">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2 19 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="app__brand-name">Library Catalog</span>
      </Link>
      <nav className="app__nav" aria-label="Primary">
        <Link to="/" className={!isDetail && !isSpaces && !isAuth ? 'app__link app__link--active' : 'app__link'}>
          Catalog
        </Link>
        <Link to="/spaces" className={isSpaces ? 'app__link app__link--active' : 'app__link'}>
          Book a Space
        </Link>
        <span className="app__reading-count" aria-live="polite" title="Reading list items">
          Reading list: {count}
        </span>
        {token ? (
          <button
            type="button"
            className="app__link app__link--button"
            onClick={() => {
              localStorage.removeItem('library_access_token');
              window.location.assign('/');
            }}
          >
            Log out
          </button>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'app__link app__link--active' : 'app__link'}>
              Log in
            </Link>
            <Link to="/register" className={location.pathname === '/register' ? 'app__link app__link--active' : 'app__link'}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
