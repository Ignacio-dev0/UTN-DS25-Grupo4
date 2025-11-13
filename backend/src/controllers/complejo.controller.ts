
import { Request, Response, NextFunction } from 'express';
import * as complejoService from '../services/complejo.service';

export const crearComplejo = async (req: Request, res: Response, next:NextFunction) => {
  try {
    // Aquí podrías agregar validaciones de los datos que vienen en req.body
    const nuevoComplejo = await complejoService.createComplejo(req.body);
    res.status(201).json(nuevoComplejo);
  } catch (error) {
    next(error);
  }
};

export const obtenerComplejos = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const complejos = await complejoService.getAllComplejos();
    res.status(200).json({
      complejos,
      total: complejos.length,
    });
  } catch (error) {
    // Manejo específico para errores de conectividad de base de datos
    if (error.message && error.message.includes("Can't reach database server")) {
      console.log('⚠️ COMPLEJO CONTROLLER - Base de datos no disponible, devolviendo lista vacía');
      return res.status(200).json({
        complejos: [],
        total: 0,
        message: 'Servicio temporalmente no disponible'
      });
    }
    next(error);
    console.log(error);
  }
};

export const obtenerComplejosAprobados = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const complejos = await complejoService.getComplejosAprobados();
    res.status(200).json({
      complejos,
      total: complejos.length,
    });
  } catch (error) {
    // Manejo específico para errores de conectividad de base de datos
    if (error.message && error.message.includes("Can't reach database server")) {
      console.log('⚠️ COMPLEJO CONTROLLER - Base de datos no disponible, devolviendo lista vacía');
      return res.status(200).json({
        complejos: [],
        total: 0,
        message: 'Servicio temporalmente no disponible'
      });
    }
    next(error);
    console.log(error);
  }
};

export const obtenerComplejoPorId = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const complejo = await complejoService.getComplejoById(id);
    if (!complejo) {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(200).json({
      complejo,
      message:('complejo encontrado')
    });
  } catch (error) {
    console.log(error)
  }
};

export const actualizarComplejo = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const complejoId = Number(req.params.id);
    
    console.log('🔍 [CONTROLLER] Actualizando complejo:', complejoId);
    console.log('🔍 [CONTROLLER] Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [CONTROLLER] Usuario:', { id: req.usuario.id, rol: req.usuario.rol });

    // Permitir actualización si es administrador o si es el dueño del complejo
    if(req.usuario.rol !== 'ADMINISTRADOR' && !await complejoService.esDuenioDeComplejo(complejoId, req.usuario.id)) {
      throw new Error('No tienes permiso para actualizar este complejo.');
    }

    const complejoActualizado = await complejoService.updateComplejo(complejoId, req.body);
    res.status(200).json({
      complejo: complejoActualizado,
      message: 'Complejo actualizado'
    });
  } catch (error: any) {
    console.error('❌ Error en actualizarComplejo:', error);
    // Prisma tira un error específico si el registro a actualizar no existe
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const eliminarComplejo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log(`🗑️ [${new Date().toISOString()}] Attempting to delete complejo with ID: ${id}`);
    
    await complejoService.deleteComplejo_sol_dom(id);
    console.log(`✅ [${new Date().toISOString()}] Complejo deleted successfully with ID: ${id}`);
    
    res.status(200).json({ 
      message: 'Complejo eliminado correctamente. El usuario dueño asociado también fue eliminado.' 
    });
  } catch (error: any) {
    console.error(`❌ [${new Date().toISOString()}] Error deleting complejo:`, {
      id: req.params.id,
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};