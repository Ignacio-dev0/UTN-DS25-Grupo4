import { Request, Response, NextFunction} from "express";
import * as pagoService from "../services/pago.service";
import { CrearPagoRequest, actualizarPagoRequest, PagoResponse, PagoListResponse } from "../types/pago.types";

// --- NUEVO: Controlador para crear la preferencia de MP ---
export async function crearPreferenciaDePago(req: Request, res: Response, next: NextFunction) {
  try {
    // El middleware 'authenticate' debería darnos el usuario en req.user
    // Si usa req.body, hay que cambiarlo por seguridad.
    // @ts-ignore // Ignoramos error si 'user' no está en el tipo Request
    const cliente = req.user as Usuario; 

    if (!cliente || !cliente.id) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const { turnoId } = req.body;
    if (!turnoId) {
      return res.status(400).json({ message: "El 'turnoId' es requerido." });
    }

    const checkout = await pagoService.crearPreferenciaDePago(Number(turnoId), cliente.id);
    
    // Devolvemos la URL de checkout al frontend
    res.status(200).json(checkout);

  } catch (error: any) {
    next(error); // Usamos el manejador de errores global
  }
}
// --- FIN NUEVO ---




export async function crearPago(req : Request, res: Response, next:NextFunction) {
 try {
    const newPago = await pagoService.crearPago(req.body)
    res.status(201).json({
        pago: newPago,
        message: 'Pago Creado Exitosamente'
    });
 } catch (error: any) {
    next(error);
 }  
};

export async function obtenerAllPagos(req: Request, res: Response<PagoListResponse>, next: NextFunction) {
    try {
        const pagos = await pagoService.getAllpagos();
        res.json({
            pagos: pagos,
            total: pagos.length
        })
    } catch (error) {
        next(error);
    }
};

export async function actualizarPago(req : Request<{id : string}, PagoResponse, actualizarPagoRequest>, res : Response<PagoResponse>,next:NextFunction) {
  try {
    const {id} = req.params;
    const actualizarPago = await pagoService.actualizarPago(parseInt(id),req.body);
    res.json({
        pago: actualizarPago,
        message: 'Pago Actualizado Exitosamente'
    });
  }  catch (error: any) {
    next(error)
  }
};

export async function eliminarPago(req :Request<{id: string}>, res: Response,next:NextFunction) {
    try {
        const {id} = req.params;
        const eliminado = await pagoService.EliminarPago(parseInt(id));
        res.json({ 
            pago: eliminado,
            message: 'Pago Eliminado'
        });

    }catch (error : any) {
        next(error)
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