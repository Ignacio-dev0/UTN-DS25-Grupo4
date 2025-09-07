import { z } from 'zod';
//faltaba el body por que son los datos que cargas
export const crearDomicilioShema = z.object({
    body: z.object({
        //Validacion de calle
        calle: z.string().min(3 ,"La calle debe tener mas de 3 caracteres"),
        //Validacion de altura
        altura: z.number().int().min(1 , "La altura debe tener al menos un caracter"),
    })
})
//falta el params que es el id que pasas en la url
//faltaba el body para pasar lo que queres modificar
export const actualizarDomicilioShema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('el id proporcionado para buscar el domicilio debe ser un numero positivo')
    }),
    body: z.object({
        calle: z.string().optional(),
        altura: z.number().min(1 , 'La altura debe tener un digito').optional(), 
    })
})