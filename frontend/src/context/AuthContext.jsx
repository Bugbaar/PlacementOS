import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('placementos_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user and profile on mount or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch (err) {
        console.error('Failed to authenticate stored session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      localStorage.setItem('placementos_token', response.data.token);
      setToken(response.data.token);
      setUser(response.data);
      return response.data;
    }
  };

  const register = async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.success && response.data.token) {
      localStorage.setItem('placementos_token', response.data.token);
      setToken(response.data.token);
      setUser(response.data);
      return response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('placementos_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        setUser(response.data.user);
        setProfile(response.data.profile);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
