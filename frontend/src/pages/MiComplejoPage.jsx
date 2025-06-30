import React from 'react';
import { useParams } from 'react-router-dom';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';
import ComplejoInfo from '../components/ComplejoInfo.jsx';
import ListaCanchasComplejo from '../components/ListaCanchasComplejo.jsx';

function MiComplejoPage() {
  const { complejoId } = useParams();
  const infoDelComplejo = datosComplejos.find(c => c.id === parseInt(complejoId));
  const canchasDelComplejo = datosDeportes
    .flatMap(deporte => 
      deporte.canchas.map(cancha => ({
        ...cancha,
        deporte: deporte.deporte 
      }))
    ) 
    .filter(cancha => cancha.complejoId === parseInt(complejoId));

  const ultimosAlquileres = [
    { id: 1, cancha: 'Cancha N°5', fecha: '29/06/2025', total: 28000 },
    { id: 2, cancha: 'Cancha N°1', fecha: '29/06/2025', total: 30000 },
    { id: 3, cancha: 'Cancha N°2', fecha: '28/06/2025', total: 28000 },
    { id: 4, cancha: 'Cancha N°5', fecha: '28/06/2025', total: 25000 },
  ];

  if (!infoDelComplejo) {
    return (
        <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
            <h1 className="text-2xl font-bold text-red-600">Error: Complejo no encontrado</h1>
        </div>
    );
  }

  return (
    <div className=" max-w-7xl mx-auto p-6 md:p-8 rounded-lg relative z-10">
      <h1 className="text-3xl font-bold font-lora text-gray-800 border-b border-gray-200 pb-4 mb-4">
        Mi Complejo
      </h1>
      <div className="flex flex-col md:flex-row -mx-4">
        <ComplejoInfo complejo={infoDelComplejo} alquileres={ultimosAlquileres} />
        <ListaCanchasComplejo canchas={canchasDelComplejo} />
      </div>
    </div>
  );
}

export default MiComplejoPage;