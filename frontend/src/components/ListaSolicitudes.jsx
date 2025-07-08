import React from 'react';

function ListaSolicitudes({ solicitudes, onSelect, solicitudActiva }) {
  return (
    <div className="w-1/3 p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Solicitudes</h2>
      <div className="grid grid-cols-2 gap-4">
        {solicitudes.map(solicitud => (
          <button 
            key={solicitud.id} 
            onClick={() => onSelect(solicitud)}
            className={`p-4 rounded-lg text-left transition-colors ${
              solicitudActiva?.id === solicitud.id 
              ? 'bg-secondary text-white shadow-lg' 
              : 'bg-accent hover:bg-secondary hover:text-light'
            }`}
          >
            <p className="font-semibold">{solicitud.nombreComplejo}</p>
            <p className="text-sm">Solicitud #{solicitud.id}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ListaSolicitudes;