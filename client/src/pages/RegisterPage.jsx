import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (form.password.length < 1) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess('Registration successful. Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Register</h1>
        <p className="page__subtitle">Create an account to access protected library features.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {error && <p className="form-alert form-alert--error" role="alert">{error}</p>}
        {success && <p className="form-alert form-alert--success" role="status">{success}</p>}

        <div className="form-field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
