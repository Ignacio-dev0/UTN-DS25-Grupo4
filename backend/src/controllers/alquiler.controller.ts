import { Request, Response, NextFunction } from "express";
import { AlquilerResponse, AlquilerListResponse, AlquilerPagadoResponse } from "../types/alquiler.types";
import * as alquilerService from "../services/alquiler.service";
import { UnauthorizedError } from "../middlewares/handleError.middleware";

export async function crearAlquiler(req: Request, res: Response<AlquilerResponse>, next: NextFunction) {
	try {
		const alquiler = await alquilerService.crearAlquiler(req.usuario.id, req.body);
		res.status(201).json({
			alquiler,
			message: 'Alquiler creado exitosamente',
		});
	} catch(error: any) {
		// Manejo específico para errores de conectividad de base de datos
		if (error.message && error.message.includes("Can't reach database server")) {
			console.log(`⚠️ ALQUILER CONTROLLER - Base de datos no disponible para crear alquiler`);
			return res.status(503).json({ 
				error: 'Servicio temporalmente no disponible',
				message: 'No se puede crear el alquiler en este momento. Intenta más tarde.',
				alquiler: null
			} as any);
		}
		console.error('💥 CREAR ALQUILER - Error:', error);
		next(error);
	}
}

export async function obtenerAlquilerPorId(req: Request, res: Response<AlquilerResponse>, next: NextFunction) {
	try {
		const id = Number(req.params.id)
		const alquiler = await alquilerService.obtenerAlquilerPorId(id);
		res.status(200).json({
			alquiler,
			message: 'Alquiler encontrado',
		});
	} catch(error: any) {
		// Manejo específico para errores de conectividad de base de datos
		if (error.message && error.message.includes("Can't reach database server")) {
			console.log(`⚠️ ALQUILER CONTROLLER - Base de datos no disponible para obtener alquiler ID: ${req.params.id}`);
			return res.status(404).json({ 
				alquiler: null,
				message: 'Alquiler no encontrado - servicio no disponible'
			} as any);
		}
		next(error);
	}
}

export async function obtenerAlquileres(req: Request, res: Response<AlquilerListResponse>, next: NextFunction) {
	try {
		const { clienteId } = req.query;
		const alquileres = clienteId
			? await alquilerService.obtenerAlquileresPorClienteId(Number(clienteId))
      : await alquilerService.obtenerAlquileres();

		res.status(200).json({
			alquileres,
			total: alquileres.length,
		});
	} catch(error: any) {
		// Manejo específico para errores de conectividad de base de datos
		if (error.message && error.message.includes("Can't reach database server")) {
			console.log(`⚠️ ALQUILER CONTROLLER - Base de datos no disponible para obtener alquileres`);
			return res.status(200).json({ 
				alquileres: [],
				total: 0,
				message: 'No se pudieron obtener los alquileres en este momento'
			} as any);
		}
		next(error);
	}
}

export async function obtenerAlquileresPorComplejo(req: Request, res: Response<AlquilerListResponse>, next: NextFunction) {
	try {
		const { complejoId } = req.params;
		const alquileres = await alquilerService.obtenerAlquileresPorComplejo(Number(complejoId));
		res.status(200).json({
			alquileres,
			total: alquileres.length,
		});
	} catch(error) {
		next(error);
	}
}

export async function pagarAlquiler(req: Request, res: Response<AlquilerPagadoResponse>, next: NextFunction) {
	try {
		const { id } = req.params;
		const [pago, alquiler] = await alquilerService.pagarAlquiler(Number(id), req.body);
		res.status(200).json({
			pago,
			alquiler,
			message: 'El alquiler fue pagado',
		});
	} catch(error) {
		next(error);
	}
}

export async function actualizarAlquiler(req: Request,  res: Response<AlquilerResponse>, next: NextFunction) {
	try {
		const alquilerId = parseInt(req.params.id, 10);
    const alquiler = await alquilerService.obtenerAlquilerPorId(alquilerId);

    // Validaciones
    if (req.usuario.rol !== 'ADMINISTRADOR' && req.usuario.id !== alquiler.clienteId) {
      throw new UnauthorizedError();
    }
		const alquilerActualizado = await alquilerService.actualizarAlquiler(alquilerId, req.body);
    
		return res.status(200).json({
			alquiler: alquilerActualizado,
			message: 'Alquiler modificado exitosamente',
		});
	} catch (error) {
		next(error);
	}
}