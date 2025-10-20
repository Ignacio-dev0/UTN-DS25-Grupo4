import { z } from "zod";

export const crearComplejoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').nonoptional(),
    descripcion: z.string().min(10, 'La descripcion del complejo debe ser de minimo 10 caracteres').max(1000, 'La descripcion del complejo debe ser menor a 1000 caracteres').nonempty().nonoptional(),
    puntaje: z.number().min(0, 'El puntaje no debe ser negativo').max(5, 'El puntaje debe ser menor igual a 5').nonoptional(),
    image: z.string().optional(),
    domicilio: z.object({
        calle: z.string().nonempty('El campo de la calle no puede estar vacio').nonempty().nonoptional(),
        altura: z.number().int().nonnegative().min(1,('La altura debe ser mayo a 1')).nonoptional(),
        localidadId: z.number().int().nonnegative('El ID de la localidad debe ser mayoy a 0').nonoptional()
    }),
    usuarioId: z.number().int().nonnegative('El id del Dueño debe ser mayor a 0').nonoptional(),
    solicitud: z.object({
        cuit: z.coerce.string(),
    })
});

export const updateComplejoSchema = z.object({
  nombre: z.string().min(3).optional(),
  descripcion: z.string().optional(), // Removemos la validación mínima para updates
  image: z.union([z.string(), z.null()]).optional(),
  horarios: z.string().optional(),
  servicios: z.array(z.number().int().positive()).optional() // Array de IDs de servicios
});