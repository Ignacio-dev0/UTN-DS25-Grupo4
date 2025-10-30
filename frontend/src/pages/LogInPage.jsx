import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as authLogin } from '../services/auth'; 
import { useAuth } from '../context/AuthContext'; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

// aca me guie de como lo hacia el profe en sus filminas
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../validations/loginSchema';

function LogInPage() {
  // Ahora 'error' a 'serverError' para diferenciarlo de los errores de 'errors'
  const [serverError, setServerError] = useState(''); 
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 
  // aca estoy declarando la estructura de react-hook-form 
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(loginSchema), // aca Yup se conecta con el hook
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  //se procesa data que es generado por handleSubmit
  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authLogin(data.email, data.password, data.rememberMe);
      if (res.ok) {
        login(res.user); 
        navigate('/'); 
      } else {
        setServerError(res.error || 'Credenciales inválidas');
      }
    } catch (apiError) {
      console.error("Error en la llamada de login:", apiError);
      setServerError('No se pudo conectar al servidor. Inténtalo más tarde.');
    }
  };
  // voy a marcar los errores y como vi los comentarios {/**/} en jsx
 return (
   <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
     <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar sesión</h2>
     
     {/* Mostramos el error del servidor */}
     {serverError && <p className="text-red-500 text-center mb-4">{serverError}</p>}
     
     <form onSubmit={handleSubmit(onSubmit)}>
       <div className="mb-4">
         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
         <input 
           type="email" 
           id="email"
           {...register("email")}
           placeholder="tu@email.com"
           className={`w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
         />
         {/* error de validación específico de este campo */}
         {errors.email && <span className="text-red-600 text-sm mt-1 field-error">{errors.email.message}</span>}
       </div>
       
       <div className="mb-4">
         <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Contraseña</label>
         <div className="relative">
           <input 
             type={passwordVisible ? 'text' : 'password'} 
             id="password-login"
             {...register("password")}
             placeholder="Contraseña" 
             className={`w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
           />
           <span onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer mt-1 text-gray-500">
             {passwordVisible ? <FaEyeSlash /> : <FaEye />}
           </span>
         </div>
         {/* error de validación de la contraseña */}
         {errors.password && <span className="text-red-600 text-sm mt-1 field-error">{errors.password.message}</span>}
       </div>
       
       <div className="mb-4 flex items-center">
         <input 
           type="checkbox" 
           id="remember-me"
           {...register("rememberMe")}
           className="mr-2"
         />
         <label htmlFor="remember-me" className="text-sm text-gray-600">Recordar sesión</label>
       </div>
       
       <button 
         type="submit"
         disabled={isSubmitting}
         className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50"
       >
         {/* esto lo sume y tome la idea del pdf del profe, tal vez algun dia tarde en cargar y bueno */}
         {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
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