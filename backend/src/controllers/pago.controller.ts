import { Request, Response, NextFunction} from "express";
import * as pagoService from "../services/pago.service";
import { CrearPagoRequest, actualizarPagoRequest, PagoResponse, PagoListResponse } from "../types/pago.types";

export async function crearPago(req : Request, res: Response) {
 try {
    const newPago = await pagoService.crearPago(req.body)
    res.status(201).json({
        pago: newPago,
        message: 'Pago Creado Exitosamente',// luego de un ({}) , o nada si es el ultimo arg no ;
    });
 } catch (error: any) {
    return res.status(500).json({error:'Error interno del servidor'})as any;
 }  
};

export async function obtenerAllPagos(req: Request, res: Response<PagoListResponse>, next: NextFunction) {
    try {
        const pagos = await pagoService.getAllpagos();
        res.json({
            pagos,
            total: pagos.length
        })
    } catch (error) {
        next(error);
    }
};

export async function actualizarPago(req : Request<{id : string}, PagoResponse, actualizarPagoRequest>, res : Response<PagoResponse>) {
  try {
    const {id} = req.params;
    const actualizarPago = await pagoService.actualizarPago(parseInt(id),req.body);
    res.json({
        pago: actualizarPago,
        message: 'Pago Actualizado Exitosamente'
    });
  }  catch (error: any) {
    console.log(error);
  }
};

export async function eliminarPago(req :Request<{id: string}>, res: Response) {
    try {
        const {id} = req.params;
        const eliminado = await pagoService.EliminarPago(parseInt(id));
        res.json({ 
            pago: eliminado,
            message: 'Pago Eliminado'
        });

    }catch (error : any) {
        res.status(400).json({error: error.message});
    }
};

export async function obtenerPagoById(req: Request, res : Response<PagoResponse>, next: NextFunction) {
  try {
    const {id} = req.params;
    const pago = await pagoService.obtenerPagoById(parseInt(id));
    res.json({
        pago: pago,
        message: 'Usuario Encontrado Exitosamente'
    });
  }  catch(error) {
    next(error);
  }
};