import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaFutbol } from "react-icons/fa";
import { register } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

function SignUpPage() {
  // Estados para controlar el flujo de la página
  const [step, setStep] = useState('selection'); 
  const [userType, setUserType] = useState(null); 

  // Estados para los datos del formulario
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // --- Estados para la dirección estructurada ---
  const [complexName, setComplexName] = useState('');
  const [calle, setCalle] = useState('');
  const [altura, setAltura] = useState('');
  const [localidad, setLocalidad] = useState('');
  
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!email || !password || !firstName || !lastName || !dni || !phone) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{7,8}$/.test(dni)) {
      setError('El DNI debe tener 7 u 8 dígitos.');
      return;
    }

    // Validar teléfono (formato argentino)
    if (!/^\+?5491[0-9]{8,9}$/.test(phone)) {
      setError('El teléfono debe tener formato argentino (+5491XXXXXXXX).');
      return;
    }
    
    if (userType === 'owner' && (!complexName || !calle || !altura || !localidad)) {
      setError('Por favor, completa todos los datos del complejo.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Registro para cliente normal
      if (userType === 'cliente') {
        const userData = {
          email,
          password,
          nombre: firstName,
          apellido: lastName,
          dni,
          telefono: phone
        };
        
        const response = await register(userData);
        
        if (response.ok) {
          // Login automático después del registro
          login(response.user);
          alert('¡Registro exitoso! Bienvenido a CanchaYa');
          navigate('/');
        } else {
          setError(response.error);
        }
      } else {
        // Para dueños de complejo, por ahora solo mostrar confirmación
        // Aquí más adelante implementaremos la creación de solicitudes
        setStep('confirmation');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => { setPassword(e.target.value); setPasswordMatch(e.target.value === confirmPassword); };
  const handleConfirmPasswordChange = (e) => { setConfirmPassword(e.target.value); setPasswordMatch(password === e.target.value); };

  if (step === 'confirmation') {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <FaFutbol className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">¡Solicitud Enviada!</h2>
        <p className="mt-2 text-gray-600">
            Gracias por registrar tu complejo. Nuestro equipo revisará tu solicitud y te notificaremos por mail cuando sea aprobada.
        </p>
        <Link to="/" className="mt-6 inline-block w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
            Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      
      {step === 'selection' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Crear una cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">¿Cómo vas a usar CanchaYa?</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleUserTypeSelect('cliente')}
              className="w-full text-lg font-semibold py-4 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
            >
              <FaUser className="h-8 w-8 text-primary"/>
              Soy Jugador
            </button>
            <button
              onClick={() => handleUserTypeSelect('owner')}
              className="w-full text-lg font-semibold py-4 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
            >
              <FaFutbol className="h-8 w-8 text-primary"/>
              Soy Dueño
            </button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            Registro de {userType === 'cliente' ? 'Jugador' : 'Dueño de Complejo'}
          </h2>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required/>
            <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required/>
          </div>
          <input type="text" placeholder="DNI (sin puntos)" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full px-4 py-2 border rounded-md" required/>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md" required/>
          <input type="tel" placeholder="Teléfono (+5491XXXXXXXX)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-md" required/>
          <input type="password" placeholder="Contraseña" value={password} onChange={handlePasswordChange} className="w-full px-4 py-2 border rounded-md" required/>
          <div>
            <input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={handleConfirmPasswordChange} className={`w-full px-4 py-2 border rounded-md ${passwordMatch ? '' : 'border-red-500'}`} required/>
            {!passwordMatch && <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</p>}
          </div>

          {userType === 'owner' && (
            <div className="animate-fade-in border-t pt-4 mt-4 space-y-4">
              <input type="text" value={complexName} onChange={(e) => setComplexName(e.target.value)} placeholder="Nombre del complejo" className="w-full px-4 py-2 border rounded-md" required/>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={calle} onChange={(e) => setCalle(e.target.value)} placeholder="Calle" className="col-span-2 w-full px-4 py-2 border rounded-md" required/>
                <input type="text" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="Altura" className="w-full px-4 py-2 border rounded-md" required/>
              </div>
              <input type="text" value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Localidad (Ej: La Plata)" className="w-full px-4 py-2 border rounded-md" required/>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-500">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;