import { Request, Response } from "express";
import * as reservaService from '../services/reserva.service';

export const crearReserva = async (req: Request, res:Response) => {
    try{
        const nuevoAlquiler = await reservaService.crearReserva(req.body);
        res.status(201).json(nuevoAlquiler);
    } catch (error: any){
        res.status(400).json({error: error.message});
    }
}

export const ontenerAlquileres = async(req: Request, res: Response) => {
    try {
        const alquileres = await reservaService.obtenerReservas();
        res.status(201).json(alquileres);
    } catch(error: any){
        res.status(400).json({error: 'todo mal dea'});
    }
}

export const obtenerReservaPorId = async(req: Request, res: Response)=>{
    try {
        const id=Number(req.params.id);
        const alquiler = await reservaService.obtenerReservaPorId(id);
        if (!alquiler){
            res.status(404).json({error: 'alquier perdido'});
        }
        res.status(200).json(alquiler);
    }catch(error:any){
        res.status(500).json({error: 'error al obtener reserva/alquiler'})
    }
};