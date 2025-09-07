import { z } from 'zod';

export const createCanchaSchema = z.object({
  
  nroCancha: z.int(),
  
  descripcion: z.string()
    .max(200, 'La descripcion no debe exceder los 200 caracteres')
    .optional(),
  
  image: z.array( z.string() )
    .min(1, 'Se debe recibir la url de al menos una imagen'),

  complejoId: z.int().positive(),

  deporteId: z.int().positive(),

});

export const updateCanchaSchema = z.object({

  nroCancha: z.int(),
  
  descripcion: z.string()
    .max(200, 'La descripcion no debe exceder los 200 caracteres')
    .optional(),
  
  image: z.array( z.string() )
    .min(1, 'Se debe recibir la url de al menos una imagen'),

  deporteId: z.int().positive(),

}).partial();