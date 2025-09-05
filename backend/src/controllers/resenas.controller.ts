// backend/src/controllers/resenas.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as resenasService from '../services/resenas.service';
import { CreateReseniaRequest, UpdateReseniaRequest, ReseniaResponse, ReseniaListResponse } from '../types/resenia.types';

export async function crearResenia(req: Request<{}, ReseniaResponse, CreateReseniaRequest>, res: Response<ReseniaResponse>) {
    try {
        const nuevaResenia = await resenasService.createResenia(req.body);
        res.status(201).json({
            resenia: nuevaResenia,
            message: 'Reseña creada exitosamente'
        });
    } catch (error: any) {
        if (error.statusCode === 400) {
            return res.status(400).json({
                resenia: null,
                message: error.message
            } as any);
        }
        if (error.statusCode === 404) {
            return res.status(404).json({
                resenia: null,
                message: 'El alquiler no existe'
            } as any);
        }
        if (error.statusCode === 409) {
            return res.status(409).json({
                resenia: null,
                message: 'Este alquiler ya tiene una reseña'
            } as any);
        }
        res.status(500).json({
            resenia: null,
            message: 'Error interno del servidor'
        } as any);
    }
}

export async function obtenerTodasLasResenas(req: Request, res: Response<ReseniaListResponse>, next: NextFunction) {
    try {
        const resenas = await resenasService.getAllResenas();
        res.json({
            resenas,
            total: resenas.length
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerReseniaPorId(req: Request<{id: string}>, res: Response<ReseniaResponse>, next: NextFunction) {
    try {
        const { id } = req.params;
        const resenia = await resenasService.getReseniaById(parseInt(id));
        
        if (!resenia) {
            return res.status(404).json({
                resenia: null,
                message: 'Reseña no encontrada'
            } as any);
        }
        
        res.json({
            resenia,
            message: 'Reseña obtenida exitosamente'
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerResenasPorComplejo(req: Request<{complejoId: string}>, res: Response<ReseniaListResponse>, next: NextFunction) {
    try {
        const { complejoId } = req.params;
        const resenas = await resenasService.getResenasByComplejo(parseInt(complejoId));
        res.json({
            resenas,
            total: resenas.length
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerResenasPorCancha(req: Request<{canchaId: string}>, res: Response<ReseniaListResponse>, next: NextFunction) {
    try {
        const { canchaId } = req.params;
        const resenas = await resenasService.getResenasByCancha(parseInt(canchaId));
        res.json({
            resenas,
            total: resenas.length
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerResenasPorUsuario(req: Request<{usuarioId: string}>, res: Response<ReseniaListResponse>, next: NextFunction) {
    try {
        const { usuarioId } = req.params;
        const resenas = await resenasService.getResenasByUsuario(parseInt(usuarioId));
        res.json({
            resenas,
            total: resenas.length
        });
    } catch (error) {
        next(error);
    }
}

export async function actualizarResenia(req: Request<{id: string}, ReseniaResponse, UpdateReseniaRequest>, res: Response<ReseniaResponse>) {
    try {
        const { id } = req.params;
        const reseniaActualizada = await resenasService.updateResenia(parseInt(id), req.body);
        res.json({
            resenia: reseniaActualizada,
            message: 'Reseña actualizada exitosamente'
        });
    } catch (error: any) {
        if (error.statusCode === 400) {
            return res.status(400).json({
                resenia: null,
                message: error.message
            } as any);
        }
        if (error.statusCode === 404) {
            return res.status(404).json({
                resenia: null,
                message: 'Reseña no encontrada'
            } as any);
        }
        return res.status(500).json({
            resenia: null,
            message: 'Error interno del servidor'
        } as any);
    }
}

export async function eliminarResenia(req: Request<{id: string}>, res: Response) {
    try {
        const { id } = req.params;
        const reseniaEliminada = await resenasService.deleteResenia(parseInt(id));
        res.json({
            resenia: reseniaEliminada,
            message: 'Reseña eliminada exitosamente'
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return res.status(404).json({
                error: 'Reseña no encontrada',
                message: 'La reseña que intentas eliminar no existe'
            });
        }
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar la reseña'
        });
    }
}