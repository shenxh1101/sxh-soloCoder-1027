import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Company } from '../types';
import { authApi } from '../utils/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  login: (token: string, user: User, company?: Company) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserInfo = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setCompany(data.company || null);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Failed to load user info:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, newUser: User, newCompany?: Company) => {
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany || null);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompany(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    await loadUserInfo();
  };

  return (
    <AuthContext.Provider value={{ user, company, token, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
