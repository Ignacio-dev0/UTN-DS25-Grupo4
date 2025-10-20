import prisma from '../config/prisma';
import { DiaSemana } from '@prisma/client';

/**
 * Servicio para gestionar horarios deshabilitados permanentemente
 * Estos horarios NO serán creados automáticamente por el scheduler
 */

// Obtener todos los horarios deshabilitados de una cancha
export const obtenerHorariosDeshabilitados = async (canchaId: number) => {
  try {
    const horarios = await prisma.horarioDeshabilitado.findMany({
      where: { canchaId },
      orderBy: [
        { dia: 'asc' },
        { hora: 'asc' }
      ]
    });
    
    console.log(`✅ [HORARIO DESHABILITADO] Encontrados ${horarios.length} horarios deshabilitados para cancha ${canchaId}`);
    return horarios;
  } catch (error) {
    console.error('❌ [HORARIO DESHABILITADO] Error al obtener horarios deshabilitados:', error);
    throw error;
  }
};

// Deshabilitar un horario permanentemente
export const deshabilitarHorario = async (canchaId: number, dia: DiaSemana, hora: string, motivo?: string) => {
  try {
    // Verificar si ya existe
    const existente = await prisma.horarioDeshabilitado.findUnique({
      where: {
        canchaId_dia_hora: {
          canchaId,
          dia,
          hora
        }
      }
    });

    if (existente) {
      console.log(`⚠️ [HORARIO DESHABILITADO] Horario ${dia} ${hora} ya estaba deshabilitado para cancha ${canchaId}`);
      return existente;
    }

    // Crear nuevo registro
    const horarioDeshabilitado = await prisma.horarioDeshabilitado.create({
      data: {
        canchaId,
        dia,
        hora,
        motivo
      }
    });

    console.log(`✅ [HORARIO DESHABILITADO] Deshabilitado ${dia} ${hora} para cancha ${canchaId}`);
    
    // Eliminar turnos futuros existentes de este horario
    await eliminarTurnosFuturosDeHorario(canchaId, dia, hora);
    
    return horarioDeshabilitado;
  } catch (error) {
    console.error('❌ [HORARIO DESHABILITADO] Error al deshabilitar horario:', error);
    throw error;
  }
};

// Habilitar un horario (eliminar de la lista de deshabilitados)
export const habilitarHorario = async (id: number) => {
  try {
    const horarioDeshabilitado = await prisma.horarioDeshabilitado.delete({
      where: { id }
    });

    console.log(`✅ [HORARIO DESHABILITADO] Habilitado nuevamente ${horarioDeshabilitado.dia} ${horarioDeshabilitado.hora} para cancha ${horarioDeshabilitado.canchaId}`);
    return horarioDeshabilitado;
  } catch (error) {
    console.error('❌ [HORARIO DESHABILITADO] Error al habilitar horario:', error);
    throw error;
  }
};

// Verificar si un horario específico está deshabilitado
export const estaHorarioDeshabilitado = async (canchaId: number, dia: DiaSemana, hora: string): Promise<boolean> => {
  try {
    const horario = await prisma.horarioDeshabilitado.findUnique({
      where: {
        canchaId_dia_hora: {
          canchaId,
          dia,
          hora
        }
      }
    });

    return horario !== null;
  } catch (error) {
    console.error('❌ [HORARIO DESHABILITADO] Error al verificar horario:', error);
    return false; // En caso de error, permitir la creación
  }
};

// Eliminar turnos futuros de un horario deshabilitado
const eliminarTurnosFuturosDeHorario = async (canchaId: number, dia: DiaSemana, hora: string) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Mapeo de DiaSemana a número de día de la semana (0=Domingo, 6=Sábado)
    const diasSemanaMap: Record<DiaSemana, number> = {
      'DOMINGO': 0,
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SABADO': 6
    };

    const numeroDia = diasSemanaMap[dia];

    // Obtener todos los turnos futuros de esta cancha sin reserva
    const turnosFuturos = await prisma.turno.findMany({
      where: {
        canchaId,
        fecha: {
          gte: hoy
        },
        alquilerId: null // Solo turnos no reservados
      }
    });

    // Filtrar turnos que coincidan con el día de la semana y hora
    const turnosParaEliminar = turnosFuturos.filter(turno => {
      const fechaTurno = new Date(turno.fecha);
      const diaSemana = fechaTurno.getDay();
      
      // Extraer hora del horaInicio (formato: "HH:00")
      const horaInicio = new Date(turno.horaInicio);
      const horaTurno = `${String(horaInicio.getUTCHours()).padStart(2, '0')}:00`;
      
      return diaSemana === numeroDia && horaTurno === hora;
    });

    // Eliminar los turnos identificados
    if (turnosParaEliminar.length > 0) {
      const idsAEliminar = turnosParaEliminar.map(t => t.id);
      
      const turnosEliminados = await prisma.turno.deleteMany({
        where: {
          id: {
            in: idsAEliminar
          }
        }
      });

      console.log(`🗑️ [HORARIO DESHABILITADO] Eliminados ${turnosEliminados.count} turnos futuros de ${dia} ${hora}`);
      return turnosEliminados.count;
    }

    console.log(`ℹ️ [HORARIO DESHABILITADO] No hay turnos futuros para eliminar de ${dia} ${hora}`);
    return 0;
  } catch (error) {
    console.error('❌ [HORARIO DESHABILITADO] Error al eliminar turnos futuros:', error);
    throw error;
  }
};

export default {
  obtenerHorariosDeshabilitados,
  deshabilitarHorario,
  habilitarHorario,
  estaHorarioDeshabilitado
};
