// backend/src/validations/servicio.validation.ts
import { z } from 'zod';

export const createServicioSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  icono: z.string()
    .url('El icono debe ser una URL válida')
    .optional()
});

export const updateServicioSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  icono: z.string()
    .url('El icono debe ser una URL válida')
    .optional()
});

export const addServicioToComplejoSchema = z.object({
  servicioId: z.number()
    .int('El ID del servicio debe ser un entero')
    .positive('El ID del servicio debe ser positivo'),
  disponible: z.boolean()
    .optional()
    .default(true)
});

export const updateComplejoServicioSchema = z.object({
  disponible: z.boolean('La disponibilidad debe ser un valor booleano')
});
