import { Request,Response } from "express";
import * as turnoService from "../services/turno.service";

export async function createTurno(req: Request, res: Response){
    try {
        const newTurno = await turnoService.createTurno(req.body);
        res.status(201).json({
            turno: newTurno,
            message: 'Turno created'
        }) 
    } catch (error :any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'error cliente' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getAllTurnos(req : Request ,res: Response) {
    try {
        const turnos = await turnoService.getAllTurnos();
        res.json({
            turnos,
            total: turnos.length
        })
    } catch (error : any) {
        return res.status(500).json({error : 'Error interno del servidor.'});
    }
}

