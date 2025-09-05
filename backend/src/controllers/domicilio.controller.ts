import { NextFunction, Request, Response } from 'express';
import * as domicilioService from '../services/domicilio.service';
import { crearDomicilioRequest, DomicilioResponse, UpdateDomicilioRequest } from '../types/domicilio.types';


export async function CrearDomicilio(req: Request, res: Response<DomicilioResponse>) {
    try {
        const newdomcilio = await domicilioService.crearDomicilio(req.body)
        res.status(201).json({
            domicilio: newdomcilio,
            message: 'Domicilio creado existosamente',
    });
    } catch (error: any) {
        return res.status(500).json({ error : 'Error del servidor'})
    }
};

export async function ActualizarDomicilio(req: Request<{id : string}, DomicilioResponse,UpdateDomicilioRequest>, res: Response<DomicilioResponse>) {
    try {
        const {id} = req.params;
        const updateDomicilio = await domicilioService.actualizarDomicilio(parseInt(id), req.body);
        res.json({
            domicilio: updateDomicilio,
            message: 'Domicilio Actualizado Exitosamente'
        });
    } catch (error : any) {
        console.log (error);
    }
};

export async function eliminarDomicilio(req: Request<{id : string}>, res: Response) {
 try {
    const {id} = req.params;
    const delated = await domicilioService.eliminarDomicilio(parseInt(id));
 }  catch (error : any) {
    res.status(400).json({ error: error.message});
 }    
};

export async function obtenerDomicilioById(req: Request, res: Response<DomicilioResponse>, next: NextFunction) {
    try {
        const {id} = req.params;
        const domicilio = await domicilioService.getDomicilioById(parseInt(id));
        res.json({
            domicilio,
            message: ('Domicilio encontrado exitosamente')
        })
    }   catch (error){
        next(error);
    }
};