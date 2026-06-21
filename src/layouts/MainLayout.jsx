import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/search-visitor', label: 'Search Visitor' },
  ];

  const guardLinks = [
    { to: '/guard', label: 'Dashboard' },
    { to: '/register-visitor', label: 'Register Visitor' },
    { to: '/qr-scanner', label: 'Scan QR' },
    { to: '/search-visitor', label: 'Search Visitor' },
  ];

  const links = user?.role === 'admin' ? adminLinks : guardLinks;

  return (
    <div>
      <header className="header">
        <div className="header-container">
          <h2>College VMS</h2>
          {user && (
            <>
              <button
                className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <span className="nav-user-info">
                  {user.name} ({user.role})
                </span>
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={isActive(link.to)}
                    onClick={handleNavClick}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  className="btn btn-danger nav-logout-btn"
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <main className="container" style={{ marginTop: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
