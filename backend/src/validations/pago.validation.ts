import { z } from 'zod';

export const metodoPagoShema = z.enum(['DEBITO', 'CREDITO', 'TRANSFERENCIA']);

export const crearPagoShema = z.object({
    codigoTransaccion: z.string().min(3, 'El codigo de transaccion debe tener al menos 3 caracteres').optional(),
    monto: z.number().min(0, 'El monto debe ser mayor a 0'),
    metodoPago: metodoPagoShema,
});

export const actulizarPagoShema = z.object({
    codigoTransaccion: z.string().min(3, 'El codigo de transaccion debe tener al menos 3 caracteres').optional(),
    monto: z.number().min(0, 'El monto debe ser mayor a 0').optional(),
    metodoPago: metodoPagoShema.optional(),
});