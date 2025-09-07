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
    
    if (user) {
      // TODO: Aquí deberías implementar verificación de password con bcrypt
      // Por ahora, simulamos que el login es exitoso si encuentra el usuario
      return {
        id: user.id,
        email: user.correo,
        role: mapBackendRoleToFrontend(user.rol),
        nombre: user.nombre,
        apellido: user.apellido
      };
    }
    
    return null;
  } catch (error) {
    console.log('Error al hacer login con backend:', error);
    return null;
  }
};

/**
 * Simula el inicio de sesión de un usuario.
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<{ok: boolean, user?: object, error?: string}>}
 */
export const login = async (email, password, rememberMe = false) => {
  console.log("Intentando iniciar sesión con:", email);

  // Primero intentar con el backend real
  const backendUser = await loginWithBackend(email, password);
  if (backendUser) {
    console.log("Login exitoso con backend:", backendUser);
    
    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(backendUser));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(backendUser));
    }

    return { ok: true, user: backendUser };
  }

  // Si falla el backend, usar usuarios mock como fallback
  const foundUser = mockUsers.find(user => user.email === email && user.password === password);

  if (foundUser) {
    const userToStore = { ...foundUser };
    delete userToStore.password; 

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('currentUser', JSON.stringify(userToStore));
    
    console.log("Usuario encontrado y sesión guardada:", userToStore);
    return { ok: true, user: userToStore };
  }

  return { ok: false, error: 'Credenciales incorrectas' };
};

/**
 * Obtiene el usuario actual desde el storage.
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser'));
    return user;
  } catch {
    return null;
  }
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logout = () => {
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
  console.log("Sesión cerrada.");
};