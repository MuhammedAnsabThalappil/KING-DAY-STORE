import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('kd_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetchApi<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('kd_auth_token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (adminIdOrEmail: string, password: string) => {
    const res = await fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ adminId: adminIdOrEmail, email: adminIdOrEmail, password })
    });

    if (res.success && res.data) {
      localStorage.setItem('kd_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetchApi('/auth/admin/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('kd_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === 'ADMIN',
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
