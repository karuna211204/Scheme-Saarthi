import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext=createContext();

export const useAuth=() => {
  const context=useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider=({ children }) => {
  const [user, setUser]=useState(() => {
    const savedUser=localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken]=useState(localStorage.getItem('token'));
  const [loading, setLoading]=useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded=jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          if (!user) {
            fetchProfile();
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Invalid token:', err);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile=async () => {
    try {
      const response=await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData=await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login=async (googleToken) => {
    try {
      const response=await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: googleToken })
      });

      if (response.ok) {
        const data=await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const error=await response.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const logout=() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updatePhone=async (phone) => {
    try {
      const response=await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      });

      if (response.ok) {
        const data=await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (err) {
      console.error('Error updating phone:', err);
      return { success: false };
    }
  };

  const value={
    user,
    token,
    loading,
    login,
    logout,
    updatePhone,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
