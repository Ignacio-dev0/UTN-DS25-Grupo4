// backend/src/controllers/cancha.controller.ts
import { Request, Response } from 'express';
import * as canchaService from '../services/cancha.service';

export const crearCancha = async (req: Request, res: Response) => {
  try {
    const nuevaCancha = await canchaService.crearCancha(req.body);
    res.status(201).json(nuevaCancha);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerCanchas = async (req: Request, res: Response) => {
  try {
    // Verificamos si la petición viene con un 'complejoId' en la query string
    const complejoId = req.query.complejoId;

    if (complejoId) {
      const canchas = await canchaService.obtenerCanchasPorComplejoId(Number(complejoId));
      return res.status(200).json(canchas);
    }

    const canchas = await canchaService.obtenerCanchas();
    res.status(200).json(canchas);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener las canchas.' });
  }
};

export const obtenerCanchaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cancha = await canchaService.obtenerCanchaPorId(id);
    if (!cancha) {
      return res.status(404).json({ error: 'Cancha no encontrada.' });
    }
    res.status(200).json(cancha);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener la cancha.' });
  }
};

export const actualizarCancha = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const canchaActualizada = await canchaService.actualizarCancha(id, req.body);
    res.status(200).json(canchaActualizada);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cancha no encontrada.' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const eliminarCancha = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await canchaService.eliminarCancha(id);
    res.status(200).json({ message: 'Cancha eliminada correctamente.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cancha no encontrada.' });
    }
    res.status(400).json({ error: error.message });
  }
};