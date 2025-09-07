import { Request, Response, NextFunction } from "express";
import  * as soliServ  from "../services/solicitud.service";

export const createRequest =  async (req: Request, res:Response, next:NextFunction) =>{
    try{
        const nuevaSolicitud = await soliServ.createSolicitud(req.body);
        res.status(200).json(nuevaSolicitud);
    }catch(error){
        next(error);
    }
}

export const updateReq = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const {id}=req.params;
        const soliup = await soliServ.updateSolicitud(parseInt(id),req.body);
        res.json({
            solicitud: soliup,
            message: ('solicitud actualizada correctamente'),
        })
    }catch(error:any){
        console.log(error);
    }
}

export async function getSolById(req:Request, res:Response) {
    try{
        const {id}=req.params;
        const solicitud = await soliServ.getRequestById(parseInt(id));
        res.json({
            solicitud,
            message:('request retrieved succesfully')
        });
    }catch(error:any){
        console.log(error);
    }
}

export async function getAllSol(req:Request, res:Response){
    try{
        const solicitudes = await soliServ.getAllRequest();
        res.json({
            solicitudes,
            total: solicitudes.length
        })
    }catch(error:any){
        console.log(error);
    }
}

export async function eliminarSoli (req: Request, res: Response){
  try {
    const {id} = req.params;
    const deleted = await soliServ.deleteSoli(parseInt(id));
    res.json({ usuario:deleted, message: "solicitud deleteada " });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};



// // backend/src/controllers/solicitud.controller.ts
// import { Request, Response } from 'express';
// import * as solicitudService from '../services/solicitud.service';

// export const crearSolicitud = async (req: Request, res: Response) => {
// 	try {
// 		const nuevaSolicitud = await solicitudService.crearSolicitud(req.body);
// 		res.status(201).json(nuevaSolicitud);
// 	} catch (error: any) {
// 		res.status(400).json({ error: error.message });
// 	}
// };

// export const obtenerSolicitudes = async (req: Request, res: Response) => {
// 	try {
// 		const solicitudes = ( req.query.estado == "PENDIENTE" )?
// 			( await solicitudService.obtenerSolicitudesPendientes() ):
// 			( await solicitudService.obtenerSolicitudes() );
// 		res.status(200).json(solicitudes);

// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener las solicitudes.' });
// 	}
// };

// export const obtenerSolicitudPorId = async (req: Request, res: Response) => {
// 	try {
// 		const id = Number(req.params.id);
// 		const solicitud = await solicitudService.obtenerSolicitudPorId(id);
// 		if (!solicitud) {
// 			return res.status(404).json({ error: 'Solicitud no encontrada.' });
// 		}
// 		res.status(200).json(solicitud);
// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener la solicitud.' });
// 	}
// };

// export const evaluarSolicitud = async (req: Request, res: Response) => {
// 	try {
// 		const id = Number(req.params.id);
// 		const data = req.body;

// 		const solicitud = await solicitudService.evaluarSolicitud(id, data.solicitud, data.emisorId);
// 		if (!solicitud) {
// 			return res.status(404).json({ error: 'Solicitud no encontrada.' });
// 		}
// 		res.status(200).json(solicitud);
// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener la solicitud.' });
// 	}
// }
