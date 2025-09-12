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
    console.log('Intentando login con:', { email, password });
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

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
        rol: mapBackendRoleToFrontend(data.user.rol || data.user.role)
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
        rol: mapBackendRoleToFrontend(data.user.rol)
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
 * Función para obtener el perfil completo del usuario logueado
 */
export const getUserProfile = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return {
        ok: false,
        error: 'No hay usuario logueado'
      };
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || 'Error al obtener el perfil'
      };
    }

    return {
      ok: true,
      user: data.usuario
    };
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Función para actualizar el perfil del usuario logueado
 */
export const updateUserProfile = async (userData) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return {
        ok: false,
        error: 'No hay usuario logueado'
      };
    }

    // Preparar datos para el backend
    const updateData = {
      name: userData.nombre?.split(' ')[0] || currentUser.nombre, // Solo el primer nombre
      apellido: userData.nombre?.split(' ').slice(1).join(' ') || currentUser.apellido, // Resto como apellido
      telefono: userData.telefono,
      direccion: userData.direccion, // Campo de dirección
    };

    // Manejar imagen: usar imagen real si existe, sino la URL
    if (userData.profileImageData) {
      updateData.image = userData.profileImageData; // Imagen base64 real
    } else if (userData.profileImageUrl) {
      updateData.image = userData.profileImageUrl; // URL de imagen
    }

    console.log('Enviando datos de actualización:', updateData);

    const response = await fetch(`${API_BASE_URL}/usuarios/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || 'Error al actualizar el perfil'
      };
    }

    // Actualizar usuario en el storage
    const updatedUser = {
      ...currentUser,
      ...data.usuario,
      role: mapBackendRoleToFrontend(data.usuario.rol)
    };

    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return {
      ok: true,
      user: data.usuario
    };
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    return {
      ok: false,
      error: 'Error de conexión'
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
  return user && user.rol === requiredRole;
};
