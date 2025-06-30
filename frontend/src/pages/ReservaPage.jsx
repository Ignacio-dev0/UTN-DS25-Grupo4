// src/pages/ReservaPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';

function ReservaPage() {
  const { canchaId } = useParams();

  let canchaSeleccionada = null;
  let complejoDeLaCancha = null;
  let deporteDeLaCancha = null; 

  for (const deporte of datosDeportes) {
    const encontrada = deporte.canchas.find(c => c.id === parseInt(canchaId));
    if (encontrada) {
      canchaSeleccionada = encontrada;
      deporteDeLaCancha = deporte.deporte;
      break;
    }
  }

  if (canchaSeleccionada) {
    complejoDeLaCancha = datosComplejos.find(c => c.id === canchaSeleccionada.complejoId);
  }

  if (!canchaSeleccionada || !complejoDeLaCancha) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-2xl -mt-20 relative z-10">
        <h1 className="text-2xl font-bold text-red-600">Error: Cancha no encontrada</h1>
        <p className="text-gray-800 mt-4">No se pudo encontrar la información para la cancha con ID: {canchaId}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
      <div className="space-y-12">
        <h1 className="text-3xl font-bold font-lora text-gray-800 border-b pb-4">
          Reserva en: {complejoDeLaCancha.nombre}
        </h1>
        
        {/* Le pasamos la URL de la imagen principal al componente de la galería */}
        <GaleriaFotos imageUrl={canchaSeleccionada.imageUrl} />

        <InfoCancha 
            cancha={canchaSeleccionada} 
            complejo={complejoDeLaCancha} 
            deporte={deporteDeLaCancha} 
        />
        <CalendarioTurnos turnosDisponibles={canchaSeleccionada.turnos || []} />

        <div>
            <h3 className="text-xl font-bold mb-2">Reseñas</h3>
            <div className="bg-accent p-4 rounded-lg h-24">
                <p className="text-primary">Placeholder para reseñas...</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ReservaPage;