import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { getImageUrl, getPlaceholderImage } from '../config/api.js';

function CanchaCard({ cancha }) {
  // Usar datos transformados del backend
  const horariosDisponibles = cancha.turnos?.filter(t => !t.reservado).slice(0, 5).map(t => {
    const fecha = new Date(t.horaInicio);
    return fecha.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  }) || [];
  
  // Usar el icono del backend directamente
  const deporteIcono = cancha.deporte?.icono || '⚽';

  // Calcular precio mínimo de los turnos disponibles
  const precioDesde = cancha.turnos?.length > 0 ? 
    Math.min(...cancha.turnos.filter(t => !t.reservado).map(t => t.precio)) : null;

  return (
    <Link to={`/reserva/${cancha.id}`} className="block bg-secondary rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group relative">
      <div className="absolute top-3 left-3 z-10 bg-secondary text-accent rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
        <span className="text-2xl">
          {deporteIcono}
        </span>
      </div>
      <div className="relative">
        <img 
          className="bg-accent w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" 
          src={getImageUrl(cancha.image?.[0]) || getPlaceholderImage(cancha.deporte?.nombre || 'Cancha')}
          onError={(e) => {
            // Crear un SVG placeholder inline
            e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e5e7eb"/><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">${cancha.deporte?.nombre || 'Cancha'}</text></svg>`)}`;
          }}
          alt={`Cancha de ${cancha.deporte?.nombre}`}
        />
        {precioDesde && (
          <div className="absolute top-0 right-0 bg-secondary bg-opacity-60 text-light text-sm font-bold p-2 m-2 rounded-md">
            desde ${precioDesde.toLocaleString('es-AR')}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-light font-lora">{cancha.complejo?.nombre}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje > 0 ? cancha.puntaje.toFixed(1) : 'Nuevo'}</span>
            </div>
        </div>
        <p className="text-sm text-accent flex items-center mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {cancha.complejo?.domicilio?.localidad?.nombre} - Cancha N°{cancha.nroCancha}
        </p>
        <div className="border-t border-light mt-4 pt-4">
          {horariosDisponibles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {horariosDisponibles.map((hora, index) => (
                <div key={`${cancha.id}-${hora}-${index}`} className="bg-light text-secondary font-semibold py-1 px-3 rounded-md text-sm">
                  {hora}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-accent">Sin turnos próximos.</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CanchaCard;