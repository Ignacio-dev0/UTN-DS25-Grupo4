export const login = async (email, password, rememberMe = false) => {
  // Admin hardcodeado
  if (email === 'admin@canchaYa.com' && password === '123456') {
    const adminUser = { email, role: 'admin' };
    // Guardar sesión
    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
    }
    return { ok: true, user: adminUser };
  }

  // Usuarios registrados
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const foundUser = users.find(user => user.email === email && user.password === password);

  if (foundUser) {
    // Guardar sesión
    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
    }
    return { ok: true, user: foundUser };
  }

  return { ok: false, error: 'Credenciales incorrectas' };
};


export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser'));
  return user;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
};