import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/auth'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const userInSession = getCurrentUser();
    if (userInSession) {
      setUser(userInSession);
    }
    setLoading(false); 
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout(); 
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  if (loading) {
    return <div>Cargando...</div>; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}