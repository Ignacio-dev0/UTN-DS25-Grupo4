import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL, getImageUrl, getCanchaImage } from '../config/api.js';



const CanchaCard = memo(function CanchaCard({ cancha }) {
  
  // Mapeo de deportes a iconos
  const deporteIconos = {
    'Fútbol 5': '⚽',
    'Fútbol 11': '🥅',
    'Básquet': '🏀',
    'Vóley': '🏐',
    'Tenis': '🎾',
    'Pádel': '🎾',
    'Hockey': '🏑',
    'Handball': '🤾'
  };
  
  // Usar el icono mapeado por nombre del deporte
  const deporteIcono = cancha.deporte?.icono || deporteIconos[cancha.deporte?.nombre] || '⚽';
  


  // Calculate minimum price from available turns
  // Usar el precio desde que viene del backend (más eficiente)
  const precioDesde = cancha.precioDesde > 0 ? cancha.precioDesde : null;


  return (
    <Link 
      to={`/reserva/${cancha.id}`} 
      className="block bg-secondary rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group relative"
    >
      <div className="absolute top-3 left-3 z-10 bg-secondary text-accent rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
        <span className="text-2xl">
          {deporteIcono}
        </span>
      </div>
      <div className="relative">
        <img 
          className="bg-accent w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" 
          src={getImageUrl(cancha.image?.[0]) || getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha)}
          onError={(e) => {
            // Fallback a imagen por defecto del deporte
            e.target.src = getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha);
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
        <h3 className="text-lg font-bold text-light font-lora">{cancha.complejo?.nombre}</h3>
        <p className="text-sm text-accent flex items-center mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {cancha.complejo?.domicilio?.localidad?.nombre} - Cancha N°{cancha.nroCancha}
        </p>
        {cancha.puntaje > 0 && (
          <div className="flex items-center mt-2">
            <div className="text-yellow-400 text-sm">
              {'★'.repeat(Math.floor(cancha.puntaje))}{'☆'.repeat(5 - Math.floor(cancha.puntaje))}
            </div>
            <span className="text-xs text-accent ml-2">
              {cancha.puntaje.toFixed(1)} {cancha.cantidadReseñas && `(${cancha.cantidadReseñas})`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
});

export default CanchaCard;