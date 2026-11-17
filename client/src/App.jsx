import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BookDetail from './pages/BookDetail';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SpaceBookingPage from './pages/SpaceBookingPage';
import { ReadingListProvider } from './context/ReadingListContext';

function PublicOnlyRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('library_access_token');
  if (token) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ReadingListProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/spaces"
            element={
              <ProtectedRoute>
                <SpaceBookingPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </ReadingListProvider>
  );
}