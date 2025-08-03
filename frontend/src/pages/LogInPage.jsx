import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../services/auth';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importando los íconos de React Icons

function LogInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const [rememberMe, setRememberMe] = useState(false); // Estado para "Recordar sesión"

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor ingresa todos los campos');
      return;
    }

    const res = await login(email, password, rememberMe); // Aquí puedes pasar el estado de rememberMe al backend
    if (res.ok) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Alterna el estado de visibilidad de la contraseña
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked); // Actualiza el estado de "Recordar sesión"
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100" style={{ backgroundImage: 'url(/fondoVerde.jpg)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'} // Cambio de tipo según el estado
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

          {/* Checkbox para recordar la sesión */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="mr-2"
            />
            <label htmlFor="remember-me" className="text-sm text-gray-600">Recordar sesión</label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Enlace para "Olvidé mi contraseña" */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            <Link to="/recuperar-contraseña" className="text-blue-500">Olvidé mi contraseña</Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm">
            ¿No tienes cuenta? <Link to="/registro" className="text-blue-500">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogInPage;
