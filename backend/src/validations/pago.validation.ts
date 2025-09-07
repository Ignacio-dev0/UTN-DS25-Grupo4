import { z } from 'zod';
import {MetodoPago} from '../generated/prisma/client';//estaba mal importado el cliente

export const metodoPagoShema = z.enum([
    MetodoPago.DEBITO,
    MetodoPago.CREDITO,
    MetodoPago.TRANSFERENCIA,
])
//ya que en el middleware definimos que se van a validar body, query, params es necesario envolver los atributos en el objeto body
export const crearPagoShema = z.object({
    body: z.object({
        codigotransaccion: z.string().min(3 ,'El codigo de transaccion debe al menos 3 caracteres').optional(),
        metodoPago: metodoPagoShema,
        monto: z.number().min(3 , 'El monto debe tener al menos 3 digitos').nonnegative(),
        alquilerId: z.number().int().positive(),
    })
});

export const actulizarPagoShema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive().nonoptional()
    }),
    body: z.object({
        codigotransaccion: z.string().min(3 ,'El codigo de transaccion debe al menos 3 caracteres').optional(),
        metodoPago: metodoPagoShema.optional(),
        monto: z.number().min(3 , 'El monto debe tener al menos 3 digitos').nonnegative().optional(),//no existe float en zod number sirve 
    })
});