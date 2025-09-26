import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaFutbol, FaMapMarkerAlt } from "react-icons/fa";
import { register } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../config/api.js';

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
  const [localidades, setLocalidades] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [cuit, setCuit] = useState('');
  const [complexImage, setComplexImage] = useState(null);
  const [complexImagePreview, setComplexImagePreview] = useState(null);
  
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Cargar localidades desde la base de datos
  useEffect(() => {
    const cargarLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        const response = await fetch(`${API_BASE_URL}/localidades`);
        if (response.ok) {
          const data = await response.json();
          setLocalidades(data.localidades || data); // Acceder al array de localidades
        } else {
          console.error('Error al cargar localidades');
          // Agregar localidades de respaldo en caso de error
          setLocalidades([
            { id: 1, nombre: 'La Plata' },
            { id: 2, nombre: 'City Bell' },
            { id: 3, nombre: 'Gonnet' },
            { id: 4, nombre: 'Berisso' },
            { id: 5, nombre: 'Ensenada' }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar localidades:', error);
        // Agregar localidades de respaldo en caso de error
        setLocalidades([
          { id: 1, nombre: 'La Plata' },
          { id: 2, nombre: 'City Bell' },
          { id: 3, nombre: 'Gonnet' },
          { id: 4, nombre: 'Berisso' },
          { id: 5, nombre: 'Ensenada' }
        ]);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    cargarLocalidades();
  }, []);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep('form');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
        return;
      }
      
      setComplexImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setComplexImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    
    if (userType === 'owner' && (!complexName || !calle || !altura || !localidad || !cuit)) {
      setError('Por favor, completa todos los datos del complejo: nombre, dirección (calle, altura, localidad) y CUIT.');
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
          telefono: phone,
          tipoUsuario: 'CLIENTE'
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
        // Para dueños de complejo - usar endpoint con soporte de imagen
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('nombre', firstName);
        formData.append('apellido', lastName);
        formData.append('dni', dni);
        formData.append('telefono', phone);
        formData.append('tipoUsuario', 'DUENIO');
        formData.append('cuit', cuit);
        formData.append('nombreComplejo', complexName);
        formData.append('calle', calle);
        formData.append('altura', altura);
        formData.append('localidadId', localidad);
        
        if (complexImage) {
          formData.append('imagen', complexImage);
        }
        
        const response = await fetch(`${API_BASE_URL}/usuarios/register-with-image`, {
          method: 'POST',
          body: formData
        });
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          // Si no puede parsear JSON, crear un objeto de error
          data = { 
            ok: false, 
            error: response.status === 500 
              ? 'Error interno del servidor. Intenta nuevamente.' 
              : `Error del servidor (${response.status})`
          };
        }
        
        if (response.ok && data.ok) {
          setStep('confirmation');
        } else {
          setError(data.error || 'Error al crear la solicitud de complejo');
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
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
        <FaFutbol className="mx-auto h-16 w-16 text-primary" />
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
              <h3 className="text-lg font-semibold text-gray-800">Datos del Complejo</h3>
              <input 
                type="text" 
                value={complexName} 
                onChange={(e) => setComplexName(e.target.value)} 
                placeholder="Nombre del complejo" 
                className="w-full px-4 py-2 border rounded-md" 
                required
              />
              <input 
                type="text" 
                value={cuit} 
                onChange={(e) => setCuit(e.target.value)} 
                placeholder="CUIT (XX-XXXXXXXX-X)" 
                className="w-full px-4 py-2 border rounded-md" 
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="text" 
                  value={calle} 
                  onChange={(e) => setCalle(e.target.value)} 
                  placeholder="Calle" 
                  className="col-span-2 w-full px-4 py-2 border rounded-md" 
                  required
                />
                <input 
                  type="text" 
                  value={altura} 
                  onChange={(e) => setAltura(e.target.value)} 
                  placeholder="Altura" 
                  className="w-full px-4 py-2 border rounded-md" 
                  required
                />
              </div>
              
              {/* Campo de localidad - Select con opciones de la BD */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaMapMarkerAlt className="text-accent" />
                  Localidad *
                </label>
                <select 
                  value={localidad} 
                  onChange={(e) => setLocalidad(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-accent focus:border-accent bg-white" 
                  required
                  disabled={loadingLocalidades}
                >
                  <option value="">
                    {loadingLocalidades ? "Cargando localidades..." : "Selecciona una localidad"}
                  </option>
                  {localidades.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nombre}
                    </option>
                  ))}
                </select>
                {localidades.length === 0 && !loadingLocalidades && (
                  <p className="text-sm text-red-500">
                    No se pudieron cargar las localidades. Contacta al administrador.
                  </p>
                )}
                {loadingLocalidades && (
                  <p className="text-sm text-gray-500">
                    Cargando localidades disponibles...
                  </p>
                )}
              </div>
              
              {/* Campo de imagen */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagen del Complejo (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {complexImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={complexImagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
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