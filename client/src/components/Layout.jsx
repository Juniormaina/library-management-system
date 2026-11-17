import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Outlet />
      </main>
      <footer className="app__footer">
        <p>Library Management System — Patron Catalog</p>
      </footer>
    </div>
  );
}