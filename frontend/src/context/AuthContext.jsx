import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('learnalie_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data.user) {
          setUser(res.data.data.user);
          localStorage.setItem('learnalie_user', JSON.stringify(res.data.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem('learnalie_token');
        localStorage.removeItem('learnalie_user');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('learnalie_token', receivedToken);
      localStorage.setItem('learnalie_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('learnalie_token');
      localStorage.removeItem('learnalie_user');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        localStorage.setItem('learnalie_user', JSON.stringify(res.data.data.user));
        return res.data.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
    isActive: user?.status === 'ACTIVE',
    isPending: user?.status === 'PENDING',
    isSuspended: user?.status === 'SUSPENDED',
    isAdmin: user?.role?.name === 'ADMIN',
    hasRole: (roleName) => user?.role?.name === 'ADMIN' || user?.role?.name === roleName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
