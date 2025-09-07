import { Request, Response, NextFunction } from 'express';
import { AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';
import * as administradorService from '../services/administrador.service';

export async function crearAdministrador(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const administrador = await administradorService.crearAdministrador(req.body);
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
    const administrador = await administradorService.obtenerAdministradorPorId(Number(id));
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