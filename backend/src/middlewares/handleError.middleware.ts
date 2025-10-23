import { Request, Response, NextFunction } from "express";

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Peticion invalida") {
    super(message, 400);
  }
}

export default function handleError(err: any, req: Request, res: Response, _next: NextFunction) {
    console.error('💥 ERROR GLOBAL MIDDLEWARE:', {
        url: req.url,
        method: req.method,
        body: req.body,
        error: err.message,
        stack: err.stack
    });

    // Error de validación de Zod
    if (err.name === 'ZodError') {
        return res.status(400).json({
            message: 'Error de validación',
            errors: err.issues,
            details: 'Los datos enviados no cumplen con el formato requerido'
        });
    }

    // Error de Prisma (base de datos)
    if (err.code) {
        // Error de constraint único
        if (err.code === 'P2002') {
            return res.status(409).json({
                message: 'Error de duplicación',
                details: 'Ya existe un registro con esos datos únicos'
            });
        }
        // Error de foreign key
        if (err.code === 'P2003') {
            return res.status(400).json({
                message: 'Error de referencia',
                details: 'Los datos referenciados no existen'
            });
        }
        // Error de not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                message: 'Registro no encontrado',
                details: 'El recurso solicitado no existe'
            });
        }
    }

    // Error con código de estado personalizado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message || 'Error en el servidor',
            details: err.details || 'Se produjo un error procesando la solicitud'
        });
    }

    // Error genérico del servidor
    return res.status(500).json({
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
    });
}