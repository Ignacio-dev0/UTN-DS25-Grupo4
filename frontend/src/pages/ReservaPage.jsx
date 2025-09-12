import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { calcularInfoReseñas } from '../utils/calculos.js';
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';
import CarruselReseñas from '../components/CarruselReseñas.jsx';
import { API_BASE_URL, getImageUrl, getCanchaImage } from '../config/api.js';

// Función helper para construir la dirección completa
const buildLocationString = (domicilio) => {
  if (!domicilio) return 'Ubicación no especificada';
  
  const partes = [];
  
  // Agregar calle y altura
  if (domicilio.calle) {
    if (domicilio.altura) {
      partes.push(`${domicilio.calle} ${domicilio.altura}`);
    } else {
      partes.push(domicilio.calle);
    }
  }
  
  // Agregar localidad
  if (domicilio.localidad?.nombre) {
    partes.push(domicilio.localidad.nombre);
  }
  
  return partes.length > 0 ? partes.join(', ') : 'Ubicación no especificada';
};

// Función helper para obtener coordenadas aproximadas por localidad
const getCoordinatesForLocation = (domicilio) => {
  // Coordenadas por defecto (La Plata centro)
  let lat = -34.9214;
  let lng = -57.9545;
  
  if (domicilio?.localidad?.nombre) {
    const localidad = domicilio.localidad.nombre.toLowerCase();
    
    // Coordenadas aproximadas para distintas localidades del Gran La Plata
    const coordenadasLocalidades = {
      'la plata': { lat: -34.9214, lng: -57.9545 },
      'berisso': { lat: -34.8713, lng: -57.8794 },
      'ensenada': { lat: -34.8670, lng: -57.9123 },
      'city bell': { lat: -34.8617, lng: -58.0470 },
      'gonnet': { lat: -34.8742, lng: -58.0171 },
      'villa elisa': { lat: -34.8442, lng: -58.0865 },
      'manuel b. gonnet': { lat: -34.8742, lng: -58.0171 },
      'ringuelet': { lat: -34.9067, lng: -57.9861 },
      'tolosa': { lat: -34.9043, lng: -57.9697 },
      'los hornos': { lat: -34.9667, lng: -57.9667 },
      'altos de san lorenzo': { lat: -34.9833, lng: -57.9500 }
    };
    
    const coords = coordenadasLocalidades[localidad];
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }
  
  return { lat, lng };
};

function ReservaPage() {
  const { canchaId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);
  const [deporte, setDeporte] = useState(null);
  const [reseñasDeLaCancha, setReseñasDeLaCancha] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [serviciosCompleto, setServiciosCompleto] = useState([]);

  // Cargar datos dinámicos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      if (!canchaId) return;
      
      try {
        setLoading(true);
        
        // Cargar datos de la cancha
        const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`);
        if (!canchaResponse.ok) throw new Error('Error al cargar cancha');
        const canchaData = await canchaResponse.json();
        
        const cancha = canchaData.cancha || canchaData;
        setCancha(cancha);
        
        // Cargar datos del complejo
        if (cancha.complejoId) {
          const complejoResponse = await fetch(`${API_BASE_URL}/complejos/${cancha.complejoId}`);
          if (!complejoResponse.ok) throw new Error('Error al cargar complejo');
          const complejoData = await complejoResponse.json();
          setComplejo(complejoData.complejo || complejoData);
        }

        // Cargar servicios del complejo desde la API
        if (cancha.complejoId) {
          const serviciosResponse = await fetch(`${API_BASE_URL}/servicios`);
          if (serviciosResponse.ok) {
            const serviciosData = await serviciosResponse.json();
            const serviciosDelComplejo = serviciosData.servicios
              .filter(servicio => 
                servicio.complejos.some(cs => cs.complejoId === cancha.complejoId && cs.disponible)
              );
            setServiciosCompleto(serviciosDelComplejo);
          }
        }
        
        // Cargar datos del deporte para obtener imágenes
        if (cancha.deporteId) {
          const deporteResponse = await fetch(`${API_BASE_URL}/deportes/${cancha.deporteId}`);
          if (deporteResponse.ok) {
            const deporteData = await deporteResponse.json();
            setDeporte(deporteData.deporte || deporteData);
          }
        }

        // Cargar reseñas de la cancha
        const reseñasResponse = await fetch(`${API_BASE_URL}/resenas/cancha/${canchaId}`);
        if (reseñasResponse.ok) {
          const reseñasData = await reseñasResponse.json();
          // Transformar las reseñas para que coincidan con la estructura esperada por CarruselReseñas
          const reseñasTransformadas = (reseñasData.resenas || reseñasData || []).map(resena => ({
            id: resena.id,
            nombre: `${resena.alquiler?.cliente?.nombre || 'Usuario'} ${resena.alquiler?.cliente?.apellido || ''}`.trim(),
            puntaje: resena.puntaje,
            comentario: resena.descripcion || 'Sin comentario'
          }));
          setReseñasDeLaCancha(reseñasTransformadas);
        }
        const turnosResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}`);
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
    const coordenadas = getCoordinatesForLocation(complejo?.domicilio);
    const complejoAdaptado = {
      ...complejo,
      servicios: serviciosCompleto, // Pasar objetos completos con iconos
      horarios: complejo.horarios || 'No especificado', // Horarios reales del complejo
      ubicacion: complejo && complejo.domicilio 
        ? buildLocationString(complejo.domicilio)
        : 'Ubicación no especificada',
      lat: complejo.lat || coordenadas.lat, // Usar coordenadas del complejo o aproximadas por localidad
      lng: complejo.lng || coordenadas.lng
    };
    
    // Construir URLs de imágenes
    let imageUrl;
    let otrasImagenes = [];
    
    if (cancha.image && cancha.image.length > 0) {
      // Si la cancha tiene imágenes en la BD
      imageUrl = getImageUrl(cancha.image[0]); // Primera imagen como principal
      
      // Resto de imágenes como thumbnails
      if (cancha.image.length > 1) {
        otrasImagenes = cancha.image.slice(1).map(img => getImageUrl(img));
      }
    } else {
      // Si no hay imágenes en la BD, generar basada en el deporte y ID único
      imageUrl = getCanchaImage(cancha.id, deporte?.nombre || 'Fútbol 5', cancha.nroCancha);
    }
    
    return {
      ...cancha,
      id: parseInt(canchaId),
      nroCancha: cancha.nroCancha, // Asegurar que use el campo correcto
      puntaje: infoReseñas.promedio,
      cantidadReseñas: infoReseñas.cantidad,
      imageUrl: imageUrl,
      otrasImagenes: otrasImagenes, // Agregar otras imágenes
      turnos: turnos,
      complejo: complejoAdaptado
    };
  }, [cancha, deporte, turnos, canchaId, complejo, reseñasDeLaCancha, serviciosCompleto]);

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
      const response = await fetch(`${API_BASE_URL}/alquileres`, {
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
      const response2 = await fetch(`${API_BASE_URL}/turnos/${turnoCompleto.id}`, {
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
        <GaleriaFotos 
          imageUrl={canchaMostrada.imageUrl} 
          otrasImagenes={canchaMostrada.otrasImagenes || []}
        />
        <InfoCancha cancha={canchaMostrada} complejo={canchaMostrada.complejo} deporte={deporte?.nombre} />
        <CalendarioTurnos turnosDisponibles={turnos || []} onConfirmarReserva={handleConfirmarReserva} canchaId={canchaId} />
        <CarruselReseñas reseñas={reseñasDeLaCancha} />
      </div>
    </div>
  );
}

export default ReservaPage;
