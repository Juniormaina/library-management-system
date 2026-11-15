import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/books/');

  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2 19 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="app__brand-name">Library Catalog</span>
        </Link>
        <nav className="app__nav">
          <Link to="/" className={isDetail ? 'app__link' : 'app__link app__link--active'}>
            Catalog
          </Link>
        </nav>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
      <footer className="app__footer">
        <p>Library Management System — Patron Catalog</p>
      </footer>
    </div>
  );
}