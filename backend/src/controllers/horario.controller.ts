import { Request, Response, NextFunction } from "express";
import * as horarioservice from "../services/horario.service"

export const createHorario = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const horario = await horarioservice.createHorario(req.body);
        res.status(201).json({
            horario,
            message: 'Horario creado correctamente'
        });
    }catch(error){
        next(error);
    }
}

export const getAllHorarios = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const horarios = await horarioservice.getAllHorarios();
        res.status(200).json({
            horarios,
            total: horarios.length,
            message: 'Horarios obtenidos correctamente'
        });
    }catch(error){
        next(error);
    }
}

export const getHorarioById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'El ID debe ser un número válido.' });
        }

        const horario = await horarioservice.getHorarioById(id);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }

        res.status(200).json({
            horario,
            message: 'Horario encontrado'
        });
    }catch(error){
        next(error);
    }
}

export const getHorariosCancha = async (req: Request<{canchaId: string}>, res:Response, next:NextFunction) => {
    try{
        const {canchaId} =req.params;
        if (isNaN(parseInt(canchaId))) {
            return res.status(400).json({ message: 'El ID de la cancha debe ser un número válido.' });
        }
        const canchaHorarios = await horarioservice.getHorariosByCanchaId(parseInt(canchaId));
        res.status(200).json({
            horarios: canchaHorarios,
            total: canchaHorarios.length,
            message: 'Horarios de la cancha obtenidos'
        });
    }catch(error: any){
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ HORARIO CONTROLLER - Base de datos no disponible para horarios cancha ${req.params.canchaId}, devolviendo lista vacía`);
            return res.status(200).json({
                horarios: [],
                total: 0,
                message: 'Servicio temporalmente no disponible'
            });
        }
        next(error);
    }
}

export const updateHorario = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'El ID debe ser un número válido.' });
        }

        const horario = await horarioservice.updateHorario(id, req.body);
        res.status(200).json({
            horario,
            message: 'Horario actualizado correctamente'
        });
    }catch(error: any){
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }
        next(error);
    }
}

export const deleteHorario = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'El ID debe ser un número válido.' });
        }

        const horario = await horarioservice.deleteHorario(id);
        res.status(200).json({
            horario,
            message: 'Horario eliminado correctamente'
        });
    }catch(error: any){
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }
        next(error);
    }
}
