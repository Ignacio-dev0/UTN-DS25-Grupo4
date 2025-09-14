import { z } from 'zod';

export const createTurnoSchema = z.object({
  body: z.object({
    fecha: z.coerce.date(),
    horaInicio: z.coerce.date(),
    precio: z.number().positive(),
    reservado: z.boolean().optional(),
    canchaId: z.int().positive(),
  })
})

export const updateTurnoSchema = z.object({
  body: z.object({
    fecha: z.coerce.date().optional(),
    horaInicio: z.coerce.date().optional(),
    precio: z.number().positive().optional(),
    reservado: z.boolean().optional(),
  })
})