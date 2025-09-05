import React, { useState, useEffect } from 'react';

function ModalDeporte({ isOpen, onClose, onSave, deporteActual }) {
  const [nombre, setNombre] = useState('');

  // Cuando el modal se abre, si estamos editando, carga el nombre del deporte actual.
  useEffect(() => {
    if (deporteActual) {
      setNombre(deporteActual.nombre);
    } else {
      setNombre('');
    }
  }, [deporteActual, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre) {
      alert('Por favor, ingresa un nombre para el deporte.');
      return;
    }
    onSave({ ...deporteActual, nombre });
  };

  return (
    <div className="fixed inset-0  bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          {deporteActual ? 'Editar Deporte' : 'Agregar Nuevo Deporte'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombreDeporte" className="block text-sm font-medium text-gray-700">
              Nombre del Deporte
            </label>
            <input
              type="text"
              id="nombreDeporte"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              autoFocus
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

export default ModalDeporte;