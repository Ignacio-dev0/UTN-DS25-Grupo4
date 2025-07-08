import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';


const StarRating = ({ puntaje }) => {
  const estrellas = [];
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= puntaje) {
      estrellas.push(<StarIcon key={`full-${i}`} className="w-5 h-5 text-canchaYellow" />);
    } else if (i - 0.5 <= puntaje) {
      estrellas.push(
        <div key={`half-${i}`} className="relative">
          <StarIcon className="w-5 h-5 text-gray-300" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="w-5 h-5 text-canchaYellow" />
          </div>
        </div>
      );
    } else {
      estrellas.push(<StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
  }
  return <div className="flex">{estrellas}</div>;
};

function CarruselReseñas({ reseñas }) {
  if (!reseñas || reseñas.length === 0) {
    return (
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold font-lora text-gray-800 mb-4">Reseñas</h3>
        <p className="text-gray-500">Esta cancha aún no tiene reseñas. ¡Sé el primero en dejar una!</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold font-lora text-gray-800 mb-6 text-center">Opiniones de otros jugadores</h3>
      <div className="relative w-full overflow-hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-6">
          {reseñas.map((reseña) => (
            <div key={reseña.id} className="snap-center flex-shrink-0 w-80 bg-accent p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex-grow">
                  <p className="font-bold text-primary">{reseña.nombre}</p>
                  <StarRating puntaje={reseña.puntaje} />
                </div>
              </div>
              <p className="text-gray-700 italic">"{reseña.comentario}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarruselReseñas;