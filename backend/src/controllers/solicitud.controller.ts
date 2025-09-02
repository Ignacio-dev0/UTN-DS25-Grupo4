// backend/src/controllers/solicitud.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as solicitudService from '../services/solicitud.service';
import { SolicitudResponse, SolicitudListResponse } from '../types/solicitud.types';

export async function crearSolicitud(req: Request, res: Response<SolicitudResponse>, next: NextFunction) {
	try {
		const solicitud = await solicitudService.crearSolicitud(req.body);
		res.status(201).json({
			solicitud,
			message: 'Solicitud creada'
		});
	} catch (error: any) {
		console.log(error);
		next(error);
	}
};

export async function obtenerSolicitudes(req: Request, res: Response<SolicitudListResponse>, next: NextFunction) {
	try {
		const solicitudes = ( req.query.estado == "PENDIENTE" )?
			( await solicitudService.obtenerSolicitudesPendientes() ):
			( await solicitudService.obtenerSolicitudes() );
		res.status(200).json({
			solicitudes,
			total: solicitudes.length
		});

	} catch (error: any) {
		next(error);
	}
};

export async function obtenerSolicitudPorId(req: Request, res: Response<SolicitudResponse>, next: NextFunction) {
	try {
		const id = Number(req.params.id);
		const solicitud = await solicitudService.obtenerSolicitudPorId(id);
		res.status(200).json({
			solicitud,
			message: 'Deporte encontrado' });
	} catch (error: any) {
		res.status(500).json({ error: 'Error al obtener la solicitud.' });
		next(error);
	}
};

export async function evaluarSolicitud(req: Request, res: Response, next: NextFunction) {
	try {
		const id = Number(req.params.id);
		const data = req.body;

		const solicitud = await solicitudService.evaluarSolicitud(id, data.solicitud, data.emisorId);
		if (!solicitud) {
			return res.status(404).json({ error: 'Solicitud no encontrada.' });
		}
		res.status(200).json(solicitud);
	} catch (error: any) {
		next(error);
	}
}