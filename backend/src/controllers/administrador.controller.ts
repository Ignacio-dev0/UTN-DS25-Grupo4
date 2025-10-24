import { Request, Response, NextFunction } from 'express';
import { AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';
import * as administradorService from '../services/administrador.service';

// FUNCIONES DEPRECADAS - Los administradores ahora se manejan en la tabla Usuario con rol ADMINISTRADOR
// Estas funciones se mantienen para compatibilidad pero lanzan errores

export async function crearAdministrador(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const administrador = await administradorService.crearAdministrador();
    res.status(201).json({
      administrador,
      message: 'Administrador creado',
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerAdministradorPorId(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    const administrador = await administradorService.obtenerAdministradorPorId();
    if (!administrador) throw 'Administrador no encontrado';

    res.status(200).json({
      administrador,
      message: 'Administrador encontrado',
    })
  } catch(error) {
    next(error);
  }
}

export async function obtenerAdministradores(req: Request, res: Response<AdministradorListResponse>, next: NextFunction) {
  try {
    const administradores = await administradorService.obtenerAdministradores();
    res.status(200).json({
      administradores,
      total: administradores.length,
    })
  } catch (error) {
    next(error);
  }
}

export async function eliminarAdministrador(req: Request, res: Response<{ message: string }>, next: NextFunction) {
  try {
    const { id } = req.params;
    await administradorService.eliminarAdministrador();
    res.status(200).json({
      message: 'Administrador eliminado',
    });
  } catch (error) {
    next(error);
  }
}