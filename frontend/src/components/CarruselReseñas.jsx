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

const CARD_WIDTH = 300; // ancho de tarjeta optimizado
const GAP = 24; // espacio entre tarjetas
const RESEÑAS_VISIBLES = 3; // Mostrar 3 reseñas a la vez

function CarruselReseñas({ reseñas }) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [direccion, setDireccion] = useState('siguiente');

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
    if (totalReseñas <= 1 || animando) return;
    setDireccion('anterior');
    setAnimando(true);
    
    setTimeout(() => {
      setIndiceActual((prevIndice) => 
        prevIndice === 0 ? totalReseñas - 1 : prevIndice - 1
      );
      setAnimando(false);
    }, 100);
  };

  const handleSiguiente = () => {
    if (totalReseñas <= 1 || animando) return;
    setDireccion('siguiente');
    setAnimando(true);
    
    setTimeout(() => {
      setIndiceActual((prevIndice) => 
        prevIndice === totalReseñas - 1 ? 0 : prevIndice + 1
      );
      setAnimando(false);
    }, 100);
  };

  return (
    <div className="mt-12 w-full px-4">
      <h3 className="text-2xl font-bold font-lora text-gray-800 mb-6 text-center">Opiniones de otros jugadores</h3>
      <div className="relative flex items-center justify-center gap-4 w-full max-w-7xl mx-auto">
        {/* Botón Anterior - mostrar siempre que haya más de 1 reseña */}
        {totalReseñas > 1 && (
          <button 
            onClick={handleAnterior}
            className="p-3 rounded-full bg-secondary shadow-lg hover:bg-primary active:scale-95 transition-all flex-shrink-0 z-10"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Ventana del Carrusel - muestra 3 reseñas a la vez */}
        <div className="overflow-hidden w-full max-w-5xl">
          {/* Track del Carrusel */}
          <div className={`flex gap-6 transition-all duration-500 ease-in-out ${
            animando 
              ? direccion === 'siguiente' 
                ? 'translate-x-[-50px] opacity-80' 
                : 'translate-x-[50px] opacity-80'
              : 'translate-x-0 opacity-100'
          }`}>
            {/* Renderizar 3 reseñas visibles con loop infinito */}
            {[0, 1, 2].map((offset) => {
              const index = (indiceActual + offset) % totalReseñas;
              const reseña = reseñas[index];
              
              return (
                <div 
                  key={`${reseña.id}-${offset}`}
                  className={`flex-shrink-0 w-[300px] h-[200px] bg-accent p-6 rounded-lg shadow-md flex flex-col justify-between transition-all duration-500 ${
                    animando 
                      ? 'scale-95'
                      : 'scale-100'
                  }`}
                >
                  {/* Contenido de la tarjeta */}
                  <div>
                    <p className="font-bold text-primary text-lg">{reseña.nombre}</p>
                    <div className="mt-2">
                      <StarRating puntaje={reseña.puntaje} />
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-sm leading-relaxed line-clamp-3 overflow-hidden">"{reseña.comentario}"</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón Siguiente - mostrar siempre que haya más de 1 reseña */}
        {totalReseñas > 1 && (
          <button 
            onClick={handleSiguiente}
            className="p-3 rounded-full bg-secondary shadow-lg hover:bg-primary active:scale-95 transition-all flex-shrink-0 z-10"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

export default CarruselReseñas;