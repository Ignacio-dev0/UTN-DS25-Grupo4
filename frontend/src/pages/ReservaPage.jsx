import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GaleriaFotos from '../components/GaleriaFotos.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioTurnos from '../components/CalendarioTurnos.jsx';
import CarruselReseñas from '../components/CarruselReseñas.jsx';
import { API_BASE_URL } from '../config/api.js';

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
        await cargarReseñas();
        
        // USAR ENDPOINT DE SEMANA en lugar de todos los turnos
        // Esto trae solo los turnos de los próximos 7 días (hoy + 6)
        const turnosResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}/semana/0`);
        if (!turnosResponse.ok) throw new Error('Error al cargar turnos');
        const turnosData = await turnosResponse.json();
        
        console.log('📊 Turnos recibidos del backend:', {
          total: turnosData.turnos?.length || 0,
          primerosTres: turnosData.turnos?.slice(0, 3)
        });
        
        // Función auxiliar para obtener el día de la semana en español (SIN ACENTOS para consistencia)
        const obtenerDiaSemana = (fecha) => {
          const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
          
          // Si la fecha viene como string "2025-10-22", parsearlo correctamente
          let fechaStr = fecha;
          if (fechaStr.includes('T')) {
            fechaStr = fechaStr.split('T')[0]; // Extraer solo la fecha
          }
          
          // Usar Date con componentes individuales para evitar problemas de timezone
          const [year, month, day] = fechaStr.split('-').map(Number);
          const fechaObj = new Date(year, month - 1, day); // month es 0-indexed
          
          return diasSemana[fechaObj.getDay()]; // getDay() usa timezone local
        };

        // Función auxiliar para formatear hora desde ISO string
        const formatearHora = (horaISO) => {
          const fecha = new Date(horaISO);
          // Usar UTC para evitar problemas de timezone
          const horas = fecha.getUTCHours().toString().padStart(2, '0');
          const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
          return `${horas}:${minutos}`;
        };
        
        // Función para determinar el estado del turno
        // IMPORTANTE: Ahora usamos el campo 'yaPaso' que viene del backend
        const determinarEstadoTurno = (turno) => {
          // 🔴 PRIMERO: Si el backend indica que el turno ya pasó, está FINALIZADO
          if (turno.yaPaso === true) {
            return 'finalizado';
          }
          
          // 🟡 SEGUNDO: Verificar estados especiales (solo para turnos futuros)
          // Si está deshabilitado temporalmente
          if (turno.deshabilitado) {
            return 'deshabilitado';
          }
          
          // Si está reservado por un cliente
          if (turno.reservado) {
            return 'reservado';
          }
          
          // Si está ocupado manualmente por el dueño (alquilerId sin reservado)
          if (turno.alquilerId && !turno.reservado) {
            return 'ocupado';
          }
          
          // Si está disponible
          return 'disponible';
        };
        
        const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => {
          const estado = determinarEstadoTurno(turno);
          
          return {
            id: turno.id,
            dia: obtenerDiaSemana(turno.fecha),
            hora: formatearHora(turno.horaInicio),
            precio: turno.precio,
            estado,
            fecha: turno.fecha,
            fechaCompleta: turno.fecha, // Agregar para debugging
            horaCompleta: turno.horaInicio, // Agregar para debugging
            reservado: turno.reservado,
            deshabilitado: turno.deshabilitado,
            alquilerId: turno.alquilerId
          };
        });
        
        console.log('📊 Resumen de turnos formateados:', {
          total: turnosFormateados.length,
          disponibles: turnosFormateados.filter(t => t.estado === 'disponible').length,
          reservados: turnosFormateados.filter(t => t.estado === 'reservado').length,
          ocupados: turnosFormateados.filter(t => t.estado === 'ocupado').length,
          finalizados: turnosFormateados.filter(t => t.estado === 'finalizado').length,
          deshabilitados: turnosFormateados.filter(t => t.estado === 'deshabilitado').length
        });
        
        setTurnos(turnosFormateados);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [canchaId, cargarReseñas]);

  const canchaMostrada = useMemo(() => {
    if (!cancha || !complejo) return null;
    
    // Usar el puntaje y cantidad de reseñas del backend directamente (fuente de verdad)
    // El campo cancha.puntaje viene actualizado del backend
    const puntajeCancha = cancha.puntaje || 0;
    const cantidadReseñasCancha = reseñasDeLaCancha.length;
    
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
    
    // Función helper para procesar imágenes
    const processImageUrl = (image) => {
      if (!image) return '/canchaYa.png';
      // Si es base64, usarla directamente
      if (image.startsWith('data:image')) return image;
      // Si es un nombre de archivo, intentar cargar desde el servidor
      if (image.includes('.jpg') || image.includes('.png') || image.includes('.jpeg')) {
        return `http://localhost:3000/images/canchas/${image}`;
      }
      return '/canchaYa.png';
    };
    
    if (cancha.image && cancha.image.length > 0) {
      imageUrl = processImageUrl(cancha.image[0]);
      
      // Resto de imágenes como thumbnails
      if (cancha.image.length > 1) {
        otrasImagenes = cancha.image.slice(1).map(img => processImageUrl(img));
      }
    } else {
      imageUrl = '/canchaYa.png';
    }
    
    return {
      ...cancha,
      id: parseInt(canchaId),
      nroCancha: cancha.nroCancha, // Asegurar que use el campo correcto
      puntaje: puntajeCancha, // Usar puntaje del backend
      cantidadReseñas: cantidadReseñasCancha,
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
      console.log('👤 Usuario actual:', user);
      console.log('🆔 Usuario ID que se enviará:', parseInt(user.id));

      // Llamar al backend para crear el alquiler/reserva
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/alquileres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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
        <CalendarioTurnos turnosDisponibles={turnos || []} onConfirmarReserva={handleConfirmarReserva} canchaId={canchaId} />
        
        <CarruselReseñas reseñas={reseñasDeLaCancha} />
      </div>
    </div>
  );
}

export default ReservaPage;

