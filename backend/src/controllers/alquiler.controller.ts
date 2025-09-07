import { Request, Response, NextFunction } from "express";
import { AlquilerResponse, AlquilerListResponse, AlquilerPagadoResponse } from "../types/alquiler.types";
import * as alquilerService from "../services/alquiler.service";

export async function crearAlquiler(req: Request, res: Response<AlquilerResponse>, next: NextFunction) {
	try {
		const alquiler = await alquilerService.crearAlquiler(req.body);
		res.status(201).json({
			alquiler,
			message: 'Alquiler creado exitosamente',
		});
	} catch(error) {
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
	} catch(error) {
		next(error);
	}
}

export async function obtenerAlquileres(req: Request, res: Response<AlquilerListResponse>, next: NextFunction) {
	try {
		const { clienteId } = req.query;
		const alquileres = clienteId ?
			await alquilerService.obtenerAlquileresPorClienteId(Number(clienteId)) :
			await alquilerService.obtenerAlquileres();

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
		const { id } = req.params;
		const alquiler = await alquilerService.actualizarAlquiler(Number(id), req.body);
		res.status(200).json({
			alquiler,
			message: 'Alquiler modificado exitosamente',
		});
	} catch (error) {
		next(error);
	}
}