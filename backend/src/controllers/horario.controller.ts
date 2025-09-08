import { Request, Response, NextFunction } from 'express';
import * as horarioService from '../services/horario.service';
import { CreateHorario, UpdateCronograma } from '../types/horarioCronograma.types';

export async function getAllHorariosCronograma(req: Request, res: Response): Promise<void> {
    try {
        const horarios = await horarioService.getAllHorariosCronograma();
        res.status(200).json({
            horarios: horarios,
            total: horarios.length,
            message: ' Lista de horarios obtenida exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({ 
            horarios: [],
            total: 0,
            message: error.message || 'Error al obtener los horarios del cronograma.'
        });
    }
};

export async function getHorarioCronogramaById (req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const horario = await horarioService.getHorarioCronogramaById(parseInt(id));

        if (!horario) {
            res.status(404).json({ 
                horario: null,
                message: 'Horario del cronograma no encontrado.'
            });
            return;
        }

        res.status(200).json({
            horario:horario,
            message: 'Horario del cronograma obtenido exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({ 
            horario: null,
            message: error.message || 'Error al obtener el horario del cronograma.'
        });
    }
};

export async function getHorariosCronogramaByCanchaId(req: Request, res: Response): Promise<void>{
    try {
        const { canchaId } = req.params;
        const { diaSemana } = req.query; // El día de la semana es opcional

        const horarios = await horarioService.getHorariosCronogramaByCanchaId(parseInt(canchaId), diaSemana as any);

        res.status(200).json({
            horarios:horarios,
            total: horarios.length,
            message: ' Horarios de la cancha obtenidos exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({ 
            horarios: [],
            total:0,
            message: error.message || 'Error al obtener los horarios de la cancha.'
        });
    }
};

export async function createHorarioCronograma(req: Request, res: Response): Promise<void> {
    try {
        const data: CreateHorario = req.body;
        const nuevoHorario = await horarioService.createHorarioCronograma(data);
        res.status(201).json({
            horario:nuevoHorario,
            message: 'Horario del cronograma creado exitosamente' 
        });
    } catch (error: any) {
        res.status(500).json({ 
            horario: null,
            message: 'error al crear el horario'
         });
    }
};

export async function updateHorarioCronograma (req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const data: UpdateCronograma = req.body;
        const horarioActualizado = await horarioService.updateHorarioCronograma(parseInt(id), data);
        res.status(200).json({
            horario:horarioActualizado,
            message:'Horario del cronograma actualizado exitosamente.'
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            res.status(404).json({ 
                horario:null,
                message:error.message
             });
        } else {
            res.status(500).json({ horario:null,message: error.message || 'Error al actualizar el horario del cronograma.' });
        }
    }
};

export async function deleteHorarioCronograma(req: Request, res: Response): Promise<void>{
    try {
        const { id } = req.params;
        const horarioEliminado = await horarioService.deleteHorarioCronograma(parseInt(id));
        res.status(200).json({ 
            horario: horarioEliminado, 
            message: 'Horario del cronograma eliminado exitosamente.'
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            res.status(404).json({ 
                horario: null,
                message: error.message 
            });
        } else {
            res.status(500).json({ 
                horario:null,
                message: error.message || 'Error al eliminar el horario del cronograma.' 
            });
        }
    }
};