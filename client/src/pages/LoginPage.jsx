import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!result?.access_token) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      api.setToken(result.access_token);
      setSuccess('Login successful. Redirecting...');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Log in</h1>
        <p className="page__subtitle">Sign in to access protected library features.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {error && <p className="form-alert form-alert--error" role="alert">{error}</p>}
        {success && <p className="form-alert form-alert--success" role="status">{success}</p>}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>

        <p className="form-footer">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
