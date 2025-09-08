import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calcularInfoReseñas } from '../utils/calculos.js';
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
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos dinámicos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      if (!canchaId) return;
      
      try {
        setLoading(true);
        
        // Cargar datos de la cancha
        const canchaResponse = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
        if (!canchaResponse.ok) throw new Error('Error al cargar cancha');
        const canchaData = await canchaResponse.json();
        
        const cancha = canchaData.cancha || canchaData;
        setCancha(cancha);
        
        // Cargar datos del complejo
        if (cancha.complejoId) {
          const complejoResponse = await fetch(`http://localhost:3000/api/complejos/${cancha.complejoId}`);
          if (!complejoResponse.ok) throw new Error('Error al cargar complejo');
          const complejoData = await complejoResponse.json();
          setComplejo(complejoData.complejo || complejoData);
        }
        
        // Cargar HORARIOS (cronograma semanal) en lugar de turnos específicos
        const horariosResponse = await fetch(`http://localhost:3000/api/horarios/cancha/${canchaId}`);
        if (!horariosResponse.ok) throw new Error('Error al cargar horarios');
        const horariosData = await horariosResponse.json();
        
        // Mapear días en español para compatibilidad con el calendario
        const mapaDias = {
          'MONDAY': 'LUNES',
          'TUESDAY': 'MARTES', 
          'WEDNESDAY': 'MIÉRCOLES',
          'THURSDAY': 'JUEVES',
          'FRIDAY': 'VIERNES',
          'SATURDAY': 'SÁBADO',
          'SUNDAY': 'DOMINGO'
        };
        
        const horariosFormateados = (horariosData.horarios || horariosData || []).map(horario => ({
          dia: mapaDias[horario.diaSemana] || horario.diaSemana,
          hora: horario.horaInicio,
          precio: horario.precio || 15000,
          estado: 'disponible' // Los horarios siempre están disponibles para reservar
        }));
        
        setTurnos(horariosFormateados);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [canchaId]);

  const canchaMostrada = useMemo(() => {
    if (!cancha || !complejo) return null;
    
    // Usar reseñas estáticas para calcular info
    const infoReseñas = calcularInfoReseñas(parseInt(canchaId));
    
    // Adaptar datos para compatibilidad con componentes
    const complejoAdaptado = {
      ...complejo,
      servicios: ['Estacionamiento', 'Vestuarios', 'Wi-Fi'], // Servicios por defecto
      horarios: 'No especificado',
      ubicacion: complejo && complejo.domicilio 
        ? `${complejo.domicilio.calle || ''} ${complejo.domicilio.altura || ''}, ${complejo.domicilio.localidad?.nombre || ''}`.trim()
        : 'Ubicación no especificada',
      lat: -34.9214, // Coordenadas por defecto de La Plata
      lng: -57.9545
    };
    
    return {
      ...cancha,
      id: parseInt(canchaId),
      nroCancha: cancha.nroCancha, // Asegurar que use el campo correcto
      puntaje: infoReseñas.promedio,
      cantidadReseñas: infoReseñas.cantidad,
      // Construir URL de imagen basada en el deporte
      imageUrl: deporte ? `/images/${deporte.nombre.toLowerCase().replace(' ', '')}-1.jpg` : '/images/futbol-1.jpg',
      turnos: turnos,
      complejo: complejoAdaptado
    };
  }, [cancha, deporte, turnos, canchaId, complejo]);

  const handleConfirmarReserva = async (turnoSeleccionado) => {
    if (!turnoSeleccionado || !cancha || !complejo) return false;
    
    try {
      // Aquí puedes implementar la lógica de reserva en el backend
      console.log('Reserva confirmada:', {
        turno: turnoSeleccionado,
        cancha: cancha,
        complejo: complejo
      });
      
      // Actualizar estado local
      const nuevosTurnos = turnos.map(t => 
        t.id === turnoSeleccionado.id
          ? { ...t, estado: 'reservado' } 
          : t
      );
      setTurnos(nuevosTurnos);
      return true;
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-2xl -mt-20 relative z-10">
        <h1 className="text-2xl font-bold text-blue-600">Cargando información de la cancha...</h1>
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
        <InfoCancha cancha={canchaMostrada} complejo={canchaMostrada.complejo} deporte={deporte?.nombre} />
        <CalendarioTurnos turnosDisponibles={turnos || []} onConfirmarReserva={handleConfirmarReserva} />
        <CarruselReseñas reseñas={reseñasDeLaCancha} />
      </div>
    </div>
  );
}

export default ReservaPage;
