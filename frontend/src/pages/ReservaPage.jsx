import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [_error, setError] = useState(null);
  const [serviciosCompleto, setServiciosCompleto] = useState([]);

  // Función para cargar reseñas de la cancha
  const cargarReseñas = useCallback(async () => {
    if (!canchaId) return;
    
    try {
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
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    }
  }, [canchaId]);

  // Efecto para refrescar reseñas cuando la página viene al foco
  useEffect(() => {
    const handleFocus = () => {
      cargarReseñas();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [cargarReseñas]);

  // Cargar datos básicos de la cancha primero (rápido)
  useEffect(() => {
    const cargarDatosBasicos = async () => {
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
        
      } catch (error) {
        console.error('Error cargando datos básicos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosBasicos();
  }, [canchaId]);

  // Cargar datos adicionales después (más lento)
  useEffect(() => {
    const cargarDatosAdicionales = async () => {
      if (!cancha?.complejoId) return;
      
      try {
        // Cargar servicios del complejo desde la API
        const serviciosResponse = await fetch(`${API_BASE_URL}/servicios`);
        if (serviciosResponse.ok) {
          const serviciosData = await serviciosResponse.json();
          const serviciosDelComplejo = serviciosData.servicios
            .filter(servicio => 
              servicio.complejos.some(cs => cs.complejoId === cancha.complejoId && cs.disponible)
            );
          setServiciosCompleto(serviciosDelComplejo);
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
        await cargarReseñas();
        
      } catch (error) {
        console.error('Error cargando datos adicionales:', error);
      }
    };

    cargarDatosAdicionales();
  }, [cancha?.complejoId, cancha?.deporteId, cargarReseñas]);

  // Cargar turnos por separado para mostrar loader independiente
  useEffect(() => {
    const cargarTurnos = async () => {
      if (!canchaId) {
        console.log('[DEBUG ReservaPage] No hay canchaId, saltando carga de turnos');
        return;
      }
      
      try {
        console.log(`[DEBUG ReservaPage] Iniciando carga de turnos para cancha ${canchaId}, setting loadingTurnos=true`);
        setLoadingTurnos(true);
        
        // Mantener loader visible por al menos 1 segundo para mejor UX
        console.log(`[DEBUG ReservaPage] Fetching turnos de: ${API_BASE_URL}/turnos/cancha/${canchaId}`);
        const [turnosResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}`),
          new Promise(resolve => setTimeout(resolve, 1000)) // Mínimo 1 segundo
        ]);
        
        console.log('[DEBUG ReservaPage] Response status:', turnosResponse.status);
        if (!turnosResponse.ok) {
          console.error('[DEBUG ReservaPage] Error en response:', turnosResponse.status, turnosResponse.statusText);
          throw new Error('Error al cargar turnos');
        }
        const turnosData = await turnosResponse.json();
        console.log('[DEBUG ReservaPage] Turnos raw del backend:', turnosData);
        console.log('[DEBUG ReservaPage] Cantidad de turnos recibidos:', turnosData.turnos?.length || 0);
        
        // Función auxiliar para obtener el día de la semana en español
        // IMPORTANTE: Usar mismo orden que CalendarioTurnos.jsx (LUNES primero)
        const obtenerDiaSemana = (fecha) => {
          const diasCalendario = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
          const fechaObj = new Date(fecha);
          const diaIndex = fechaObj.getUTCDay(); // 0=Domingo, 1=Lunes, etc.
          
          // Convertir a formato de calendario (LUNES=0, DOMINGO=6)
          if (diaIndex === 0) { // Domingo
            return 'DOMINGO';
          } else { // Lunes-Sábado
            return diasCalendario[diaIndex - 1];
          }
        };

        // Función auxiliar para formatear hora desde ISO string
        const formatearHora = (horaISO) => {
          const fecha = new Date(horaISO);
          // Usar UTC para evitar problemas de timezone
          const horas = fecha.getUTCHours().toString().padStart(2, '0');
          const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
          return `${horas}:${minutos}`;
        };
        
        const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => ({
          id: turno.id,
          dia: obtenerDiaSemana(turno.fecha),
          hora: formatearHora(turno.horaInicio),
          precio: turno.precio,
          estado: turno.reservado ? 'reservado' : 'disponible',
          reservado: turno.reservado, // Agregar campo reservado también
          fecha: turno.fecha
        }));
        
        // Debug logging SIEMPRE para verificar formato
        console.log('[DEBUG ReservaPage] Turnos formateados correctamente:');
        console.log('- Total:', turnosFormateados.length);
        if (turnosFormateados.length > 0) {
          console.log('- Ejemplo primer turno:', turnosFormateados[0]);
          console.log('- Días únicos:', [...new Set(turnosFormateados.map(t => t.dia))]);
          console.log('- Horas únicas (primeras 5):', [...new Set(turnosFormateados.map(t => t.hora))].slice(0, 5));
        } else {
          console.log('- ⚠️ NO HAY TURNOS FORMATEADOS');
        }
        
        setTurnos(turnosFormateados);
        console.log('[DEBUG ReservaPage] ✅ Turnos CARGADOS y PASADOS a CalendarioTurnos:');
        console.log('- Total turnos:', turnosFormateados.length);
        console.log('- Estados disponibles:', turnosFormateados.filter(t => t.estado === 'disponible').length);
        console.log('- Estados reservados:', turnosFormateados.filter(t => t.estado === 'reservado').length);
        console.log('[DEBUG ReservaPage] Setting loadingTurnos=false');
        
      } catch (error) {
        console.error('[ERROR ReservaPage] ❌ Error cargando turnos:', error);
        console.error('[ERROR ReservaPage] Stack:', error.stack);
      } finally {
        console.log('[DEBUG ReservaPage] Setting loadingTurnos=false (finally block)');
        setLoadingTurnos(false);
      }
    };

    cargarTurnos();
  }, [canchaId]);

  const canchaMostrada = useMemo(() => {
    if (!cancha || !complejo) return null;
    
    // Usar reseñas reales si están disponibles, sino valores por defecto
    const infoReseñas = reseñasDeLaCancha.length > 0 
      ? {
          promedio: reseñasDeLaCancha.reduce((acc, r) => acc + r.puntaje, 0) / reseñasDeLaCancha.length,
          cantidad: reseñasDeLaCancha.length
        }
      : { promedio: 0, cantidad: 0 };
    
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

  const handleConfirmarReserva = async (turnosSeleccionados) => {
    if (!turnosSeleccionados || turnosSeleccionados.length === 0 || !cancha || !complejo) return false;
    
    // Verificar autenticación
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return false;
    }

    // Verificar rol del usuario
    if (user.rol === 'admin') {
      alert('Los administradores no pueden realizar reservas. Esta funcionalidad está disponible solo para jugadores.');
      return false;
    }

    if (user.rol === 'owner') {
      alert('Los dueños de complejo no pueden realizar reservas. Esta funcionalidad está disponible solo para jugadores.');
      return false;
    }
    
    try {
      // Para turnos consecutivos del mismo día, duplicar IDs como espera el backend
      const turnosIds = [];
      
      // Agrupar turnos por día y ordenar por hora
      const turnosPorDia = {};
      turnosSeleccionados.forEach(turnoSel => {
        const turnoCompleto = turnos.find(t => 
          t.dia === turnoSel.dia && t.hora === turnoSel.hora
        );
        
        if (!turnoCompleto || !turnoCompleto.id) {
          throw new Error(`No se pudo encontrar el turno para ${turnoSel.dia} a las ${turnoSel.hora}`);
        }
        
        if (!turnosPorDia[turnoSel.dia]) {
          turnosPorDia[turnoSel.dia] = [];
        }
        turnosPorDia[turnoSel.dia].push({
          ...turnoCompleto,
          hora: turnoSel.hora
        });
      });
      
      // Procesar cada día
      Object.values(turnosPorDia).forEach(turnosDia => {
        // Ordenar por hora
        turnosDia.sort((a, b) => {
          const horaA = parseInt(a.hora.split(':')[0]);
          const horaB = parseInt(b.hora.split(':')[0]);
          return horaA - horaB;
        });
        
        // Si hay más de un turno en el mismo día, duplicar IDs para turnos consecutivos
        if (turnosDia.length > 1) {
          // Verificar si son consecutivos
          let sonConsecutivos = true;
          for (let i = 1; i < turnosDia.length; i++) {
            const horaAnterior = parseInt(turnosDia[i-1].hora.split(':')[0]);
            const horaActual = parseInt(turnosDia[i].hora.split(':')[0]);
            if (horaActual !== horaAnterior + 1) {
              sonConsecutivos = false;
              break;
            }
          }
          
          if (sonConsecutivos) {
            // Duplicar el primer ID para indicar turnos consecutivos
            turnosDia.forEach(() => {
              turnosIds.push(turnosDia[0].id);
            });
          } else {
            // Turnos no consecutivos, agregar IDs normalmente
            turnosDia.forEach(turno => {
              turnosIds.push(turno.id);
            });
          }
        } else {
          // Un solo turno
          turnosIds.push(turnosDia[0].id);
        }
      });

      console.log('🎯 Enviando turnosIds:', turnosIds);

      // Llamar al backend para crear el alquiler/reserva
      const response = await fetch(`${API_BASE_URL}/alquileres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: parseInt(user.id),
          turnosIds: turnosIds
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const reservaData = await response.json();
      console.log('Reserva creada exitosamente:', reservaData);
      
      // Actualizar el estado de todos los turnos como reservados
      const turnosActualizados = [...turnos];
      let actualizacionesExitosas = 0;
      
      for (const turnoSel of turnosSeleccionados) {
        const turnoCompleto = turnos.find(t => 
          t.dia === turnoSel.dia && t.hora === turnoSel.hora
        );
        
        if (turnoCompleto) {
          try {
            const response2 = await fetch(`${API_BASE_URL}/turnos/individual/${turnoCompleto.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ reservado: true }),
            });

            if (response2.ok) {
              // Actualizar en el array local
              const index = turnosActualizados.findIndex(t => t.id === turnoCompleto.id);
              if (index !== -1) {
                turnosActualizados[index] = { 
                  ...turnosActualizados[index], 
                  reservado: true, 
                  estado: 'reservado' 
                };
              }
              actualizacionesExitosas++;
            }
          } catch (error) {
            console.warn(`Error al actualizar turno ${turnoCompleto.id}:`, error);
          }
        }
      }
      
      // Actualizar estado local con todos los cambios
      setTurnos(turnosActualizados);
      
      if (actualizacionesExitosas === turnosSeleccionados.length) {
        return true;
      } else {
        console.warn(`Solo se actualizaron ${actualizacionesExitosas} de ${turnosSeleccionados.length} turnos`);
        return true; // La reserva se creó exitosamente aunque no todos los estados se actualizaron
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
        
        {/* Mostrar calendario para todos los usuarios */}
        <CalendarioTurnos 
          turnosDisponibles={turnos || []} 
          onConfirmarReserva={handleConfirmarReserva} 
          canchaId={canchaId}
          loading={loadingTurnos}
        />
        

        
        <CarruselReseñas reseñas={reseñasDeLaCancha} />
      </div>
    </div>
  );
}

export default ReservaPage;

