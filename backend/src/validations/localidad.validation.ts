import {z} from "zod";

export const crearLocalidad = z.object({
    //Validacion de nombre
    nombre: z.string().min(3,"La locaclidad debe tener al menos 3 caracteres"),
});

export const actualizarLocalidad = z.object({
    nombre: z.string().min(3 , "La localidad debe al menos tener 3 caracteres"),
})
