import {z} from "zod";

export const crearLocalidad = z.object({
    body: z.object({
        //Validacion de nombre
        nombre: z.string().min(3,"La locaclidad debe tener al menos 3 caracteres"),
    })
});

export const actualizarLocalidad = z.object({
    params: z.object({
        id: z.coerce.number().int().positive("El id debe ser un numero positivo")
    }),
    body: z.object({
        nombre: z.string().min(3,'El nombre de la Localidad debe tener al menos 3 carateres').optional()
    })
})
