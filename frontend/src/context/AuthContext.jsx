import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/auth'; 
import { API_BASE_URL } from '../config/constants';

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

  const updateUser = (userData) => {
    setUser(userData);
    // También actualizar el storage
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else if (sessionStorage.getItem('user')) {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    authLogout(); 
    setUser(null);
  };

  // Helper para verificar si es dueño con solicitud aprobada
  const isApprovedOwner = async () => {
    if (!user || user.rol !== 'owner') return false;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/solicitudes?usuarioId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const solicitud = data.solicitudes?.find(s => s.usuarioId === user.id);
        return solicitud?.estado === 'APROBADO';
      }
    } catch (error) {
      console.error('Error verificando estado de solicitud:', error);
    }
    return false;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    updateUser,
    logout,
    isApprovedOwner,
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