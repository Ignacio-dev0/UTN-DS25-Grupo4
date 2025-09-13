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
    const complejos = await complejoService.getAllComplejos();
    res.status(200).json({
      complejos,
      total: complejos.length,
    });
  } catch (error) {
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
    console.log('=== ACTUALIZANDO COMPLEJO ===');
    console.log('ID del complejo:', req.params.id);
    console.log('Datos recibidos en req.body:', JSON.stringify(req.body, null, 2));
    console.log('Tipo de datos:');
    Object.keys(req.body).forEach(key => {
      console.log(`  ${key}: ${typeof req.body[key]} = ${req.body[key]}`);
    });
    
    const id = parseInt(req.params.id);
    const complejoActualizado = await complejoService.updateComplejo(id, req.body);
    res.status(200).json({
      complejoActualizado,
      message:('complejo actualizado')
    });
  } catch (error: any) {
    console.error('Error en actualizarComplejo:', error);
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
    await complejoService.deleteComplejo_sol_dom(id);
    res.status(200).json({ 
      message: 'Complejo eliminado correctamente. El usuario dueño asociado también fue eliminado.' 
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complejo no encontrado.' });
    }
    res.status(400).json({ error: error.message });
  }
};