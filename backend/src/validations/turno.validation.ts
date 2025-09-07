import { z } from 'zod';

export const createTurnoSchema = z.object({
  body: z.object({
    fechaHora: z.coerce.date(),
    precio: z.number().positive(),
    canchaId: z.int().positive(),
  })
})

export const updateTurnoSchema = z.object({
  body: z.object({
    precio: z.number().positive(),
  })
})