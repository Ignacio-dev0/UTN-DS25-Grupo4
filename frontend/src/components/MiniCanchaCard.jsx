import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';

function MiniCanchaCard({ cancha, onAction, isEditing }) {
  // Usar el icono del backend directamente
  const deporteIcono = cancha.deporte?.icono || '⚽';
  const [imageError, setImageError] = useState(false);
  
  // Función para obtener la URL de la imagen
  const getImageUrl = (image) => {
    if (!image || image.length === 0) return '/canchaYa.png';
    const firstImage = image[0];
    // Si es base64, usarla directamente
    if (firstImage.startsWith('data:image')) return firstImage;
    // Si es un nombre de archivo, intentar cargar desde el servidor
    if (firstImage.includes('.jpg') || firstImage.includes('.png') || firstImage.includes('.jpeg')) {
      return `http://localhost:3000/images/canchas/${firstImage}`;
    }
    return '/canchaYa.png';
  };

  const cardClasses = `block rounded-lg shadow-lg overflow-hidden transition-all duration-300 group relative ${
    cancha.estado === 'deshabilitada' 
    ? 'bg-gray-300'
    : 'bg-secondary hover:shadow-2xl transform hover:-translate-y-1'
  }`;

  // ✅ Usar el precioDesde que viene del backend (ya está actualizado por recalcularPrecioDesde)
  const precioDesde = cancha.precioDesde > 0 ? cancha.precioDesde : null;

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
            src={imageError ? '/canchaYa.png' : getImageUrl(cancha.image)}
            alt={`Cancha ${cancha.nroCancha}`}
            onError={() => setImageError(true)}
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