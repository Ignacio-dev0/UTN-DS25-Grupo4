import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';
import { crearReserva } from '../data/reservas.js';
import { datosReseñas } from '../data/reseñas.js';
import { calcularInfoReseñas } from '../utils/calculos.js'; // Importamos la función de cálculo
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';
import CarruselReseñas from '../components/CarruselReseñas.jsx';

function ReservaPage() {
  const { canchaId } = useParams();
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);
  const [deporte, setDeporte] = useState(null);
  const [reseñasDeLaCancha, setReseñasDeLaCancha] = useState([]);

  useEffect(() => {
    let canchaEncontrada = null;
    let deporteDeLaCancha = null;
    let complejoDeLaCancha = null;
    
    for (const d of datosDeportes) {
      const encontrada = d.canchas.find(c => c.id === parseInt(canchaId));
      if (encontrada) {
        canchaEncontrada = encontrada;
        deporteDeLaCancha = d.deporte;
        break;
      }
    }

    if (canchaEncontrada) {
      complejoDeLaCancha = datosComplejos.find(c => c.id === canchaEncontrada.complejoId);
    }
    
    setCancha(canchaEncontrada);
    setComplejo(complejoDeLaCancha);
    setDeporte(deporteDeLaCancha);
    setReseñasDeLaCancha(datosReseñas.filter(r => r.canchaId === parseInt(canchaId)));
  }, [canchaId]);

  const canchaMostrada = useMemo(() => {
    if (!cancha) return null;
    const infoReseñas = calcularInfoReseñas(cancha.id);
    return {
      ...cancha,
      puntaje: infoReseñas.promedio,
      cantidadReseñas: infoReseñas.cantidad,
    };
  }, [cancha]);

  const handleConfirmarReserva = (turnoSeleccionado) => {
    if (!turnoSeleccionado || !cancha || !complejo) return false;
    crearReserva(turnoSeleccionado, cancha, complejo);
    const nuevosTurnos = cancha.turnos.map(t => 
        t.dia === turnoSeleccionado.dia && t.hora === turnoSeleccionado.hora 
            ? { ...t, estado: 'reservado' } 
            : t
    );
    setCancha({ ...cancha, turnos: nuevosTurnos });
    return true;
  };

  if (!canchaMostrada || !complejo) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-2xl -mt-20 relative z-10">
        <h1 className="text-2xl font-bold text-red-600">Error: Cancha no encontrada</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
      <div className="space-y-12">
        <h1 className="text-3xl font-bold font-lora text-gray-800 border-b pb-4">
          Reserva en: {complejo.nombre}
        </h1>
        <GaleriaFotos imageUrl={canchaMostrada.imageUrl} />
        <InfoCancha cancha={canchaMostrada} complejo={complejo} deporte={deporte} />
        <CalendarioTurnos turnosDisponibles={canchaMostrada.turnos || []} onConfirmarReserva={handleConfirmarReserva} />
        <CarruselReseñas reseñas={reseñasDeLaCancha} />
      </div>
    </div>
  );
}

export default ReservaPage;