import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { authStorage } from '../api/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  // Re-read the user from the server so role/company always match the database.
  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    const fresh = {
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
      companyId: res.data.companyId,
      company: res.data.company,
    };
    authStorage.setUser(fresh);
    setUser(fresh);
    return fresh;
  }, []);

  useEffect(() => {
    if (!authStorage.getToken()) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) logout();
      })
      .finally(() => setLoading(false));
  }, [refreshUser, logout]);

  const login = (userData, token) => {
    authStorage.setToken(token);
    authStorage.setUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);

// oxlint-disable-next-line react/only-export-components
export const homePathForRole = (role) => {
  switch (role) {
    case 'SUPER_ADMIN': return '/admin/dashboard';
    case 'COMPANY_ADMIN': return '/company/dashboard';
    case 'RECRUITER': return '/recruiter/dashboard';
    case 'CANDIDATE': return '/candidate/dashboard';
    default: return '/login';
  }
};
