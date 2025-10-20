import { Request, Response } from 'express';
import * as horarioDeshabilitadoService from '../services/horarioDeshabilitado.service';
import { DiaSemana } from '@prisma/client';

/**
 * Controlador para gestionar horarios deshabilitados permanentemente
 */

// GET /api/horarios-deshabilitados/cancha/:canchaId
export const obtenerHorariosDeshabilitadosPorCancha = async (req: Request, res: Response) => {
  try {
    const canchaId = parseInt(req.params.canchaId);

    if (isNaN(canchaId)) {
      return res.status(400).json({ error: 'ID de cancha inválido' });
    }

    const horarios = await horarioDeshabilitadoService.obtenerHorariosDeshabilitados(canchaId);
    
    res.status(200).json(horarios);
  } catch (error) {
    console.error('❌ Error al obtener horarios deshabilitados:', error);
    res.status(500).json({ error: 'Error al obtener horarios deshabilitados' });
  }
};

// POST /api/horarios-deshabilitados
export const deshabilitarHorario = async (req: Request, res: Response) => {
  try {
    const { canchaId, dia, hora, motivo } = req.body;

    // Validaciones
    if (!canchaId || !dia || !hora) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: canchaId, dia, hora' 
      });
    }

    // Validar que dia sea un valor válido del enum
    if (!Object.values(DiaSemana).includes(dia)) {
      return res.status(400).json({ 
        error: 'Día inválido. Debe ser: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO o DOMINGO' 
      });
    }

    // Validar formato de hora (HH:00)
    const horaRegex = /^([0-1][0-9]|2[0-3]):00$/;
    if (!horaRegex.test(hora)) {
      return res.status(400).json({ 
        error: 'Formato de hora inválido. Debe ser HH:00 (ej: 14:00)' 
      });
    }

    const horarioDeshabilitado = await horarioDeshabilitadoService.deshabilitarHorario(
      parseInt(canchaId),
      dia as DiaSemana,
      hora,
      motivo
    );

    res.status(201).json({
      message: 'Horario deshabilitado correctamente',
      horarioDeshabilitado
    });
  } catch (error: any) {
    console.error('❌ Error al deshabilitar horario:', error);
    res.status(500).json({ error: 'Error al deshabilitar horario' });
  }
};

// DELETE /api/horarios-deshabilitados/:id
export const habilitarHorario = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const horarioHabilitado = await horarioDeshabilitadoService.habilitarHorario(id);

    res.status(200).json({
      message: 'Horario habilitado correctamente',
      horarioHabilitado
    });
  } catch (error: any) {
    console.error('❌ Error al habilitar horario:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Horario deshabilitado no encontrado' });
    }
    
    res.status(500).json({ error: 'Error al habilitar horario' });
  }
};

export default {
  obtenerHorariosDeshabilitadosPorCancha,
  deshabilitarHorario,
  habilitarHorario
};
