import { z } from 'zod';
import { EstadoAlquiler, MetodoPago } from '@prisma/client';

export const createAlquilerSchema = z.object({
  usuarioId: z.number(),
  turnosIds: z.array(z.number()).min(1).max(3),
});

export const pagarAlquilerSchema = z.object({
  
  estado: z.enum([
    EstadoAlquiler.PAGADO,
  ]),
  
  metodoPago: z.enum([
    MetodoPago.CREDITO,
    MetodoPago.DEBITO,
    MetodoPago.TRANSFERENCIA,
  ]),
  
  codigoTransaccion: z.string().optional(),

});

export const updateAlquilerSchema = z.object({
  
  estado: z.enum([
    EstadoAlquiler.CANCELADO,
    EstadoAlquiler.FINALIZADO,
  ]),

});