import React from 'react';
import { ShieldExclamationIcon, TrashIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function ModalGestionCancha({ cancha, onDisable, onDelete, onClose }) {
  if (!cancha) return null;

  const handleDisableClick = () => {
    onDisable(cancha.id);
    onClose();
  };

  const handleDeleteClick = () => {
    onDelete(cancha.id);
    onClose();
  };

  const isDeshabilitada = cancha.estado === 'deshabilitada';

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary">Gestionar Cancha</h2>
        <p className="text-lg text-secondary mb-8">
          ¿Qué deseas hacer con <span className="font-bold">"{cancha.deporte} - Cancha N°{cancha.noCancha}"</span>?
        </p>

        <div className="flex flex-col items-center gap-4">
          
          {/* Botón Deshabilitar / Habilitar */}
          <button 
            onClick={handleDisableClick}
            className={`flex items-center justify-center gap-3 w-64 font-bold py-3 px-6 rounded-lg transition-colors ${
              isDeshabilitada 
              ? 'bg-secondary hover:bg-primary text-white' 
              : 'bg-canchaYellow hover:bg-yellow-600 text-white'
            }`}
          >
            {isDeshabilitada ? <ShieldCheckIcon className="w-6 h-6" /> : <ShieldExclamationIcon className="w-6 h-6" />}
            <span>{isDeshabilitada ? 'Habilitar' : 'Deshabilitar'}</span>
          </button>

          {/* Botón Eliminar */}
          <button 
            onClick={handleDeleteClick}
            className="flex items-center justify-center gap-3 w-64 bg-canchaRed text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-6 h-6" />
            <span>Eliminar</span>
          </button>

          {/* Botón Cancelar */}
          <button 
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-64 bg-gray-200 text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
             <XCircleIcon className="w-6 h-6" />
            <span>Cancelar</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
            <strong>{isDeshabilitada ? 'Habilitar' : 'Deshabilitar'}:</strong> {isDeshabilitada ? 'La cancha volverá a estar disponible para reservas.' : 'La cancha no aparecerá en las búsquedas pero no se eliminará.'}<br/>
            <strong>Eliminar:</strong> Esta acción es permanente y no se puede deshacer.
        </p>
      </div>
    </div>
  );
}

export default ModalGestionCancha;