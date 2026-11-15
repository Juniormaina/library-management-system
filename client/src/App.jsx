import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookDetail from './pages/BookDetail';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:id" element={<BookDetail />} />
      </Route>
    </Routes>
  );
}