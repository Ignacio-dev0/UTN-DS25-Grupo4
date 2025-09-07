// backend/src/controllers/cancha.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CanchaResponse, CanchaListResponse } from '../types/cancha.types';
import * as canchaService from '../services/cancha.service';

export async function crearCancha(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const cancha = await canchaService.crearCancha(req.body);
    res.status(201).json({
			cancha,
			message: 'Cancha creada exitosamente',
		});
  } catch (error) {
		next(error);
	}
};

export async function obtenerCanchas(req: Request, res: Response<CanchaListResponse>, next: NextFunction) {
  try {
    // Verificamos si la petición viene con un 'complejoId' en la query string
    const complejoId = Number(req.query.complejoId);
		const canchas = complejoId ?
			await canchaService.obtenerCanchasPorComplejoId(complejoId) :
			await canchaService.obtenerCanchas();

		return res.status(200).json({
				canchas,
				total: canchas.length,
		});
  } catch (error) {
		next(error);
  }
};

export async function obtenerCanchaPorId(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const cancha = await canchaService.obtenerCanchaPorId(id);
    res.status(200).json({
			cancha,
			message: 'Cancha encontrada exitosamente',
		});
  } catch (error) {
		next(error);
	}
};

export async function actualizarCancha(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const cancha = await canchaService.actualizarCancha(id, req.body);
    res.status(200).json({
			cancha,
			message: 'Cancha actualizada exitosamente',
		});
  } catch (error) {
    next(error);
	}
};

export async function eliminarCancha(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const cancha = await canchaService.eliminarCancha(id);
    res.status(200).json({
			cancha,
			message: 'Cancha eliminada correctamente.' });
  } catch (error) {
		next(error);
	}
};