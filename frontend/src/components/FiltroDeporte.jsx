import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { FaStar } from "react-icons/fa";

const DEPORTES_VISIBLES = 6;

function FiltroDeporte({ deporteSeleccionado, onSelectDeporte, deportes = [] }) {
  const [indiceActual, setIndiceActual] = useState(0);
  
  const listaCompletaDeportes = useMemo(() => {
    // Validar que deportes sea un array antes de mapear
    const deportesArray = Array.isArray(deportes) ? deportes : [];
    const deportesFormateados = deportesArray.map(deporte => ({
      id: deporte.id,
      deporte: deporte.nombre,
      icono: deporte.icono || '⚽'
    }));
    
    return [
      { id: 'populares', deporte: 'Populares', icono: '⭐' },
      ...deportesFormateados,
    ];
  }, [deportes]);

  const totalItems = listaCompletaDeportes.length;

  const handleSiguiente = () => {
    if (indiceActual >= totalItems - DEPORTES_VISIBLES) {
      setIndiceActual(0);
    } else {
      setIndiceActual(prevIndice => prevIndice + 1);
    }
  };

  const handleAnterior = () => {
    if (indiceActual === 0) {
      setIndiceActual(totalItems - DEPORTES_VISIBLES);
    } else {
      setIndiceActual(prevIndice => prevIndice - 1);
    }
  };
  

  const itemTotalWidth = 80 + 24; 
  const windowWidth = (DEPORTES_VISIBLES * 80) + ((DEPORTES_VISIBLES - 1) * 24);

  return (
    <div className="flex justify-center items-center w-full mx-auto py-4">

      <button 
        onClick={handleAnterior}
        className="p-2 rounded-full transition-colors flex-shrink-0"
      >
        <ChevronLeftIcon className="w-6 h-6 text-secondary" />
      </button>

      <div className="overflow-hidden" style={{ width: `${windowWidth}px` }}>
        {/* "Track" del Carrusel: Contenedor que se mueve */}
        <div
          className="flex gap-6 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${indiceActual * itemTotalWidth}px)` }}
        >
          {listaCompletaDeportes.map((deporte) => (
            <button 
              key={deporte.id}
              onClick={() => onSelectDeporte(deporte.deporte)}
              className={`flex flex-col items-center text-gray-700 hover:text-black w-20 transition-colors group flex-shrink-0 ${deporteSeleccionado === deporte.deporte ? 'font-bold' : ''}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 transition-colors ${deporteSeleccionado === deporte.deporte ? 'bg-secondary text-accent' : 'bg-accent text-secondary group-hover:bg-white'}`}>
                <span className="text-2xl">{deporte.icono}</span>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">{deporte.deporte}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Botón de Navegación "Siguiente" */}
      <button 
        onClick={handleSiguiente}
        className="p-2 rounded-full transition-colors flex-shrink-0"
      >
        <ChevronRightIcon className="w-6 h-6 text-secondary" />
      </button>
    </div>
  );
}

export default FiltroDeporte;