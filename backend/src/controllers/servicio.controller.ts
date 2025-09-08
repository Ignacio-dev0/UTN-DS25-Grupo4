// backend/src/controllers/servicio.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as servicioService from '../services/servicio.service';

export const getAllServicios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const servicios = await servicioService.getAllServicios();
    res.json({ servicios, total: servicios.length });
  } catch (error) {
    console.error('Error en getAllServicios:', error);
    next(error);
  }
};

export const getServicioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const servicio = await servicioService.getServicioById(parseInt(id));
    
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    res.json({ servicio });
  } catch (error) {
    console.error('Error en getServicioById:', error);
    next(error);
  }
};

export const createServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nuevoServicio = await servicioService.createServicio(req.body);
    res.status(201).json({ 
      servicio: nuevoServicio, 
      message: 'Servicio creado correctamente' 
    });
  } catch (error) {
    console.error('Error en createServicio:', error);
    next(error);
  }
};

export const updateServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const servicioActualizado = await servicioService.updateServicio(parseInt(id), req.body);
    res.json({ 
      servicio: servicioActualizado, 
      message: 'Servicio actualizado correctamente' 
    });
  } catch (error) {
    console.error('Error en updateServicio:', error);
    next(error);
  }
};

export const deleteServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await servicioService.deleteServicio(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error en deleteServicio:', error);
    next(error);
  }
};

export const getServiciosByComplejo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { complejoId } = req.params;
    const servicios = await servicioService.getServiciosByComplejo(parseInt(complejoId));
    res.json({ servicios, total: servicios.length });
  } catch (error) {
    console.error('Error en getServiciosByComplejo:', error);
    next(error);
  }
};

export const addServicioToComplejo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { complejoId } = req.params;
    const complejoServicio = await servicioService.addServicioToComplejo({
      complejoId: parseInt(complejoId),
      ...req.body
    });
    res.status(201).json({ 
      complejoServicio, 
      message: 'Servicio agregado al complejo correctamente' 
    });
  } catch (error) {
    console.error('Error en addServicioToComplejo:', error);
    next(error);
  }
};

export const removeServicioFromComplejo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { complejoId, servicioId } = req.params;
    const result = await servicioService.removeServicioFromComplejo(
      parseInt(complejoId), 
      parseInt(servicioId)
    );
    res.json(result);
  } catch (error) {
    console.error('Error en removeServicioFromComplejo:', error);
    next(error);
  }
};

export const updateComplejoServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { complejoId, servicioId } = req.params;
    const complejoServicio = await servicioService.updateComplejoServicio(
      parseInt(complejoId), 
      parseInt(servicioId), 
      req.body
    );
    res.json({ 
      complejoServicio, 
      message: 'Servicio del complejo actualizado correctamente' 
    });
  } catch (error) {
    console.error('Error en updateComplejoServicio:', error);
    next(error);
  }
};
