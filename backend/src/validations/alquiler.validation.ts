import { z } from 'zod';
import { EstadoAlquiler, MetodoPago } from '@prisma/client';

export const createAlquilerSchema = z.object({
  usuarioId: z.number(),
  // Permite enviar el mismo turno múltiples veces para reservar bloques consecutivos
  // Ej: [123, 123, 123] = reservar 3 bloques consecutivos desde el turno 123
  turnosIds: z.array(z.number()).min(1, "Debe seleccionar al menos un turno").max(3, "Máximo 3 turnos/bloques"),
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