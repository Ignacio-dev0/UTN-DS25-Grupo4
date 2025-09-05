import { z } from 'zod';

export const crearDomicilioShema = z.object({
    //Validacion de calle
    calle: z.string().min(3 ,"La calle debe tener mas de 3 caracteres"),
    //Validacion de altura
    altura: z.number().int().min(1 , "La altura debe tener al menos un caracter"),
})

export const actualizarDomicilioShema = z.object({
    calle: z.string(),
    altura: z.number().min(1 , 'La altura debe tener un digito') 
})