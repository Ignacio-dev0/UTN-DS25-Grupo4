import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

function ModalAdministrador({ isOpen, administradorActual, onSave, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (administradorActual) {
      // Modo edición
      setFormData({
        email: administradorActual.email || '',
        password: '',
        confirmarPassword: ''
      });
    } else {
      // Modo creación
      setFormData({
        email: '',
        password: '',
        confirmarPassword: ''
      });
    }
    setErrors({});
  }, [administradorActual, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar password (solo si se está creando o si se quiere cambiar)
    if (!administradorActual && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.password && formData.password !== formData.confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      email: formData.email.trim(),
    };

    // Solo incluir password si se está creando o si se proporcionó una nueva
    if (formData.password) {
      dataToSend.password = formData.password;
    }

    onSave(dataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">
            {administradorActual ? 'Editar Administrador' : 'Nuevo Administrador'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="admin@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {!administradorActual && <span className="text-red-500">*</span>}
              {administradorActual && (
                <span className="text-gray-500 text-xs ml-2">(dejar en blanco para no cambiar)</span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Password */}
          {formData.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.confirmarPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Repetir contraseña"
              />
              {errors.confirmarPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmarPassword}</p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
            >
              {administradorActual ? 'Guardar Cambios' : 'Crear Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAdministrador;
