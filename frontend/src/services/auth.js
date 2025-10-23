import { API_BASE_URL } from '../config/api.js';

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

      // Guardar token en localStorage (siempre)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Guardar en localStorage si rememberMe está activado
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      return {
        ok: true,
        user,
        token: data.token
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

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/usuarios/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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

    console.log('Datos recibidos para actualizar:', userData);

    // Si hay imagen, usar JSON con base64
    if (userData.profileImageData && userData.profileImageData.startsWith('data:')) {
      // Preparar datos para enviar como JSON
      const updateData = {
        nombre: userData.nombre || currentUser.nombre,
        apellido: userData.apellido || currentUser.apellido,
        correo: currentUser.correo || currentUser.email,
        dni: currentUser.dni || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        rol: currentUser.rol || currentUser.role,
        imagen: userData.profileImageData // Enviar base64 directamente
      };

      console.log('Enviando con JSON (base64) al endpoint con imagen');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/usuarios/${currentUser.id}/update-with-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor (con imagen):', data);

      if (!response.ok) {
        return {
          ok: false,
          error: data.error || 'Error al actualizar el perfil con imagen'
        };
      }

      // Actualizar usuario en el storage
      // Construir URL correcta de la imagen (sin /api ya que las imágenes se sirven desde /images directamente)
      const baseUrl = API_BASE_URL.replace('/api', ''); // http://localhost:3000
      const updatedUser = {
        ...currentUser,
        ...data.usuario,
        role: mapBackendRoleToFrontend(data.usuario.rol),
        profileImageUrl: data.usuario.image ? `${baseUrl}${data.usuario.image}` : currentUser.profileImageUrl
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
    } else {
      // Sin imagen, usar JSON tradicional
      const updateData = {
        nombre: userData.nombre || currentUser.nombre,
        apellido: userData.apellido || currentUser.apellido,
        telefono: userData.telefono,
        direccion: userData.direccion,
      };

      console.log('Enviando datos sin imagen:', updateData);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/usuarios/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor (sin imagen):', data);

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
    }
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
