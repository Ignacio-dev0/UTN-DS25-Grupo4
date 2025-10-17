// backend/src/controllers/cancha.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CanchaResponse, CanchaListResponse } from '../types/cancha.types';
import * as canchaService from '../services/cancha.service';

export async function crearCancha(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    console.log('🔍 CREAR CANCHA - Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🔍 CREAR CANCHA - Headers:', JSON.stringify(req.headers, null, 2));
    
    const cancha = await canchaService.crearCancha(req.body);
    
    console.log('✅ CREAR CANCHA - Cancha creada exitosamente:', cancha);
    
    res.status(201).json({
			cancha,
			message: 'Cancha creada exitosamente',
		});
  } catch (error) {
    console.error('💥 CREAR CANCHA - Error en el controlador:', error);
    console.error('💥 CREAR CANCHA - Error message:', error instanceof Error ? error.message : 'Error desconocido');
    console.error('💥 CREAR CANCHA - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
		next(error);
	}
};

export async function obtenerCanchas(req: Request, res: Response<CanchaListResponse>, next: NextFunction) {
  try {
    // Verificamos si la petición viene con un 'complejoId' en la query string
    const complejoId = Number(req.query.complejoId);
    // Verificar si se solicita incluir canchas inactivas (para dueños gestionando su complejo)
    const incluirInactivas = req.query.incluirInactivas === 'true';
    
    // Obtener filtros adicionales para búsqueda
    const filtros = {
      localidad: req.query.localidad as string,
      deporte: req.query.deporte as string,
      fecha: req.query.fecha as string,
      hora: req.query.hora as string
    };
    
		const canchas = complejoId ?
			await canchaService.obtenerCanchasPorComplejoId(complejoId, incluirInactivas) :
			await canchaService.obtenerCanchasConFiltros(incluirInactivas, filtros);

		return res.status(200).json({
				canchas,
				total: canchas.length,
		});
  } catch (error) {
		// Manejo específico para errores de conectividad de base de datos
		if (error.message && error.message.includes("Can't reach database server")) {
			console.log('⚠️ CANCHA CONTROLLER - Base de datos no disponible, devolviendo lista vacía');
			return res.status(200).json({
				canchas: [],
				total: 0,
				message: 'Servicio temporalmente no disponible'
			});
		}
		next(error);
  }
};

export async function obtenerCanchaPorId(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    // Permitir acceso a canchas inactivas si se especifica en query params (para dueños)
    const permitirInactiva = req.query.permitirInactiva === 'true';
    const cancha = await canchaService.obtenerCanchaPorId(id, permitirInactiva);
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

export async function obtenerCanchasPorComplejoId(req: Request, res: Response<CanchaListResponse>, next: NextFunction) {
  try {
    const complejoId = Number(req.params.complejoId);
    // Verificar si se solicita incluir canchas inactivas (para dueños gestionando su complejo)
    const incluirInactivas = req.query.incluirInactivas === 'true';
    const canchas = await canchaService.obtenerCanchasPorComplejoId(complejoId, incluirInactivas);
    return res.status(200).json({
      canchas,
      total: canchas.length,
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