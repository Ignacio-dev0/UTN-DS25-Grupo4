/**
 * Middleware para manejo de errores de conectividad de base de datos
 * Proporciona respuestas gracefully degraded cuando Supabase no está disponible
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Función helper para detectar errores de conectividad de base de datos
 */
export function isDatabaseConnectionError(error: any): boolean {
    return error && 
           error.message && 
           (error.message.includes("Can't reach database server") ||
            error.message.includes("Connection refused") ||
            error.message.includes("timeout"));
}

/**
 * Maneja errores de conectividad devolviendo respuestas vacías apropiadas
 */
export function handleDatabaseConnectionError(
    error: any,
    req: Request,
    res: Response,
    emptyResponse: any,
    next: NextFunction
) {
    if (isDatabaseConnectionError(error)) {
        const endpoint = req.originalUrl;
        console.log(`⚠️ DATABASE CONNECTIVITY - ${endpoint} - Base de datos no disponible, devolviendo respuesta vacía`);
        
        return res.status(200).json({
            ...emptyResponse,
            message: 'Servicio temporalmente no disponible'
        });
    }
    
    // Si no es un error de conectividad, continúa con el manejo normal
    next(error);
}

/**
 * Wrapper para controladores que automaticamente maneja errores de DB
 */
export function withDatabaseErrorHandling(
    controllerFn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
    emptyResponse: any
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await controllerFn(req, res, next);
        } catch (error) {
            handleDatabaseConnectionError(error, req, res, emptyResponse, next);
        }
    };
}

/**
 * Respuestas vacías típicas para diferentes endpoints
 */
export const EMPTY_RESPONSES = {
    canchas: {
        canchas: [],
        total: 0
    },
    deportes: {
        deportes: [],
        total: 0
    },
    complejos: {
        complejos: [],
        total: 0
    },
    resenas: {
        resenas: [],
        total: 0,
        promedio: 0,
        distribucion: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        }
    },
    turnos: {
        turnos: [],
        total: 0
    },
    usuarios: {
        usuarios: [],
        total: 0
    }
};