import { z } from 'zod';
import {MetodoPago} from '@prisma/client';

export const metodoPagoShema: z.enum([
    MetodoPago.DEBITO,
    MetodoPago.CREDITO,
    MetodoPago.TRANSFERENCIA,
]);

export const crearPagoShema = z.object({
    codigoTransaccion: z.string().optional().min(3 ,'El codigo de transaccion debe al menos 3 caracteres'),
    monto: z.float().min(3 , 'El monto debe tener al menos 3 digitos'),
    metodoPago: metodoPagoShema,
});

export const actulizarPagoShema = z.object({
    codigoTransaccion: z.string().optional().min(3 ,'El codigo de transaccion debe al menos 3 caracteres'),
    monto: z.float().min(3 , 'El monto debe tener al menos 3 digitos'),
    metodoPago: metodoPagoShema,
});