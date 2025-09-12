import React, { useState, useEffect } from 'react';

function ModalLocalidad({ isOpen, onClose, onSave, localidadActual }) {
  const [nombre, setNombre] = useState('');
  const [provincia, setProvincia] = useState('');

  // Cuando el modal se abre, si estamos editando, carga los datos de la localidad actual.
  useEffect(() => {
    if (localidadActual) {
      setNombre(localidadActual.nombre);
      setProvincia(localidadActual.provincia || '');
    } else {
      setNombre('');
      setProvincia('');
    }
  }, [localidadActual, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre) {
      alert('Por favor, ingresa un nombre para la localidad.');
      return;
    }
    if (!provincia) {
      alert('Por favor, ingresa una provincia para la localidad.');
      return;
    }
    onSave({ ...localidadActual, nombre, provincia });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          {localidadActual ? 'Editar Localidad' : 'Agregar Nueva Localidad'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombreLocalidad" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Localidad
            </label>
            <input
              type="text"
              id="nombreLocalidad"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: La Plata"
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="provinciaLocalidad" className="block text-sm font-medium text-gray-700 mb-2">
              Provincia
            </label>
            <input
              type="text"
              id="provinciaLocalidad"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: Buenos Aires"
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-secondary text-light font-bold py-2 px-4 rounded-lg hover:bg-primary transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalLocalidad;
