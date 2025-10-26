import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../config/api.js';

function MiniCanchaCard({ cancha, onAction, isEditing }) {
  // Usar el icono del backend directamente
  const deporteIcono = cancha.deporte?.icono || '⚽';
  const [imageError, setImageError] = useState(false);
  
  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Soportar tanto cancha.imagenes como cancha.image
    const imageArray = cancha.imagenes || cancha.image || [];
    
    console.log(`🖼️ [MINICANCHACARD] Cancha ${cancha.id} getImageUrl:`, {
      tieneImagenes: !!cancha.imagenes,
      tieneImage: !!cancha.image,
      lengthImagenes: cancha.imagenes?.length || 0,
      lengthImage: cancha.image?.length || 0,
      usandoArray: imageArray.length,
      primerImagen: imageArray[0]?.substring(0, 50) || 'sin imagen'
    });
    
    if (!imageArray || imageArray.length === 0) {
      console.log(`🖼️ [MINICANCHACARD] Cancha ${cancha.id}: NO HAY IMÁGENES - usando placeholder`);
      return '/canchaYa.png';
    }
    
    const firstImage = imageArray[0];
    
    // Si es base64, usarla directamente
    if (firstImage && firstImage.startsWith('data:image')) {
      console.log(`🖼️ [MINICANCHACARD] Cancha ${cancha.id}: USANDO BASE64`);
      return firstImage;
    }
    
    // Si es un archivo estático (nombre de archivo como "futbol11_2.jpg")
    if (firstImage && (firstImage.includes('.jpg') || firstImage.includes('.png') || firstImage.includes('.jpeg'))) {
      const imageUrl = `${API_BASE_URL.replace('/api', '')}/images/canchas/${firstImage}`;
      console.log(`🖼️ [MINICANCHACARD] Cancha ${cancha.id}: USANDO ARCHIVO ESTÁTICO - ${imageUrl}`);
      return imageUrl;
    }
    
    // Si no es ni base64 ni archivo, usar placeholder
    console.log(`🖼️ [MINICANCHACARD] Cancha ${cancha.id}: FORMATO DESCONOCIDO - usando placeholder`);
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
            src={imageError ? '/canchaYa.png' : getImageUrl()}
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