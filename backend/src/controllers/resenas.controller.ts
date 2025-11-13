
import { Request, Response, NextFunction } from 'express';
import * as resenasService from '../services/resenas.service';
import { CreateReseniaRequest, UpdateReseniaRequest, ReseniaResponse, ReseniaListResponse } from '../types/resenia.types';

export async function crearResenia(req: Request<{}, ReseniaResponse, CreateReseniaRequest>, res: Response<ReseniaResponse>) {
    try {
        console.log('🔍 CREAR RESEÑA - Datos recibidos:', JSON.stringify(req.body, null, 2));
        
        // Validar que los datos requeridos estén presentes
        const { descripcion, puntaje, alquilerId } = req.body;
        
        if (!descripcion || puntaje === undefined || !alquilerId) {
            console.log('❌ CREAR RESEÑA - Faltan datos requeridos');
            return res.status(400).json({
                resenia: null,
                message: 'Faltan datos requeridos: descripcion, puntaje, alquilerId'
            } as any);
        }

        // Validar tipos de datos
        if (typeof puntaje !== 'number' || typeof alquilerId !== 'number') {
            console.log('❌ CREAR RESEÑA - Tipos de datos incorrectos');
            return res.status(400).json({
                resenia: null,
                message: 'El puntaje y alquilerId deben ser números'
            } as any);
        }

        console.log('🚀 CREAR RESEÑA - Creando reseña...');
        const nuevaResenia = await resenasService.createResenia(req.body);
        
        console.log('✅ CREAR RESEÑA - Reseña creada exitosamente:', nuevaResenia.id);
        res.status(201).json({
            resenia: nuevaResenia,
            message: 'Reseña creada exitosamente'
        });
    } catch (error: any) {
        console.error('💥 CREAR RESEÑA - Error:', error);
        
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
        const resenas = await resenasService.getResenasByCanchaId(parseInt(canchaId));
        res.json({
            resenas,
            total: resenas.length
        });
    } catch (error) {
        // Si hay problema de conectividad, devolver resultado vacío en lugar de error 500
        if (error instanceof Error && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ Base de datos no disponible para cancha ${req.params.canchaId}, devolviendo resultado vacío`);
            res.json({
                resenas: [],
                total: 0
            });
            return;
        }
        next(error);
    }
}

export async function obtenerPuntajesResenasPorCancha(req: Request<{canchaId: string}>, res: Response, next: NextFunction) {
    try {
        const { canchaId } = req.params;
        const puntajes = await resenasService.getReseniasPuntajesByCanchaId(parseInt(canchaId));
        
        // Calcular estadísticas
        const total = puntajes.length;
        const promedio = total > 0 ? puntajes.reduce((sum, r) => sum + r.puntaje, 0) / total : 0;
        
        res.json({
            total,
            promedio: parseFloat(promedio.toFixed(1)),
            puntajes: puntajes.map(p => p.puntaje)
        });
    } catch (error) {
        // Si hay problema de conectividad, devolver resultado vacío en lugar de error 500
        if (error instanceof Error && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ Base de datos no disponible para puntajes cancha ${req.params.canchaId}, devolviendo resultado vacío`);
            res.json({
                total: 0,
                promedio: 0,
                puntajes: []
            });
            return;
        }
        next(error);
    }
}

export async function obtenerPuntajesResenasLote(req: Request, res: Response, next: NextFunction) {
    try {
        const { canchaIds } = req.body;
        
        if (!Array.isArray(canchaIds)) {
            return res.status(400).json({
                error: 'canchaIds debe ser un array de números'
            });
        }

        const resultado: {[key: number]: {total: number, promedio: number, puntajes: number[]}} = {};
        
        // Procesar canchas en paralelo
        const promesas = canchaIds.map(async (canchaId: number) => {
            try {
                const puntajes = await resenasService.getReseniasPuntajesByCanchaId(canchaId);
                const total = puntajes.length;
                const promedio = total > 0 ? puntajes.reduce((sum, r) => sum + r.puntaje, 0) / total : 0;
                
                resultado[canchaId] = {
                    total,
                    promedio: parseFloat(promedio.toFixed(1)),
                    puntajes: puntajes.map(p => p.puntaje)
                };
            } catch (error) {
                console.log(`⚠️ Error obteniendo puntajes para cancha ${canchaId}:`, error);
                resultado[canchaId] = {
                    total: 0,
                    promedio: 0,
                    puntajes: []
                };
            }
        });

        await Promise.all(promesas);
        
        res.json(resultado);
    } catch (error) {
        console.error('Error en obtenerPuntajesResenasLote:', error);
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