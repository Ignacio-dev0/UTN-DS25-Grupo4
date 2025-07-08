import React from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/solid';

function ComplejoInfo({ complejo, alquileres = [], isEditing, onToggleEdit }) {
  if (!complejo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="w-full md:w-1/3 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{complejo.nombre}</h2>
        <button onClick={onToggleEdit} className="text-secondary hover:text-green-400" title={isEditing ? "Finalizar Edición" : "Editar Canchas"}>
          {isEditing ? <CheckIcon className="w-6 h-6" /> : <PencilIcon className="w-5 h-5 text-secondary hover:text-primary" />}
        </button>
      </div>
      
      <div className="bg-accent p-4 rounded-lg mb-4">
        <p className="text-xs text-primary">Cuenta en pesos</p>
        <p className="text-3xl font-bold text-primary">${complejo.balance.toLocaleString('es-AR')}</p>
      </div>

      <div className="bg-accent h-64 rounded-lg flex items-center justify-center mb-6">
        <img src="/images/canchas/futbol11-1.jpg" alt={`Imagen de ${complejo.nombre}`} className="w-full h-full object-cover rounded-lg"/>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Últimos Alquileres</h3>
        <div className="space-y-3">
          {alquileres.length > 0 ? (
            alquileres.map(alquiler => (
              <div key={alquiler.id} className="bg-secondary text-light p-3 rounded-lg flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold">{alquiler.cancha}</p>
                  <p className="text-accent text-xs">{alquiler.fecha}</p>
                </div>
                <p className="font-semibold">${alquiler.total.toLocaleString('es-AR')}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No hay alquileres recientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplejoInfo;