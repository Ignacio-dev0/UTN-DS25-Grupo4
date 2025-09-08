import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as authLogin } from '../services/auth'; 
import { useAuth } from '../context/AuthContext'; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LogInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa todos los campos');
      return;
    }

    const res = await authLogin(email, password, rememberMe);
    if (res.ok) {
      login(res.user); 
      navigate('/'); 
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar sesión</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(''); // Limpiar error cuando el usuario escriba
            }} 
            placeholder="tu@email.com" 
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <div className="relative">
            <input 
              type={passwordVisible ? 'text' : 'password'} 
              id="password-login" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(''); // Limpiar error cuando el usuario escriba
              }} 
              placeholder="Contraseña" 
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer mt-1 text-gray-500">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="mr-2"/>
          <label htmlFor="remember-me" className="text-sm text-gray-600">Recordar sesión</label>
        </div>
        <button type="submit" className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition">
          Iniciar sesión
        </button>
      </form>
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
  );
}

export default LogInPage;