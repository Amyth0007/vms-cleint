import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { triggerHealthCheck } from '../services/api';
import PasswordToggle from '../components/PasswordToggle';
import FieldError from '../components/FieldError';
import { rules, firstError } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      if (data.success) {
        navigate(data.data.user.role === 'admin' ? '/admin' : '/guard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper form-page">
      <div className="card">
        <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Staff login</h2>
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
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Visitor? <Link to="/register">Get a QR pass</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
