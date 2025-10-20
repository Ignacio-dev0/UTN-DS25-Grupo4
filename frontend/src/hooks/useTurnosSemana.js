import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api.js';

export const useTurnosSemana = (canchaId) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana actual, 1 = siguiente, -1 = anterior

  const formatearTurnos = useCallback((turnosData) => {
    // Función auxiliar para obtener el día de la semana en español
    const obtenerDiaSemana = (fecha) => {
      // Array que coincide con getDay(): 0=Dom, 1=Lun, 2=Mar, etc.
      // IMPORTANTE: Sin acentos para coincidir con el backend
      const diasCalendario = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const fechaObj = new Date(fecha + 'T00:00:00'); // Forzar interpretación local sin timezone
      const diaIndex = fechaObj.getDay(); // 0=Domingo, 1=Lunes, etc.
      
      return diasCalendario[diaIndex];
    };
    
    // Formatear hora desde ISO
    const formatearHora = (horaISO) => {
      const fecha = new Date(horaISO);
      const horas = fecha.getUTCHours().toString().padStart(2, '0');
      const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    };

    // Determinar estado basado en fecha actual y datos del turno
    const determinarEstado = (turno) => {
      const ahora = new Date();
      
      // Extraer la fecha del turno (solo año-mes-día)
      const fechaTurnoStr = turno.fecha.split('T')[0]; // "2025-10-19"
      
      // Extraer hora y minutos del campo horaInicio (viene como ISO: "1970-01-01T10:00:00.000Z")
      // La hora UTC representa la hora REAL del turno (ej: 10:00 UTC = 10:00 en el sistema)
      const horaTurno = new Date(turno.horaInicio);
      const horasUTC = horaTurno.getUTCHours(); // 10
      const minutosUTC = horaTurno.getUTCMinutes(); // 0
      
      // Crear fecha y hora del turno en timezone local
      // Parseamos la fecha y establecemos la hora local directamente
      const fechaHoraTurno = new Date(fechaTurnoStr + 'T00:00:00');
      fechaHoraTurno.setHours(horasUTC, minutosUTC, 0, 0);
      
      // Si el turno (fecha + hora) ya pasó, está finalizado
      if (fechaHoraTurno < ahora) {
        return 'finalizado';
      }
      
      // Si está deshabilitado temporalmente, está DESHABILITADO (color naranja)
      // Usar optional chaining para evitar errores si el campo no existe
      if (turno.deshabilitado === true) {
        return 'deshabilitado';
      }
      
      // Si está reservado o tiene alquiler, está OCUPADO (color rojo)
      if (turno.reservado || turno.alquilerId) {
        return 'ocupado';
      }
      
      // Si está ocupado manualmente, está ocupado
      if (turno.estado === 'OCUPADO') {
        return 'ocupado';
      }
      
      // Si está disponible
      return 'disponible';
    };

    const turnosArray = turnosData.turnos || turnosData || [];
    
    return turnosArray.map(turno => ({
      id: turno.id,
      dia: turno.dia || obtenerDiaSemana(turno.fecha), // Usar el dia del backend, fallback a cálculo local
      hora: formatearHora(turno.horaInicio),
      precio: turno.precio || turno.cronograma?.cancha?.complejo?.precio || 0,
      estado: determinarEstado(turno),
      reservado: turno.reservado,
      deshabilitado: turno.deshabilitado || false,
      alquilerId: turno.alquilerId,
      fecha: turno.fecha,
      fechaCompleta: new Date(turno.fecha),
      horaCompleta: new Date(turno.horaInicio)
    }));
  }, []);

  const cargarTurnos = useCallback(async (offset = 0) => {
    if (!canchaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[useTurnosSemana] Cargando turnos para cancha ${canchaId}, semana offset: ${offset}`);
      
      // Siempre usar el endpoint que incluye TODOS los turnos (disponibles + reservados)
      const endpoint = `${API_BASE_URL}/turnos/cancha/${canchaId}/semana/${offset}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error al cargar turnos: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[useTurnosSemana] Turnos recibidos:`, data);
      
      const turnosFormateados = formatearTurnos(data);
      console.log(`[useTurnosSemana] Turnos formateados:`, turnosFormateados);
      
      setTurnos(turnosFormateados);
    } catch (err) {
      console.error('[useTurnosSemana] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canchaId, formatearTurnos]);

  // Cargar turnos cuando cambia el canchaId o semanaOffset
  useEffect(() => {
    cargarTurnos(semanaOffset);
  }, [cargarTurnos, semanaOffset]);

  const cambiarSemana = (nuevoOffset) => {
    console.log(`[useTurnosSemana] Cambiando a semana offset: ${nuevoOffset}`);
    setSemanaOffset(nuevoOffset);
  };

  const irSemanaAnterior = () => {
    cambiarSemana(semanaOffset - 1);
  };

  const irSemanaActual = () => {
    cambiarSemana(0);
  };

  const irSemanaSiguiente = () => {
    if (semanaOffset < 1) { // Limitar a máximo próxima semana para reservas
      cambiarSemana(semanaOffset + 1);
    }
  };

  // Calcular fechas de la semana mostrada
  const calcularFechasSemana = () => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    
    // Calcular el lunes de la semana actual
    const diaActual = hoy.getDay();
    const diasHastaLunes = diaActual === 0 ? -6 : -(diaActual - 1);
    lunes.setDate(hoy.getDate() + diasHastaLunes + (semanaOffset * 7));
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    return {
      inicio: lunes,
      fin: domingo,
      esActual: semanaOffset === 0,
      esPasada: semanaOffset < 0,
      esFutura: semanaOffset > 0
    };
  };

  return {
    turnos,
    loading,
    error,
    semanaOffset,
    cambiarSemana,
    irSemanaAnterior,
    irSemanaActual,
    irSemanaSiguiente,
    calcularFechasSemana,
    recargar: () => cargarTurnos(semanaOffset)
  };
};