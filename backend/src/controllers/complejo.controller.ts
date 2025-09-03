// backend/src/controllers/complejo.controller.ts
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
    const complejos = await complejoService.getAllComplejo();
    res.status(200).json(complejos);
  } catch (error) {
    next(error);
  }
};

export const obtenerComplejoPorId = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const complejo = await complejoService.getComplejoById(id);
    if (!complejo) {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(200).json(complejo);
  } catch (error) {
    next(error);
  }
};

export const actualizarComplejo = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const complejoActualizado = await complejoService.updateComplejo(id, req.body);
    res.status(200).json(complejoActualizado);
  } catch (error: any) {
    // Prisma tira un error específico si el registro a actualizar no existe
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const eliminarComplejo = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await complejoService.deleteComplejo(id);
    res.status(200).json({ message: 'Complejo eliminado correctamente.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(400).json({ error: error.message });
  }
};