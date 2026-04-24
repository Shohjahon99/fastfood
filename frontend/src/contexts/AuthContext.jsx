import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, adminAPI } from '../api';

const AuthContext = createContext(null);

const DEFAULT_NAV = {
  manager:  ['dashboard','pos','orders','products','inventory','customers','expenses','reports'],
  cashier:  ['dashboard','pos','orders','customers'],
  waiter:   ['dashboard','pos','orders'],
  cook:     ['dashboard','orders'],
  courier:  ['dashboard','orders'],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [navPermissions, setNavPermissions] = useState(() => {
    const saved = localStorage.getItem('ff_nav');
    return saved ? JSON.parse(saved) : DEFAULT_NAV;
  });
  const [loading, setLoading] = useState(true);

  const loadNavPermissions = async () => {
    try {
      const res = await adminAPI.getNavSettings();
      const nav = res.data.nav || DEFAULT_NAV;
      setNavPermissions(nav);
      localStorage.setItem('ff_nav', JSON.stringify(nav));
    } catch {
      setNavPermissions(DEFAULT_NAV);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      authAPI.me()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('ff_user', JSON.stringify(res.data.user));
          if (['director', 'superadmin', 'manager', 'cashier', 'waiter', 'cook', 'courier'].includes(res.data.user.role)) {
            loadNavPermissions();
          }
        })
        .catch(() => { localStorage.removeItem('ff_token'); localStorage.removeItem('ff_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('ff_token', res.data.token);
    localStorage.setItem('ff_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    if (['director', 'superadmin', 'manager', 'cashier', 'waiter', 'cook', 'courier'].includes(res.data.user.role)) {
      await loadNavPermissions();
    }
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_nav');
    setUser(null);
    setNavPermissions(DEFAULT_NAV);
  };

  const refreshNavPermissions = async () => {
    await loadNavPermissions();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, navPermissions, refreshNavPermissions, DEFAULT_NAV }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
