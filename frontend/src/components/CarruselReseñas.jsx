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

const CARD_WIDTH = 300; // ancho de tarjeta
const GAP = 24; // espacio entre tarjetas
const RESEÑAS_VISIBLES = 3; // Mostrar 3 reseñas a la vez

function CarruselReseñas({ reseñas }) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!reseñas || reseñas.length === 0) {
    return (
      <div className="mt-12 text-center py-10 bg-accent rounded-lg">
        <h3 className="text-2xl font-bold font-lora text-primary mb-4">Reseñas</h3>
        <p className="text-secondary">Esta cancha aún no tiene reseñas. ¡Sé el primero en dejar una!</p>
      </div>
    );
  }

  const totalReseñas = reseñas.length;

  const handleAnterior = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setIndiceActual((prev) => {
      if (prev === 0) {
        return totalReseñas - 1;
      }
      return prev - 1;
    });
    
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleSiguiente = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setIndiceActual((prev) => {
      if (prev === totalReseñas - 1) {
        return 0;
      }
      return prev + 1;
    });
    
    setTimeout(() => setIsTransitioning(false), 600);
  };

  return (
    <div className="mt-12 w-full px-4">
      <h3 className="text-2xl font-bold font-lora text-gray-800 mb-6 text-center">Opiniones de otros jugadores</h3>
      <div className="relative flex items-center justify-center gap-4 w-full max-w-7xl mx-auto">
        {/* Botón Anterior */}
        {totalReseñas > 1 && (
          <button 
            onClick={handleAnterior}
            disabled={isTransitioning}
            className="p-3 rounded-full bg-secondary shadow-lg hover:bg-primary active:scale-95 transition-all flex-shrink-0 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Ventana del Carrusel */}
        <div className="overflow-hidden w-full max-w-5xl">
          {/* Track del Carrusel - efecto de deslizamiento real */}
          <div 
            className="flex gap-6 transition-transform duration-600 ease-out"
            style={{
              transform: `translateX(-${indiceActual * (CARD_WIDTH + GAP)}px)`
            }}
          >
            {/* Renderizar todas las reseñas + copias para efecto infinito */}
            {[...reseñas, ...reseñas.slice(0, RESEÑAS_VISIBLES)].map((reseña, idx) => (
              <div 
                key={`${reseña.id}-${idx}`}
                className="flex-shrink-0 w-[300px] h-[200px] bg-accent p-6 rounded-lg shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow"
              >
                {/* Contenido de la tarjeta */}
                <div>
                  <p className="font-bold text-primary text-lg">{reseña.nombre}</p>
                  <div className="mt-2">
                    <StarRating puntaje={reseña.puntaje} />
                  </div>
                </div>
                <p className="text-gray-700 italic text-sm leading-relaxed line-clamp-3 overflow-hidden">
                  "{reseña.comentario}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Siguiente */}
        {totalReseñas > 1 && (
          <button 
            onClick={handleSiguiente}
            disabled={isTransitioning}
            className="p-3 rounded-full bg-secondary shadow-lg hover:bg-primary active:scale-95 transition-all flex-shrink-0 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Indicadores de posición (opcional) */}
      {totalReseñas > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalReseñas }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setIndiceActual(idx);
                  setTimeout(() => setIsTransitioning(false), 600);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === indiceActual 
                  ? 'bg-secondary w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir a reseña ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CarruselReseñas;