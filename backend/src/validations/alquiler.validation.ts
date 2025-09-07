import { z } from 'zod';
import { EstadoAlquiler, MetodoPago } from '../generated/prisma';

export const createAlquilerSchema = z.object({

  clienteId: z.int(),

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