import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/guard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper" style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Staff Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Are you a visitor? <Link to="/register">Self-Register & Get QR Pass</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
