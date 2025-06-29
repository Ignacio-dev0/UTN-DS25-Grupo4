import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';

function ResultadoCard({ cancha }) {
  const horariosDisponibles = cancha.turnos?.filter(t => t.estado === 'disponible').slice(0, 5).map(t => t.hora) || [];

  return (
    <Link to={`/reserva/${cancha.id}`} className="block bg-secondary rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 ">
      
      {/* --- Área de la Imagen --- */}
      <div className="relative">
        <div className="bg-accent h-48 flex items-center justify-center">
            <img className="w-full h-full object-cover" src={cancha.imageUrl || `https://via.placeholder.com/400x300?text=${cancha.nombre}`} alt={`Cancha en ${cancha.nombre}`} />
        </div>
        {cancha.precioDesde && (
          <div className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-sm font-bold p-2 m-2 rounded-md">
            desde ${cancha.precioDesde.toLocaleString('es-AR')}
          </div>
        )}
      </div>

      {/* --- Área de Información --- */}
      <div className="p-4 text-light">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold font-lora">{cancha.nombre}</h3>
          <div className="flex items-center bg-primary px-2 py-1 rounded-full text-sm flex-shrink-0">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{cancha.puntaje?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-accent flex items-center mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {cancha.ubicacion}
        </p>

        {/* --- Área de Horarios Disponibles --- */}
        <div className="border-t border-primary mt-4 pt-4">
          {horariosDisponibles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {horariosDisponibles.map(hora => (
                <div key={hora} className="bg-accent text-secondary font-semibold py-1 px-3 rounded-md text-sm">
                  {hora}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-accent">No hay turnos próximos disponibles.</p>
          )}
        </div>

      </div>
    </Link>
  );
}

export default ResultadoCard;
