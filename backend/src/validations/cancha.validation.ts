import { z } from 'zod';

export const createCanchaSchema = z.object({
  
  // nroCancha se genera automáticamente, no debe venir del frontend
  
  descripcion: z.string()
    .max(200, 'La descripcion no debe exceder los 200 caracteres')
    .optional(),
  
  image: z.array( z.string() )
    .optional(),

  complejoId: z.int().positive(),

  deporteId: z.int().positive(),

});

export const updateCanchaSchema = z.object({

  nroCancha: z.int(),
  
  descripcion: z.string()
    .max(200, 'La descripcion no debe exceder los 200 caracteres')
    .optional(),
  
  image: z.array( z.string() )
    .optional(),

  activa: z.boolean().optional(),

  deporteId: z.int().positive(),

}).partial();