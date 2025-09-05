import React from 'react';

const TODOS_LOS_SERVICIOS = [
  'Estacionamiento', 'Vestuarios', 'Buffet', 'Parrillas', 
  'Wi-Fi', 'Kiosco', 'Torneos', 'Escuelita'
];

function ServiciosSelector({ serviciosSeleccionados = [], onServiciosChange }) {
  const handleCheckboxChange = (servicio) => {
    const nuevosServicios = serviciosSeleccionados.includes(servicio)
      ? serviciosSeleccionados.filter(s => s !== servicio)
      : [...serviciosSeleccionados, servicio];
    onServiciosChange(nuevosServicios);
  };

  return (
    <div className="bg-accent p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Servicios Ofrecidos</h3>
      <div className="grid grid-cols-2 gap-3">
        {TODOS_LOS_SERVICIOS.map(servicio => (
          <label key={servicio} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={serviciosSeleccionados.includes(servicio)}
              onChange={() => handleCheckboxChange(servicio)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-gray-800 text-sm font-medium">{servicio}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ServiciosSelector;