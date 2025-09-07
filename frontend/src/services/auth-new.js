const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Convierte el rol del backend al rol del frontend
 */
const mapBackendRoleToFrontend = (backendRole) => {
  const roleMap = {
    'ADMINISTRADOR': 'admin',
    'DUENIO': 'owner',
    'CLIENTE': 'normal'
  };
  return roleMap[backendRole] || 'normal';
};

/**
 * Función de login que conecta con el backend
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || 'Error de conexión'
      };
    }

    if (data.ok) {
      // Mapear el rol del backend al frontend
      const user = {
        ...data.user,
        role: mapBackendRoleToFrontend(data.user.rol)
      };

      // Guardar en localStorage si rememberMe está activado
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      return {
        ok: true,
        user
      };
    }

    return {
      ok: false,
      error: data.error || 'Credenciales inválidas'
    };

  } catch (error) {
    console.error('Error en login:', error);
    return {
      ok: false,
      error: 'Error de conexión con el servidor'
    };
  }
};

/**
 * Función de registro que conecta con el backend
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || 'Error de conexión'
      };
    }

    if (data.ok) {
      // Mapear el rol del backend al frontend
      const user = {
        ...data.user,
        role: mapBackendRoleToFrontend(data.user.rol)
      };

      // Guardar usuario automáticamente después del registro
      sessionStorage.setItem('user', JSON.stringify(user));

      return {
        ok: true,
        user
      };
    }

    return {
      ok: false,
      error: data.error || 'Error en el registro'
    };

  } catch (error) {
    console.error('Error en registro:', error);
    return {
      ok: false,
      error: 'Error de conexión con el servidor'
    };
  }
};

/**
 * Función de logout
 */
export const logout = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

/**
 * Obtener usuario actual del storage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Verificar si el usuario tiene un rol específico
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};
