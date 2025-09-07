import { z } from 'zod';

export const createCanchaSchema = z.object({
  body: z.object({
    
    nroCancha: z.int(),
    
    descripcion: z.string()
      .max(200, 'La descripcion no debe exceder los 200 caracteres')
      .optional(),
    
    image: z.array( z.string() )
      .min(1, 'Se debe recibir la url de al menos una imagen'),
    
    complejoId: z.int('ComplejoId debe ser un entero'),
    
    deporteId: z.int('DeporteId debe ser un entero'),

  }),

});

export const updateCanchaSchema = z.object({
  body: z.object({

    nroCancha: z.int(),
    
    descripcion: z.string()
    .max(200, 'La descripcion no debe exceder los 200 caracteres')
    .optional(),
    
    image: z.array( z.string() )
    .min(1, 'Se debe recibir la url de al menos una imagen'),
    
    deporteId: z.int().positive(),

  }),

}).partial();