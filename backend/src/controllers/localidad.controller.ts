import { Request, Response, NextFunction } from "express";

import * as localidadService from "../services/localidad.service";

export const crearLoc = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuevaLoc = await localidadService.crearLocalidad(req.body);
        res.status(201).json(nuevaLoc);
    } catch (error) {
        next(error);
    }
};

export async function obtenerTodasLasLocalidades(req: Request, res: Response, next: NextFunction) {
    try {
        const localidades = await localidadService.obtenerTodasLasLocalidades();
        res.status(200).json({
            localidades,
            total: localidades.length
        });
    } catch (error) {
        next(error);
    }
};

export async function obtenerLocalidadById(req: Request, res: Response, next : NextFunction) {
    try {
        const {id} = req.params;
        const localidad = await localidadService.obtenerLocalidad(id);
        if (!localidad) {
            return res.status(404).json({error:'Localidad no encontrada'});
        }
        res.status(200).json(localidad);
    } catch (error) {
        next(error);
    }
};

export async function actualizarLocalidad(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.params.id);
        const localidad = await localidadService.actualizarLocalidad(id, req.body);
        res.status(200).json(localidad);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({error: 'Localidad no Encontrada'});
        }
        res.status(400).json({ error: error.message});
    }
};

export async function eliminarLocalidad(req : Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.params.id);
        await localidadService.eliminarLocalidad(id);
        res.status(200).json({ message: 'Localidad Eliminada'});
    }catch (error: any ) {
        if  (error.code === 'P2025') {
            return res.status(404).json({ error: 'Localidad no encontrada'});
        }
        res.status(400).json({error: error.message});
    }
};