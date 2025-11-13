
import { Request, Response, NextFunction } from 'express';
import { CanchaResponse, CanchaListResponse, CanchaFull } from '../types/cancha.types';
import * as canchaService from '../services/cancha.service';
import * as complejoService from '../services/complejo.service';

export async function crearCancha(req: Request, res: Response<CanchaResponse>, next: NextFunction) {
  try {
    const complejo = await complejoService.getComplejoById(req.body.complejoId);
    // Permitir si es administrador o si es dueño del complejo
    if (req.usuario.rol !== 'ADMINISTRADOR' && complejo.usuarioId !== req.usuario.id) {
      throw new Error('No tienes permiso para crear una cancha en este complejo.');
    }
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
    
    // Si hay filtros de búsqueda, usar la función con filtros
    const tieneFiltros = filtros.localidad || filtros.deporte || filtros.fecha || filtros.hora;
    
		const canchas: CanchaFull[] = complejoId ?
			await canchaService.obtenerCanchasPorComplejoId(complejoId, incluirInactivas) :
			tieneFiltros ?
				await canchaService.obtenerCanchasConFiltros(incluirInactivas, filtros) :
				await canchaService.obtenerCanchas(incluirInactivas);

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
    const canchaId = Number(req.params.id);
    const { usuario } = req;
    
    console.log('🔧 ACTUALIZAR CANCHA - ID:', canchaId);
    console.log('👤 Usuario:', usuario.email, 'Rol:', usuario.rol);
    console.log('📦 Datos recibidos:', req.body);
    
    // Verificar que la cancha existe primero (permitir inactivas para que el dueño pueda reactivarlas)
    try {
      const canchaExistente = await canchaService.obtenerCanchaPorId(canchaId, true); // Permitir inactivas
      console.log('✅ Cancha encontrada:', canchaExistente.id, 'Complejo:', canchaExistente.complejoId, 'Activa:', canchaExistente.activa);
    } catch (error) {
      console.error('❌ Cancha no encontrada:', canchaId);
      return res.status(404).json({
        message: 'Cancha no encontrada',
        cancha: null
      } as any);
    }
    
    // Permitir si es administrador o si es dueño de la cancha
    if(usuario.rol !== 'ADMINISTRADOR') {
      const esDuenio = await canchaService.esDuenioDeCancha(canchaId, usuario.id);
      console.log('🔑 Es dueño de la cancha?', esDuenio);
      
      if (!esDuenio) {
        console.error('🚫 Usuario no tiene permiso para actualizar esta cancha');
        return res.status(403).json({
          message: 'No tienes permiso para actualizar esta cancha. Solo el dueño del complejo o un administrador pueden hacerlo.',
          cancha: null
        } as any);
      }
    }
    
    console.log('💾 Datos que se van a actualizar:', req.body);
    const cancha = await canchaService.actualizarCancha(canchaId, req.body);
    console.log('✅ Cancha actualizada:', { id: cancha.id, activa: cancha.activa });
    
    res.status(200).json({
			cancha,
			message: 'Cancha actualizada exitosamente',
		});
  } catch (error) {
    console.error('❌ Error al actualizar cancha:', error);
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
    console.log('🗑️ Request para eliminar cancha - ID:', req.params.id);
    const canchaId = Number(req.params.id);
    const usuarioId = req.usuario.id;
    console.log('👤 Usuario ID:', usuarioId, 'Rol:', req.usuario.rol);

    if(req.usuario.rol !== 'ADMINISTRADOR' && !(await canchaService.esDuenioDeCancha(canchaId, usuarioId))) {
      console.log('❌ Usuario no tiene permiso');
      throw new Error('No tienes permiso para eliminar esta cancha.');
    }

    const cancha = await canchaService.eliminarCancha(canchaId);
    console.log('✅ Cancha eliminada exitosamente');
    res.status(200).json({
			cancha,
			message: 'Cancha eliminada correctamente.'
    });
  } catch (error) {
    console.error('❌ ERROR eliminando cancha:', error);
		next(error);
	}
};