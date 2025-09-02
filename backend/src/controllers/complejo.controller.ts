// backend/src/controllers/complejo.controller.ts
import { Request, Response } from 'express';
import * as complejoService from '../services/complejo.service';

export const crearComplejo = async (req: Request, res: Response) => {
  try {
    // Aquí podrías agregar validaciones de los datos que vienen en req.body
    const nuevoComplejo = await complejoService.crearComplejo(req.body);
    res.status(201).json(nuevoComplejo);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerComplejos = async (_req: Request, res: Response) => {
  try {
    const complejos = await complejoService.obtenerComplejos();
    res.status(200).json(complejos);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener los complejos.' });
  }
};

export const obtenerComplejoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const complejo = await complejoService.obtenerComplejoPorId(id);
    if (!complejo) {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(200).json(complejo);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener el complejo.' });
  }
};

export const actualizarComplejo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const complejoActualizado = await complejoService.actualizarComplejo(id, req.body);
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
    const id = Number(req.params.id);
    await complejoService.eliminarComplejo(id);
    res.status(200).json({ message: 'Complejo eliminado correctamente.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(400).json({ error: error.message });
  }
};