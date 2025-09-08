import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { calcularInfoReseñas } from '../utils/calculos.js';
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';
import CarruselReseñas from '../components/CarruselReseñas.jsx';

function ReservaPage() {
  const { canchaId } = useParams();
  const { user, isAuthenticated } = useAuth();
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
        
        // Cargar datos del deporte para obtener imágenes
        if (cancha.deporteId) {
          const deporteResponse = await fetch(`http://localhost:3000/api/deportes/${cancha.deporteId}`);
          if (deporteResponse.ok) {
            const deporteData = await deporteResponse.json();
            setDeporte(deporteData.deporte || deporteData);
          }
        }

        // Cargar reseñas de la cancha
        const reseñasResponse = await fetch(`http://localhost:3000/api/resenas/cancha/${canchaId}`);
        if (reseñasResponse.ok) {
          const reseñasData = await reseñasResponse.json();
          setReseñasDeLaCancha(reseñasData.resenas || reseñasData || []);
        }
        const turnosResponse = await fetch(`http://localhost:3000/api/turnos/cancha/${canchaId}`);
        if (!turnosResponse.ok) throw new Error('Error al cargar turnos');
        const turnosData = await turnosResponse.json();
        
        // Función auxiliar para obtener el día de la semana en español
        const obtenerDiaSemana = (fecha) => {
          const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
          const fechaObj = new Date(fecha);
          return diasSemana[fechaObj.getDay()];
        };

        // Función auxiliar para formatear hora desde ISO string
        const formatearHora = (horaISO) => {
          const fecha = new Date(horaISO);
          return fecha.toTimeString().slice(0, 5); // Formato HH:mm
        };
        
        const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => ({
          id: turno.id,
          dia: obtenerDiaSemana(turno.fecha),
          hora: formatearHora(turno.horaInicio),
          precio: turno.precio,
          estado: turno.reservado ? 'reservado' : 'disponible',
          fecha: turno.fecha
        }));
        
        setTurnos(turnosFormateados);
        
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
    
    // Usar reseñas reales si están disponibles, sino usar las estáticas para calcular info
    const infoReseñas = reseñasDeLaCancha.length > 0 
      ? {
          promedio: reseñasDeLaCancha.reduce((acc, r) => acc + r.puntaje, 0) / reseñasDeLaCancha.length,
          cantidad: reseñasDeLaCancha.length
        }
      : calcularInfoReseñas(parseInt(canchaId));
    
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
    
    // Construir URL de imagen basada en el deporte o usar imágenes de la cancha
    let imageUrl = '/images/futbol-1.jpg'; // imagen por defecto
    
    if (cancha.image && cancha.image.length > 0) {
      // Si la cancha tiene imágenes, usar la primera
      imageUrl = cancha.image[0];
    } else if (deporte && deporte.nombre) {
      // Si no hay imágenes de la cancha, usar imagen por deporte
      const deporteNormalizado = deporte.nombre.toLowerCase().replace(/\s+/g, '').replace('ú', 'u');
      imageUrl = `/images/${deporteNormalizado}-1.jpg`;
    }
    
    return {
      ...cancha,
      id: parseInt(canchaId),
      nroCancha: cancha.nroCancha, // Asegurar que use el campo correcto
      puntaje: infoReseñas.promedio,
      cantidadReseñas: infoReseñas.cantidad,
      imageUrl: imageUrl,
      turnos: turnos,
      complejo: complejoAdaptado
    };
  }, [cancha, deporte, turnos, canchaId, complejo, reseñasDeLaCancha]);

  const handleConfirmarReserva = async (turnoSeleccionado) => {
    if (!turnoSeleccionado || !cancha || !complejo) return false;
    
    // Verificar autenticación
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return false;
    }
    
    try {
      // Buscar el turno completo con su ID
      const turnoCompleto = turnos.find(t => 
        t.dia === turnoSeleccionado.dia && t.hora === turnoSeleccionado.hora
      );
      
      if (!turnoCompleto || !turnoCompleto.id) {
        alert('Error: No se pudo encontrar el turno seleccionado');
        return false;
      }

      // Llamar al backend para crear el alquiler/reserva
      const response = await fetch('http://localhost:3000/api/alquileres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: parseInt(user.id),
          turnosIds: [turnoCompleto.id]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const reservaData = await response.json();
      console.log('Reserva creada exitosamente:', reservaData);
      
      // Actualizar el estado del turno como reservado
      const response2 = await fetch(`http://localhost:3000/api/turnos/${turnoCompleto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservado: true }),
      });

      if (response2.ok) {
        // Actualizar estado local
        const nuevosTurnos = turnos.map(t => 
          t.id === turnoCompleto.id
            ? { ...t, estado: 'reservado' } 
            : t
        );
        setTurnos(nuevosTurnos);
        return true;
      } else {
        console.warn('Reserva creada pero no se pudo actualizar el estado del turno');
        return true;
      }
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      alert('Error al crear la reserva: ' + error.message);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Cargando cancha...</p>
        </div>
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
