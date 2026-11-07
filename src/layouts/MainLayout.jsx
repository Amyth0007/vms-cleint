import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { initials } from '../utils/format';
import Brand from '../components/Brand';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const DockLink = ({ to, label, end, children }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
    <Icon>{children}</Icon>
    <span>{label}</span>
  </NavLink>
);

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isAdmin = user?.role === 'admin';
  const home = isAdmin ? '/admin' : '/guard';

  const desktopLinks = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/passes', label: 'Passes' },
        { to: '/search-visitor', label: 'Search' },
        { to: '/register-visitor', label: 'Register' },
        { to: '/qr-scanner', label: 'Scan' },
      ]
    : [
        { to: '/guard', label: 'Visits' },
        { to: '/register-visitor', label: 'Register' },
        { to: '/qr-scanner', label: 'Scan' },
        { to: '/search-visitor', label: 'Search' },
      ];

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-container">
          <Link to={home} className="brand">
            <Brand compact />
          </Link>

          {user && (
            <>
              <nav className="nav-links desktop-nav">
                {desktopLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    end={link.to === home}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className={`user-avatar ${userOpen ? 'open' : ''}`}
                  onClick={() => setUserOpen((o) => !o)}
                  aria-label="Account menu"
                >
                  {initials(user.name)}
                </button>
                {userOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-meta">
                      <strong>{user.name}</strong>
                      <span>{user.role}</span>
                    </div>
                    <button type="button" className="user-dropdown-logout" onClick={handleLogout}>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      {user && (
        <nav className="dock" aria-label="Main">
          {isAdmin ? (
            <DockLink to="/admin" label="Visits" end>
              <rect x="3" y="4" width="7" height="7" rx="1.5" />
              <rect x="14" y="4" width="7" height="7" rx="1.5" />
              <rect x="3" y="13" width="7" height="7" rx="1.5" />
              <rect x="14" y="13" width="7" height="7" rx="1.5" />
            </DockLink>
          ) : (
            <DockLink to="/guard" label="Visits" end>
              <rect x="3" y="4" width="7" height="7" rx="1.5" />
              <rect x="14" y="4" width="7" height="7" rx="1.5" />
              <rect x="3" y="13" width="7" height="7" rx="1.5" />
              <rect x="14" y="13" width="7" height="7" rx="1.5" />
            </DockLink>
          )}

          {isAdmin ? (
            <DockLink to="/passes" label="Passes">
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </DockLink>
          ) : (
            <DockLink to="/register-visitor" label="Register">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
              <path d="M19 8v6M16 11h6" />
            </DockLink>
          )}

          <div className="dock-center">
            <NavLink to="/qr-scanner" className={({ isActive }) => `dock-scan ${isActive ? 'active' : ''}`}>
              <Icon>
                <rect x="3" y="3" width="7" height="7" rx="1.2" />
                <rect x="14" y="3" width="7" height="7" rx="1.2" />
                <rect x="3" y="14" width="7" height="7" rx="1.2" />
                <path d="M14 14h3v3h-3zM20 14v6M14 20h6" />
              </Icon>
              <span>Scan</span>
            </NavLink>
          </div>

          <DockLink to="/search-visitor" label="Search">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-3.5-3.5" />
          </DockLink>

          {isAdmin ? (
            <DockLink to="/register-visitor" label="Register">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
              <path d="M19 8v6M16 11h6" />
            </DockLink>
          ) : (
            <button type="button" className="dock-item" onMouseDown={(e) => e.stopPropagation()} onClick={() => setUserOpen((o) => !o)}>
              <span className="dock-avatar">{initials(user.name)}</span>
              <span>You</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
