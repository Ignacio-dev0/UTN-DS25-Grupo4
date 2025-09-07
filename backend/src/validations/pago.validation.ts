import { z } from 'zod';
import {MetodoPago} from '../generated/prisma/client';

export const metodoPagoShema = z.enum([
    MetodoPago.DEBITO,
    MetodoPago.CREDITO,
    MetodoPago.TRANSFERENCIA,
]);

export const crearPagoShema = z.object({
    body: z.object({
        codigoTransaccion: z.string().min(3, 'El codigo de transaccion debe tener al menos 3 caracteres').optional(),
        metodoPago: metodoPagoShema,
        monto: z.number().min(0, 'El monto debe ser mayor a 0').nonnegative(),
        alquilerId: z.number().int().positive(),
    })
});

export const actulizarPagoShema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
    body: z.object({
        codigoTransaccion: z.string().min(3, 'El codigo de transaccion debe tener al menos 3 caracteres').optional(),
        metodoPago: metodoPagoShema.optional(),
        monto: z.number().min(0, 'El monto debe ser mayor a 0').nonnegative().optional(),
    })
});