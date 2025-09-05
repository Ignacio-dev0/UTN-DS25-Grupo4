// --- USUARIOS DE PRUEBA ---
const mockUsers = [
  {
    id: 999, // Un ID único para el administrador
    email: 'admin@canchaya.com',
    password: 'admin',
    role: 'admin',
    nombre: 'Thiago',
    apellido: 'Perez'
  },
  {
    id: 1, 
    email: 'complejo@canchaya.com',
    password: 'complejo',
    role: 'owner', // 'owner' para dueño de complejo
    nombre: 'Dueño de',
    apellido: 'El Potrero'
  },
  {
    id: 101,
    email: 'cliente@canchaya.com',
    password: 'cliente',
    role: 'normal', // 'normal' para un cliente/jugador
    nombre: 'Juan',
    apellido: 'Cliente'
  }
];


/**
 * Simula el inicio de sesión de un usuario.
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<{ok: boolean, user?: object, error?: string}>}
 */
export const login = async (email, password, rememberMe = false) => {
  console.log("Intentando iniciar sesión con:", email);

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