import { Request, Response, NextFunction } from "express";

import * as localidadService from "../services/localidad.service";

export const crearLoc = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('🔍 CREAR LOCALIDAD - Datos recibidos:', JSON.stringify(req.body, null, 2));
        const nuevaLoc = await localidadService.crearLocalidad(req.body);
        console.log('✅ CREAR LOCALIDAD - Localidad creada exitosamente:', nuevaLoc.id);
        res.status(201).json(nuevaLoc);
    } catch (error) {
        console.error('💥 CREAR LOCALIDAD - Error:', error);
        next(error);
    }
};

export async function obtenerTodasLasLocalidades(req: Request, res: Response, next: NextFunction) {
    try {
        console.log('🔍 OBTENER LOCALIDADES - Iniciando consulta...');
        console.log('🔍 Headers recibidos:', req.headers);
        console.log('🔍 Origin:', req.headers.origin);
        
        const localidades = await localidadService.obtenerTodasLasLocalidades();
        
        console.log('✅ OBTENER LOCALIDADES - Consulta exitosa, encontradas:', localidades.length);
        
        res.status(200).json({
            localidades,
            total: localidades.length
        });
    } catch (error) {
        console.error('💥 OBTENER LOCALIDADES - Error:', error);
        next(error);
    }
};

export async function obtenerLocalidadById(req: Request, res: Response, next : NextFunction) {
    try {
        const {id} = req.params;
        const localidad = await localidadService.obtenerLocalidad(parseInt(id));
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
        if (error.code === 'P2003') {
            throw new Error('No se puede eliminar la localidad porque está siendo utilizada por uno o más domicilios.');
        }
        res.status(400).json({error: error.message});
    }
};