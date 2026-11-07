import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { triggerHealthCheck } from '../services/api';
import PasswordToggle from '../components/PasswordToggle';
import FieldError from '../components/FieldError';
import Brand from '../components/Brand';
import LoadingState from '../components/LoadingState';
import { rules, firstError } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    triggerHealthCheck(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      email: rules.email(email),
      password: rules.password(password),
    };
    setFieldErrors(errors);
    const summary = firstError(errors);
    if (summary) {
      setError(summary);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const data = await login(email.trim(), password);
      if (data.success) {
        navigate(data.data.user.role === 'admin' ? '/admin' : '/guard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState text="Loading…" />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/guard'} replace />;

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <Brand />
        <h1 className="auth-title">Staff sign in</h1>
        <p className="muted">Guards and admins use this console to register, scan, and track campus visits.</p>
        <div className="card auth-card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setFieldErrors({ ...fieldErrors, email: rules.email(email) })}
                autoComplete="email"
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setFieldErrors({ ...fieldErrors, password: rules.password(password) })}
                  style={{ paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              <FieldError message={fieldErrors.password} />
            </div>
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="auth-footer">
          Visiting campus? <Link to="/register">Get a QR pass</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
