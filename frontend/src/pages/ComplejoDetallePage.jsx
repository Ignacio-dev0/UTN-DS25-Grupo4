import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { datosComplejos } from '../data/complejos.js';
import { datosDeportes } from '../data/canchas.js';
import CanchaCard from '../components/CanchaCard.jsx';
import { FaArrowLeft } from 'react-icons/fa';

function ComplejoDetallePage() {
  const { complejoId } = useParams();
  const complejo = datosComplejos.find(c => c.id === parseInt(complejoId));


  const canchasDelComplejo = datosDeportes.flatMap(deporte =>
    deporte.canchas
      .filter(cancha => cancha.complejoId === parseInt(complejoId))
      .map(cancha => ({ ...cancha, deporte: deporte.deporte })) 
  );

  if (!complejo) {
    return <div className="text-center p-10"><h1>Complejo no encontrado.</h1></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-2 mb-4">
          <FaArrowLeft /> Volver al inicio
        </Link>
        <h1 className="text-4xl font-bold font-lora text-primary">{complejo.nombre}</h1>
        <p className="text-lg text-secondary mt-2">{complejo.ubicacion}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-secondary mb-6">Nuestras Canchas</h2>
        {canchasDelComplejo.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {canchasDelComplejo.map(cancha => (
              <CanchaCard key={cancha.id} cancha={cancha} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Este complejo aún no tiene canchas cargadas.</p>
        )}
      </div>
    </div>
  );
}

export default ComplejoDetallePage;