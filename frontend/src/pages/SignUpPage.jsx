import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaFutbol, FaMapMarkerAlt } from "react-icons/fa";
import { register } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../config/api.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../validations/signUpSchema.js';

function SignUpPage() {
  const [step, setStep] = useState('selection'); 
  const [userType, setUserType] = useState(null); 
  const [localidades, setLocalidades] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [complexImage, setComplexImage] = useState(null);
  const [complexImagePreview, setComplexImagePreview] = useState(null);
  const [serverError, setServerError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const { 
    register: registerField,
    handleSubmit, 
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(registerSchema),
    context: { userType },
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      complexName: '',
      cuit: '',
      calle: '',
      altura: '',
      localidad: ''
    }
  });

  useEffect(() => {
    const cargarLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        const response = await fetch(`${API_BASE_URL}/localidades`);
        if (response.ok) {
          const data = await response.json();
          setLocalidades(data.localidades || data);
        } else {
          console.error('Error al cargar localidades');
          setLocalidades([
            { id: 1, nombre: 'La Plata' }, { id: 2, nombre: 'City Bell' },
            { id: 3, nombre: 'Gonnet' }, { id: 4, nombre: 'Berisso' },
            { id: 5, nombre: 'Ensenada' }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar localidades:', error);
        setLocalidades([
          { id: 1, nombre: 'La Plata' }, { id: 2, nombre: 'City Bell' },
          { id: 3, nombre: 'Gonnet' }, { id: 4, nombre: 'Berisso' },
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
      if (file.size > 2 * 1024 * 1024) { // 2MB
        setServerError('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
        setComplexImage(null);
        setComplexImagePreview(null);
        e.target.value = null;
        return;
      }
      
      setServerError(''); 
      setComplexImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setComplexImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (userType === 'cliente') {
        const userData = {
          email: data.email,
          password: data.password,
          nombre: data.firstName,
          apellido: data.lastName,
          dni: data.dni,
          telefono: data.phone,
          tipoUsuario: 'CLIENTE'
        };
        
        const response = await register(userData); 
        
        if (response.ok) {
          login(response.user);
          console.log('¡Registro exitoso! Bienvenido a CanchaYa');
          navigate('/');
        } else {
          setServerError(response.error);
        }
      } else {
        let imageBase64 = null;
        
        if (complexImage) {
          imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(complexImage);
          });
        }
        
        const body = {
          email: data.email,
          password: data.password,
          nombre: data.firstName,
          apellido: data.lastName,
          dni: data.dni,
          telefono: data.phone,
          tipoUsuario: 'DUENIO',
          cuit: data.cuit,
          nombreComplejo: data.complexName,
          calle: data.calle,
          altura: data.altura,
          localidadId: data.localidad,
          imagen: imageBase64 
        };
        
        const response = await fetch(`${API_BASE_URL}/usuarios/register-with-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          responseData = { 
            ok: false, 
            error: response.status === 500 
              ? 'Error interno del servidor. Intenta nuevamente.' 
              : `Error del servidor (${response.status})`
          };
        }
        
        if (response.ok && responseData.ok) {
          setStep('confirmation');
        } else {
          setServerError(responseData.error || 'Error al crear la solicitud de complejo');
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setServerError('Error de conexión. Intenta nuevamente.');
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Registro de {userType === 'cliente' ? 'Jugador' : 'Dueño de Complejo'}
          </h2>
          
          <div className="text-center min-h-[1 rem]">
            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input type="text" placeholder="Nombre" {...registerField("firstName")} className={`w-full px-4 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : ''}`} />
              {errors.firstName && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.firstName.message}</p>}
            </div>
            <div className="relative">
              <input type="text" placeholder="Apellido" {...registerField("lastName")} className={`w-full px-4 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : ''}`} />
              {errors.lastName && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="relative">
            <input type="text" placeholder="DNI (sin puntos)" {...registerField("dni")} className={`w-full px-4 py-2 border rounded-md ${errors.dni ? 'border-red-500' : ''}`} />
            {errors.dni && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.dni.message}</p>}
          </div>
          
          <div className="relative">
            <input type="email" placeholder="Email" {...registerField("email")} className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <input type="tel" placeholder="Teléfono (+54XXXXXXXXXX)" {...registerField("phone")} className={`w-full px-4 py-2 border rounded-md ${errors.phone ? 'border-red-500' : ''}`} />
            {errors.phone && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.phone.message}</p>}
          </div>

          <div className="relative">
            <input type="password" placeholder="Contraseña" {...registerField("password")} className={`w-full px-4 py-2 border rounded-md ${errors.password ? 'border-red-500' : ''}`} />
            {errors.password && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.password.message}</p>}
          </div>
          
          <div className="relative">
            <input type="password" placeholder="Confirmar Contraseña" {...registerField("confirmPassword")} className={`w-full px-4 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : ''}`} />
            {errors.confirmPassword && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.confirmPassword.message}</p>}
          </div>

          {userType === 'owner' && (
            <div className="animate-fade-in border-t pt-4 mt-4 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Datos del Complejo</h3>
              
              <div className="relative">
                <input type="text" {...registerField("complexName")} placeholder="Nombre del complejo" className={`w-full px-4 py-2 border rounded-md ${errors.complexName ? 'border-red-500' : ''}`} />
                {errors.complexName && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.complexName.message}</p>}
              </div>

              <div className="relative">
                <input type="text" {...registerField("cuit")} placeholder="CUIT (XX-XXXXXXXX-X)" className={`w-full px-4 py-2 border rounded-md ${errors.cuit ? 'border-red-500' : ''}`} />
                {errors.cuit && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.cuit.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 relative">
                  <input type="text" {...registerField("calle")} placeholder="Calle" className={`w-full px-4 py-2 border rounded-md ${errors.calle ? 'border-red-500' : ''}`} />
                  {errors.calle && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.calle.message}</p>}
                </div>
                <div className="relative">
                  <input type="text" {...registerField("altura")} placeholder="Altura" className={`w-full px-4 py-2 border rounded-md ${errors.altura ? 'border-red-500' : ''}`} />
                  {errors.altura && <p className="absolute text-red-500 text-xs mt-1 field-error">{errors.altura.message}</p>}
                </div>
              </div>
              
              <div className="space-y-1 relative">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaMapMarkerAlt className="text-accent" />
                  Localidad *
                </label>
                <select 
                  {...registerField("localidad")}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-accent focus:border-accent bg-white ${errors.localidad ? 'border-red-500' : ''}`}
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
                <div className="min-h-[1 rem]">
                  {errors.localidad && <p className="text-red-500 text-xs mt-1 field-error">{errors.localidad.message}</p>}
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
              </div>
              
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
          
          <button type="submit" disabled={isSubmitting} className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-primary transition disabled:opacity-50">
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
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