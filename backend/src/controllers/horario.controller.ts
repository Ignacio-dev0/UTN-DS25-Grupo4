import { Request, Response, NextFunction } from "express";
import * as horarioservice from "../services/horario.service"

export const createHorario = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const horario = await horarioservice.createHorario(req.body);
        res.status(201).json(horario);
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
        res.status(200).json(canchaHorarios);
    }catch(error){
        next(error);
    }
}