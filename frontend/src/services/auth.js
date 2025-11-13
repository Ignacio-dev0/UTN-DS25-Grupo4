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
 * Guarda el token y los datos del usuario en el storage
 */
export const storeUserSession = (user, token, rememberMe = false) => {
    // Mapear el rol del backend al frontend
    const frontendUser = {
        ...user,
        rol: mapBackendRoleToFrontend(user.rol || user.role)
    };

    // Guardar token en localStorage (siempre, es más fácil de gestionar)
    if (token) {
        localStorage.setItem('token', token);
    }

    // Guardar datos del usuario en localStorage o sessionStorage
    if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(frontendUser));
        sessionStorage.removeItem('user'); // Limpiar por si acaso
    } else {
        sessionStorage.setItem('user', JSON.stringify(frontendUser));
        localStorage.removeItem('user'); // Limpiar por si acaso
    }
    return frontendUser;
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

        const data = await response.json();

        if (!response.ok || !data.ok) {
            return {
                ok: false,
                error: data.error || 'Error de conexión'
            };
        }

        // Usar la función centralizada para guardar la sesión
        const user = storeUserSession(data.user, data.token, rememberMe);

        return {
            ok: true,
            user,
            token: data.token
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

        if (!response.ok || !data.ok) {
            return {
                ok: false,
                error: data.error || 'Error de conexión'
            };
        }
        
        // El registro fue exitoso, pero no iniciamos sesión
        return {
            ok: true,
            user: data.user // Devolvemos el usuario por si se necesita
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

        const token = getToken(); // <-- Usar getToken()
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
        
        const token = getToken(); // <-- Usar getToken()
        let endpoint = `${API_BASE_URL}/usuarios/${currentUser.id}`;
        let body;

        // Si hay imagen, usar JSON con base64
        if (userData.profileImageData && userData.profileImageData.startsWith('data:')) {
            endpoint = `${API_BASE_URL}/usuarios/${currentUser.id}/update-with-image`;
            body = JSON.stringify({
                nombre: userData.nombre || currentUser.nombre,
                apellido: userData.apellido || currentUser.apellido,
                email: currentUser.email,
                dni: currentUser.dni || '',
                telefono: userData.telefono || '',
                direccion: userData.direccion || '',
                rol: currentUser.rol || currentUser.role,
                imagen: userData.profileImageData // Enviar base64 directamente
            });
        } else {
            // Sin imagen, usar JSON tradicional
            body = JSON.stringify({
                nombre: userData.nombre || currentUser.nombre,
                apellido: userData.apellido || currentUser.apellido,
                telefono: userData.telefono,
                direccion: userData.direccion,
            });
        }
        
        console.log(`Enviando a ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: body,
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
            rol: mapBackendRoleToFrontend(data.usuario.rol) // <-- Mapear rol
        };
        
        // Usar storeUserSession para actualizar
        storeUserSession(updatedUser, token, localStorage.getItem('user') !== null);

        return {
            ok: true,
            user: updatedUser // Devolver el usuario actualizado y mapeado
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
 * Función de logout (AHORA BORRA TODO)
 */
export const logout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token'); // <-- IMPORTANTE: Borrar el token también
};

/**
 * Obtener usuario actual del storage
 */
export const getCurrentUser = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// --- ✨ NUEVA FUNCIÓN (getToken) ✨ ---
/**
 * Obtiene solo el token (usado por el AuthContext y el Callback)
 */
export const getToken = () => {
    return localStorage.getItem('token');
};
// --- FIN NUEVA FUNCIÓN ---


/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
    return getCurrentUser() !== null && getToken() !== null;
};

/**
 * Verificar si el usuario tiene un rol específico
 */
export const hasRole = (requiredRole) => {
    const user = getCurrentUser();
    return user && user.rol === requiredRole;
};