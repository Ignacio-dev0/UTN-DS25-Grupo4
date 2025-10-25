import { z } from 'zod';
import { EstadoAlquiler, MetodoPago } from '@prisma/client';

export const crearAlquiler = z.object({
  turnosIds: z.array(z.number()).min(1, "Debe seleccionar al menos un turno").max(3, "Máximo 3 turnos/bloques"),
  // Permite enviar el mismo turno múltiples veces para reservar bloques consecutivos
  // Ej: [123, 123, 123] = reservar 3 bloques consecutivos desde el turno 123
});

export const pagarAlquiler = z.object({
  metodoPago: z.enum(MetodoPago),
  codigoTransaccion: z.string().optional(),
});

export const actualizarAlquiler = z.object({
  estado: z.enum([
    EstadoAlquiler.CANCELADO,
    EstadoAlquiler.FINALIZADO,
  ]),
});

export type CrearAlquilerData = z.infer<typeof crearAlquiler>;
export type PagarAlquilerData = z.infer<typeof pagarAlquiler>;
export type ActualizarAlquilerData = z.infer<typeof actualizarAlquiler>;