import {z} from "zod";

export const crearLocalidad = z.object({
  nombre: z.string()
    .min(2, "La localidad debe tener al menos 2 caracteres")
    .max(100, "La localidad no puede exceder 100 caracteres")
    .trim()
    .transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()), // Capitalizar primera letra
});

export const actualizarLocalidad = z.object({
  nombre: z.string()
    .min(2, 'El nombre de la Localidad debe tener al menos 2 caracteres')
    .max(100, "La localidad no puede exceder 100 caracteres")
    .trim()
    .transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
    .optional()
});
