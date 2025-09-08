import { Request, Response, NextFunction } from "express";
import * as turnoService from "../services/turno.service";
import { CreateTurnoRequest, UpdateTurnoRequest, TurnoListResponse, TurnoResponse } from "../types/turno.types";


export async function getAllTurnos(req: Request, res: Response<TurnoListResponse>) {
    try {
        const turnos = await turnoService.getAllTurnos();
        res.status(200).json({
            turnos: turnos,
            total: turnos.length,
            message: 'Lista de turnos obtenida exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({
            turnos: [],
            total: 0,
            message: error.message || 'Error al obtener los turnos.'
        });
    }
}

export async function getTurnoById(req: Request<{ id: string }>, res: Response<TurnoResponse>) {
    try {
        const { id } = req.params;
        const turno = await turnoService.getTurnoById(parseInt(id));
        
        if (!turno) {
            return res.status(404).json({
                turno: null,
                message: 'Turno no encontrado'
            });
        }
        
        res.status(200).json({
            turno: turno,
            message: 'Turno obtenido exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({
            turno: null,
            message: error.message || 'Error al obtener el turno.'
        });
    }
}

export async function getTurnosByCanchaAndDate(req: Request<{ canchaId: string }>, res: Response<TurnoListResponse>) {
    try {
        const { canchaId } = req.params;
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({
                turnos: [],
                total: 0,
                message: 'Parámetro de fecha es requerido.'
            });
        }

        const turnos = await turnoService.getTurnosByCanchaAndDate(parseInt(canchaId), new Date(fecha as string));

        res.status(200).json({
            turnos: turnos,
            total: turnos.length,
            message: `Turnos para la cancha ${canchaId} y fecha ${fecha} obtenidos exitosamente.`
        });
    } catch (error: any) {
        res.status(500).json({
            turnos: [],
            total: 0,
            message: error.message || 'Error al obtener los turnos por cancha y fecha.'
        });
    }
}

export async function createTurno(req: Request<{}, TurnoResponse, CreateTurnoRequest>, res: Response<TurnoResponse>) {
    try {
        const nuevoTurno = await turnoService.createTurno(req.body);
        res.status(201).json({
            turno: nuevoTurno,
            message: 'Turno creado exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({
            turno: null,
            message: error.message || 'Error al crear el turno.'
        });
    }
}

export async function updateTurno(req: Request<{ id: string }, TurnoResponse, UpdateTurnoRequest>, res: Response<TurnoResponse>) {
    try {
        const { id } = req.params;
        const updateTurno = await turnoService.updateTurno(parseInt(id), req.body);
        res.status(200).json({
            turno: updateTurno,
            message: 'Turno actualizado exitosamente'
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return res.status(404).json({
                turno: null,
                message: error.message
            });
        }
        res.status(500).json({
            turno: null,
            message: 'Error al actualizar el turno.'
        });
    }
}

export async function deleteTurno(req: Request<{ id: string }>, res: Response<TurnoResponse>) {
    try {
        const { id } = req.params;
        const deletedTurno = await turnoService.deleteTurno(parseInt(id));
        res.status(200).json({
            turno: deletedTurno,
            message: 'Turno eliminado exitosamente.'
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return res.status(404).json({
                turno: null,
                message: error.message
            });
        }
        res.status(500).json({
            turno: null,
            message: 'Error al eliminar el turno.'
        });
    }
}