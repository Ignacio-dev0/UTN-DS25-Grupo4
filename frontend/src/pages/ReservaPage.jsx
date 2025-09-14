import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // 👈 Importamos Link
import { crearReserva } from '../data/reservas.js';
import { datosReseñas } from '../data/reseñas.js';
import { calcularInfoReseñas } from '../utils/calculos.js';
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';
import CarruselReseñas from '../components/CarruselReseñas.jsx';
import { API_BASE_URL } from '../config/api';

function ReservaPage() {
  const { canchaId } = useParams();
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);
  const [deporte, setDeporte] = useState(null);
  const [reseñasDeLaCancha, setReseñasDeLaCancha] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosCancha = async () => {
      try {
        setLoading(true);
        
        // Cargar datos de la cancha
        const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`);
        if (!canchaResponse.ok) throw new Error('Error al cargar la cancha');
        const canchaData = await canchaResponse.json();
        
        // Cargar datos del complejo
        const complejoResponse = await fetch(`${API_BASE_URL}/complejos/${canchaData.cancha.complejoId}`);
        if (!complejoResponse.ok) throw new Error('Error al cargar el complejo');
        const complejoData = await complejoResponse.json();
        
        // Cargar datos del deporte
        const deporteResponse = await fetch(`${API_BASE_URL}/deportes/${canchaData.cancha.deporteId}`);
        if (!deporteResponse.ok) throw new Error('Error al cargar el deporte');
        const deporteData = await deporteResponse.json();
        
        // Cargar turnos de la cancha para los próximos 7 días
        const hoy = new Date();
        const fechaStr = hoy.toISOString().split('T')[0];
        const turnosResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}?fecha=${fechaStr}`);
        if (!turnosResponse.ok) throw new Error('Error al cargar los turnos');
        const turnosData = await turnosResponse.json();
        
        setCancha(canchaData.cancha);
        setComplejo(complejoData.complejo);
        setDeporte(deporteData.deporte);
        setTurnos(turnosData.turnos || []);
        setReseñasDeLaCancha(datosReseñas.filter(r => r.canchaId === parseInt(canchaId)));
        
      } catch (err) {
        setError(err.message);
        console.error('Error cargando datos de la cancha:', err);
      } finally {
        setLoading(false);
      }
    };

    if (canchaId) {
      cargarDatosCancha();
    }
  }, [canchaId]);

  // Convertir turnos del backend al formato que espera el calendario
  const turnosFormateados = useMemo(() => {
    if (!turnos.length) return [];
    
    return turnos.map(turno => {
      const fecha = new Date(turno.fecha);
      const horaInicio = new Date(turno.horaInicio);
      
      // Obtener día de la semana en español
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const dia = diasSemana[fecha.getDay()];
      
      // Formatear hora
      const hora = horaInicio.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      });
      
      return {
        dia,
        hora,
        precio: turno.precio,
        estado: turno.reservado ? 'reservado' : 'disponible',
        id: turno.id
      };
    });
  }, [turnos]);

  const canchaMostrada = useMemo(() => {
    if (!cancha) return null;
    const infoReseñas = calcularInfoReseñas(cancha.id);
    return {
      ...cancha,
      puntaje: infoReseñas.promedio,
      cantidadReseñas: infoReseñas.cantidad,
      turnos: turnosFormateados
    };
  }, [cancha, turnosFormateados]);

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

  if (loading) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-2xl -mt-20 relative z-10">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-gray-600">Cargando datos de la cancha...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-2xl -mt-20 relative z-10">
        <h1 className="text-2xl font-bold text-red-600">Error: {error}</h1>
        <p className="text-gray-600 mt-2">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

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
          Reserva en: 
          <Link to={`/complejo/${complejo.id}`} className="text-secondary hover:underline ml-2">
            {complejo.nombre}
          </Link>
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