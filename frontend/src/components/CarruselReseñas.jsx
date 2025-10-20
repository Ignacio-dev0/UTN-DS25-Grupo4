import React, { useState } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const StarRating = ({ puntaje }) => {
  const estrellas = [];
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= puntaje) {
      estrellas.push(<StarIcon key={`full-${i}`} className="w-5 h-5 text-yellow-400" />);
    } else if (i - 0.5 <= puntaje) {
      estrellas.push(
        <div key={`half-${i}`} className="relative">
          <StarIcon className="w-5 h-5 text-gray-300" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      );
    } else {
      estrellas.push(<StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
  }
  return <div className="flex">{estrellas}</div>;
};

const RESEÑAS_VISIBLES = 4; 

function CarruselReseñas({ reseñas }) {
  const [indiceActual, setIndiceActual] = useState(0);

  if (!reseñas || reseñas.length === 0) {
    return (
      <div className="mt-12 text-center py-10 bg-accent rounded-lg">
        <h3 className="text-2xl font-bold font-lora text-primary mb-4">Reseñas</h3>
        <p className="text-secondary">Esta cancha aún no tiene reseñas. ¡Sé el primero en dejar una!</p>
      </div>
    );
  }

  const totalReseñas = reseñas.length;
  
  const CARD_WIDTH = 256; // ancho de tarjeta
  const GAP = 24; // espacio entre tarjetas
  
  // Si hay menos o igual a RESEÑAS_VISIBLES, mostrar todas sin scroll
  const reseñasAMostrar = Math.min(totalReseñas, RESEÑAS_VISIBLES);
  
  // Calcular el ancho de la ventana basado en las reseñas visibles
  const windowWidth = (reseñasAMostrar * CARD_WIDTH) + ((reseñasAMostrar - 1) * GAP);

  const handleAnterior = () => {
    // Si hay pocas reseñas, no hacer nada
    if (totalReseñas <= RESEÑAS_VISIBLES) return;
    
    setIndiceActual((prevIndice) => {
      const maxIndex = Math.max(0, totalReseñas - RESEÑAS_VISIBLES);
      // Loop infinito: si estamos en el inicio (0), volver al final
      return prevIndice === 0 ? maxIndex : prevIndice - 1;
    });
  };

  const handleSiguiente = () => {
    // Si hay pocas reseñas, no hacer nada
    if (totalReseñas <= RESEÑAS_VISIBLES) return;
    
    setIndiceActual((prevIndice) => {
      const maxIndex = Math.max(0, totalReseñas - RESEÑAS_VISIBLES);
      // Loop infinito: si estamos en el final, volver al inicio (0)
      return prevIndice >= maxIndex ? 0 : prevIndice + 1;
    });
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold font-lora text-gray-800 mb-6 text-center">Opiniones de otros jugadores</h3>
      <div className="flex items-center justify-center gap-2">
        {/* Botón Anterior - solo mostrar si hay más reseñas que el límite visible */}
        {totalReseñas > RESEÑAS_VISIBLES && (
          <button 
            onClick={handleAnterior}
            className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-all flex-shrink-0 border-2 border-secondary"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-8 h-8 text-secondary" />
          </button>
        )}

        {/* Ventana del Carrusel */}
        <div className="overflow-hidden" style={{ width: `${windowWidth}px` }}>
          {/* Track del Carrusel */}
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${indiceActual * (CARD_WIDTH + GAP)}px)` }}
          >
            {reseñas.map((reseña) => (
              // Contenedor de cada tarjeta de reseña
              <div key={reseña.id} className="flex-shrink-0 w-64 h-48 bg-accent p-6 rounded-lg shadow-md flex flex-col justify-center">
                {/* Contenido de la tarjeta */}
                <p className="font-bold text-primary text-lg">{reseña.nombre}</p>
                <div className="my-2">
                  <StarRating puntaje={reseña.puntaje} />
                </div>
                <p className="text-gray-700 italic text-sm leading-tight">"{reseña.comentario}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Siguiente - solo mostrar si hay más reseñas que el límite visible */}
        {totalReseñas > RESEÑAS_VISIBLES && (
          <button 
            onClick={handleSiguiente}
            className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-all flex-shrink-0 border-2 border-secondary"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-8 h-8 text-secondary" />
          </button>
        )}
      </div>
    </div>
  );
}

export default CarruselReseñas;