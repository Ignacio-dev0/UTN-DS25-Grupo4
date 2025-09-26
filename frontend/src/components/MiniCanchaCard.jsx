import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getImageUrl, getCanchaImage } from '../config/api.js';

function MiniCanchaCard({ cancha, onAction, isEditing }) {
  // Usar el icono del backend directamente
  const deporteIcono = cancha.deporte?.icono || '⚽';

  const cardClasses = `block rounded-lg shadow-lg overflow-hidden transition-all duration-300 group relative ${
    cancha.estado === 'deshabilitada' 
    ? 'bg-gray-300'
    : 'bg-secondary hover:shadow-2xl transform hover:-translate-y-1'
  }`;

  // Función para calcular el precio más barato de la cancha
  const precioDesde = React.useMemo(() => {
    if (!cancha.cronograma || !Array.isArray(cancha.cronograma) || cancha.cronograma.length === 0) {
      return null;
    }
    
    const precios = cancha.cronograma
      .map(c => Number(c.precio))
      .filter(precio => !isNaN(precio) && precio > 0);
    
    return precios.length > 0 ? Math.min(...precios) : null;
  }, [cancha.cronograma]);

  return (
    <div className={cardClasses}>
      <Link to={`/reserva/${cancha.id}`} className={cancha.estado === 'deshabilitada' ? 'pointer-events-none' : ''}>
        {deporteIcono && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-accent rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-white">
            <span className="text-xl">{deporteIcono}</span>
          </div>
        )}
        <div className="relative">
          <img 
            className={`bg-accent w-full h-40 object-cover ${cancha.estado !== 'deshabilitada' ? 'transform group-hover:scale-105' : ''} transition-transform duration-300`} 
            src={
              (cancha.image && cancha.image.length > 0) 
                ? getImageUrl(cancha.image[0]) 
                : getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha)
            } 
            alt={`Cancha ${cancha.nroCancha}`}
            onError={(e) => {
              e.target.src = getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha);
            }}
          />
          {cancha.estado === 'deshabilitada' && (
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          )}
          {precioDesde && (
            <div className="absolute top-2 right-2 bg-secondary bg-opacity-80 text-light text-xs font-bold p-1 rounded">
              desde ${precioDesde.toLocaleString('es-AR')}
            </div>
          )}
        </div>
      </Link>
      
      {isEditing && (
        <button 
          onClick={() => onAction(cancha)}
          className="absolute top-2 right-2 z-20 bg-primary bg-opacity-50 text-white rounded-full p-1 hover:bg-canchaRed transition-colors"
          title="Gestionar cancha"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
      
      <div className={`p-4 ${cancha.estado === 'deshabilitada' ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-light font-lora">Cancha N°{cancha.nroCancha}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje > 0 ? cancha.puntaje.toFixed(1) : 'Nuevo'}</span>
            </div>
        </div>
        <p className="text-sm text-accent mt-1 truncate">{cancha.descripcion}</p>
        <p className="text-xs text-accent mt-1">{cancha.deporte?.nombre}</p>
      </div>
    </div>
  );
}

export default MiniCanchaCard;