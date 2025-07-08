import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

function ModalReseña({ reserva, onGuardar, onCerrar }) {
  const [puntaje, setPuntaje] = useState(0);
  const [hover, setHover] = useState(0); // Estado para previsualizar el puntaje con el mouse
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (puntaje === 0) {
      alert('Por favor, selecciona una puntuación.');
      return;
    }
    onGuardar({
      reservaId: reserva.id,
      puntaje,
      comentario,
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-primary">Deja tu reseña</h2>
        <p className="text-md text-secondary mb-6">
          Tu opinión sobre <span className="font-bold">{reserva.complejo} - {reserva.cancha}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="font-semibold text-center mb-2">Tu puntuación: {hover || puntaje || '?'}</p>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const displayRating = hover || puntaje;

                return (
                  <div
                    key={ratingValue}
                    className="relative cursor-pointer"
                    onMouseLeave={() => setHover(0)}
                  >
                    <div className="absolute w-full h-full flex z-10">
                      <div
                        className="w-1/2 h-full"
                        onMouseEnter={() => setHover(ratingValue - 0.5)}
                        onClick={() => setPuntaje(ratingValue - 0.5)}
                      />
                      <div
                        className="w-1/2 h-full"
                        onMouseEnter={() => setHover(ratingValue)}
                        onClick={() => setPuntaje(ratingValue)}
                      />
                    </div>

                    <StarIcon className="w-10 h-10 text-gray-300" />

                    <div
                      className="absolute top-0 left-0 h-full overflow-hidden"
                      style={{ width: displayRating >= ratingValue ? '100%' : (displayRating >= ratingValue - 0.5 ? '50%' : '0%') }}
                    >
                      <StarIcon className="w-10 h-10 text-canchaYellow" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Campo de Comentario */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">Comentario (opcional)</label>
            <textarea
              id="comentario"
              name="comentario"
              rows="4"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="¿Qué te pareció la cancha, la atención, las instalaciones?"
            ></textarea>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onCerrar} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="bg-secondary text-light font-bold py-2 px-4 rounded-lg hover:bg-primary">
              Enviar Reseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalReseña;