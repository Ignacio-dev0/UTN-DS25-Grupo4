import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// 1. Corregir import de auth.js (quitando .js)
import { getCurrentUser, logout as authLogout } from '../services/auth'; 
// 2. Corregir import de api.js (quitando .js)
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

// 3. Helper local de getToken (ya que auth.js no lo exporta)
const getToken = () => {
    // Tu auth.js solo guarda el token en localStorage
    return localStorage.getItem('token');
};

// 4. Helper local de mapRole (ya que auth.js no lo exporta)
const mapBackendRoleToFrontend = (backendRole) => {
    const roleMap = {
        'ADMINISTRADOR': 'admin',
        'DUENIO': 'owner',
        'CLIENTE': 'normal'
    };
    return roleMap[backendRole] || 'normal';
};

// 5. Helper local de storeUser (ya que auth.js no lo exporta)
const storeUserInStorage = (user) => {
    // Replicar la lógica de tu auth.js para saber dónde guardar
    if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(user));
    } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(user));
    }
    // Si no está en ninguno, no lo guardamos (solo el login decide esto)
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    // 6. Nueva función fetchUser para refrescar datos del backend
    const fetchUser = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            // Llama al nuevo endpoint del backend que creamos
            const response = await fetch(`${API_BASE_URL}/usuarios/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                
                // Mapear rol y guardar en estado
                const frontendUser = {
                    ...userData,
                    rol: mapBackendRoleToFrontend(userData.rol)
                };
                setUser(frontendUser);
                
                // Actualizar el storage para que esté sincronizado
                storeUserInStorage(frontendUser);

            } else {
                // Si el token es inválido (ej. expiró), desloguear
                authLogout(); 
                setUser(null);
            }
        } catch (error) {
            console.error('AuthContext: Error en fetchUser:', error);
            authLogout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []); // No hay dependencias, las funciones son helpers o imports

    // 7. useEffect modificado para usar fetchUser al cargar
    useEffect(() => {
        fetchUser(); 
    }, [fetchUser]);

    // Tu función login original (no cambia)
    const login = (userData) => {
        setUser(userData);
    };

    // Tu función updateUser original (no cambia)
    const updateUser = (userData) => {
        setUser(userData);
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
    };

    // Tu función logout original (no cambia)
    const logout = () => {
        authLogout(); 
        setUser(null);
    };

    // Tu función isApprovedOwner (modificada para usar el helper getToken)
    const isApprovedOwner = async () => {
        if (!user || user.rol !== 'owner') return false;
        
        try {
            const token = getToken(); // <-- Usar helper
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

    // 8. Exportar las nuevas funciones en el 'value'
    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        updateUser,
        logout,
        isApprovedOwner,
        fetchUser, // <-- Exportar para MpCallbackPage
        getToken // <-- Exportar para MpCallbackPage
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