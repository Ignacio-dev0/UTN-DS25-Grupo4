import React, { useState, useEffect } from 'react';

function ServiciosSelector({ serviciosSeleccionados = [], onServiciosChange }) {
  const [todosLosServicios, setTodosLosServicios] = useState([]);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/servicios');
        if (response.ok) {
          const data = await response.json();
          setTodosLosServicios(data.servicios);
        }
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }
    };

    cargarServicios();
  }, []);

  const handleCheckboxChange = (servicioId) => {
    const nuevosServicios = serviciosSeleccionados.includes(servicioId)
      ? serviciosSeleccionados.filter(id => id !== servicioId)
      : [...serviciosSeleccionados, servicioId];
    onServiciosChange(nuevosServicios);
  };

  return (
    <div className="bg-accent p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Servicios Ofrecidos</h3>
      <div className="grid grid-cols-2 gap-3">
        {todosLosServicios.map(servicio => (
          <label key={servicio.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={serviciosSeleccionados.includes(servicio.id)}
              onChange={() => handleCheckboxChange(servicio.id)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-gray-800 text-sm font-medium">
              {servicio.icono} {servicio.nombre}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ServiciosSelector;