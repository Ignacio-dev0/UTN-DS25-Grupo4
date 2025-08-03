import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userType, setUserType] = useState('normal');
  const [complexName, setComplexName] = useState('');
  const [complexAddress, setComplexAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true); // Estado para verificar si las contraseñas coinciden

  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!email || !phone || !password || !firstName || !lastName || password !== confirmPassword) {
    setError('Por favor, completa todos los campos y verifica que las contraseñas coincidan.');
    return;
  }

  // Crear un objeto usuario
  const newUser = {
    email,
    phone,
    password, // En producción, NUNCA guardes contraseñas en texto plano
    role: userType,
    firstName,
    lastName,
    complexName: userType === 'owner' ? complexName : '',
    complexAddress: userType === 'owner' ? complexAddress : '',
  };

  // Obtener usuarios existentes
  const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

  // Agregar el nuevo usuario
  storedUsers.push(newUser);

  // Guardar nuevamente en localStorage
  localStorage.setItem('users', JSON.stringify(storedUsers));

  navigate('/'); // Redirigir a Home o donde prefieras
};

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    // Verificar si las contraseñas coinciden
    if (value !== password) {
      setPasswordMatch(false); // Las contraseñas no coinciden
    } else {
      setPasswordMatch(true); // Las contraseñas coinciden
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100" style={{ backgroundImage: 'url(/fondoVerde.jpg)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
      <div className="bg-white p-8 rounded-lg shadow-md w-160" >
        <h2 className="text-2xl font-bold text-center mb-6">Registro de Cuenta</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Campo de nombre */}
          <div className="mb-4">
            <label htmlFor="firstName">Nombre</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de apellido */}
          <div className="mb-4">
            <label htmlFor="lastName">Apellido</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ingresa tu apellido"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de correo electrónico */}
          <div className="mb-4">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de teléfono */}
          <div className="mb-4">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ingresa tu teléfono"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de contraseña */}
          <div className="mb-4">
            <label htmlFor="password">Contraseña</label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Confirmación de contraseña */}
          <div className="mb-4">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange} // Llamar a la función de validación
                placeholder="Confirma tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {!passwordMatch && confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Tipo de usuario */}
          <div className="mb-4">
            <label htmlFor="userType">Tipo de cuenta</label>
            <div>
              <input
                type="radio"
                id="normal"
                name="userType"
                value="normal"
                checked={userType === 'normal'}
                onChange={() => setUserType('normal')}
                className="mr-2"
              />
              <label htmlFor="normal">Usuario</label>
            </div>
            <div>
              <input
                type="radio"
                id="owner"
                name="userType"
                value="owner"
                checked={userType === 'owner'}
                onChange={() => setUserType('owner')}
                className="mr-2"
              />
              <label htmlFor="owner">Dueño de un Complejo</label>
            </div>
          </div>

          {/* Si el usuario es dueño de un complejo */}
          {userType === 'owner' && (
            <>
              <div className="mb-4">
                <label htmlFor="complexName">Nombre del Complejo</label>
                <input
                  type="text"
                  id="complexName"
                  value={complexName}
                  onChange={(e) => setComplexName(e.target.value)}
                  placeholder="Nombre del complejo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="complexAddress">Dirección del Complejo</label>
                <input
                  type="text"
                  id="complexAddress"
                  value={complexAddress}
                  onChange={(e) => setComplexAddress(e.target.value)}
                  placeholder="Dirección del complejo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
