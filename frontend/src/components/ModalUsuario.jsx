import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

function ModalUsuario({ isOpen, usuarioActual, onSave, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    dni: '',
    telefono: '',
    direccion: '',
    rol: 'player',
    password: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuarioActual) {
      setFormData({
        id: usuarioActual.id,
        nombre: usuarioActual.nombre || '',
        apellido: usuarioActual.apellido || '',
        correo: usuarioActual.correo || '',
        dni: usuarioActual.dni || '',
        telefono: usuarioActual.telefono || '',
        direccion: usuarioActual.direccion || '',
        rol: usuarioActual.rol || 'player',
        password: '', // No mostramos la contraseña actual
        image: usuarioActual.image || ''
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        dni: '',
        telefono: '',
        direccion: '',
        rol: 'player',
        password: '',
        image: ''
      });
    }
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setLoading(false);
  }, [usuarioActual, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!usuarioActual && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.telefono && !/^(\+\d{1,4})?\d{10,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato de teléfono inválido (ej: 1234567890 o +5491234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let dataToSend = { ...formData };
      
      // Si estamos editando y no se cambió la contraseña, no la enviamos
      if (usuarioActual && !formData.password) {
        delete dataToSend.password;
      }

      // Si hay una imagen seleccionada, usar FormData
      if (imageFile) {
        const formDataWithImage = new FormData();
        
        // Agregar todos los campos del formulario
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
            formDataWithImage.append(key, dataToSend[key]);
          }
        });
        
        // Agregar la imagen
        formDataWithImage.append('imagen', imageFile);
        
        onSave(formDataWithImage, true); // true indica que es FormData
      } else {
        onSave(dataToSend, false); // false indica que es JSON
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert('Error al procesar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20 overflow-auto">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg mx-auto mb-20">
            <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                    {usuarioActual ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.nombre ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingrese el nombre"
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Apellido */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.apellido ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingrese el apellido"
                        />
                        {errors.apellido && (
                            <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>
                        )}
                    </div>
                </div>

                {/* Correo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.correo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="usuario@ejemplo.com"
                    />
                    {errors.correo && (
                        <p className="text-red-500 text-sm mt-1">{errors.correo}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DNI */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            DNI *
                        </label>
                        <input
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.dni ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="12345678"
                            maxLength="8"
                        />
                        {errors.dni && (
                            <p className="text-red-500 text-sm mt-1">{errors.dni}</p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.telefono ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="1234567890 o +5491234567890"
                            maxLength="20"
                        />
                        {errors.telefono && (
                            <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                        )}
                    </div>
                </div>

                {/* Dirección */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                    </label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ingrese la dirección"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol *
                        </label>
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="player">Jugador</option>
                            <option value="owner">Dueño de Complejo</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {usuarioActual ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={usuarioActual ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                </div>

                {/* Imagen de Perfil */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen de Perfil
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Formato: JPG, PNG, GIF. Tamaño máximo: 2MB
                    </p>
                    
                    {/* Vista previa de imagen nueva */}
                    {imagePreview && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                            <img
                                src={imagePreview}
                                alt="Vista previa nueva"
                                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                            />
                        </div>
                    )}
                    
                    {/* Imagen actual del usuario (si existe y no hay nueva imagen) */}
                    {!imagePreview && formData.image && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                            <img
                                src={formData.image.startsWith('http') ? formData.image : `${API_BASE_URL}${formData.image}`}
                                alt="Imagen actual"
                                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {imageFile ? 'Subiendo imagen...' : 'Guardando...'}
                            </div>
                        ) : (
                            `${usuarioActual ? 'Actualizar' : 'Crear'} Usuario`
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
}

export default ModalUsuario;