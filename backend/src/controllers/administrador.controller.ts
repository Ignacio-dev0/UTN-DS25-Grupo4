import { Request, Response, NextFunction } from 'express';
import { AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';
import * as administradorService from '../services/administrador.service';

export async function crearAdministrador(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' } as any);
    }

    const administrador = await administradorService.crearAdministrador({ email, password });
    res.status(201).json({
      administrador,
      message: 'Administrador creado exitosamente',
    });
  } catch (error: any) {
    if (error.message === 'Email ya registrado') {
      return res.status(400).json({ error: error.message } as any);
    }
    next(error);
  }
}

export async function obtenerAdministradorPorId(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const administrador = await administradorService.obtenerAdministradorPorId(id);
    
    if (!administrador) {
      return res.status(404).json({ error: 'Administrador no encontrado' } as any);
    }

    res.status(200).json({
      administrador,
      message: 'Administrador encontrado',
    });
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
    });
  } catch (error) {
    next(error);
  }
}

export async function actualizarAdministrador(req: Request, res: Response<AdministradorResponse>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { email, password } = req.body;

    const administrador = await administradorService.actualizarAdministrador(id, { email, password });
    res.status(200).json({
      administrador,
      message: 'Administrador actualizado exitosamente',
    });
  } catch (error: any) {
    if (error.message === 'Email ya registrado') {
      return res.status(400).json({ error: error.message } as any);
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Administrador no encontrado' } as any);
    }
    next(error);
  }
}

export async function eliminarAdministrador(req: Request, res: Response<{ message: string }>, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await administradorService.eliminarAdministrador(id);
    res.status(200).json({
      message: 'Administrador eliminado exitosamente',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Administrador no encontrado' } as any);
    }
    next(error);
  }
}