import { createContext, useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return null;
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = readStoredUser();
    setUser(stored);

    const hydrate = async () => {
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          localStorage.setItem('user', JSON.stringify(res.data.data));
          setUser(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [logout]);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('vms:logout', onLogout);
    return () => window.removeEventListener('vms:logout', onLogout);
  }, [logout]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    if (response.data.success) {
      const { user: nextUser, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
