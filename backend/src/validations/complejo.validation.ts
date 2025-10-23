import { EstadoComplejo } from "@prisma/client";
import { z } from "zod";

export const crearComplejo = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().min(10, 'La descripcion del complejo debe ser de minimo 10 caracteres').max(1000, 'La descripcion del complejo debe ser menor a 1000 caracteres').nonempty().nonoptional(),
    image: z.string().optional(),
    cuit: z.coerce.string(),
    domicilio: z.object({
        calle: z.string().nonempty('El campo de la calle no puede estar vacio').nonempty(),
        altura: z.number().int().nonnegative().min(1,('La altura debe ser mayo a 1')),
        localidadId: z.number().int().nonnegative('El ID de la localidad debe ser mayoy a 0')
    }),
    usuarioId: z.number().int().nonnegative('El id del Dueño debe ser mayor a 0')
});

export const updateComplejo = z.object({
  nombre: z.string().min(3).optional(),
  descripcion: z.string().optional(), // Removemos la validación mínima para updates
  image: z.union([z.string(), z.null()]).optional(),
  horarios: z.string().optional(),
  servicios: z.array(z.number().int().positive()).optional() // Array de IDs de servicios
});

export const evaluarComplejo = z.object({
  estado: z.enum(EstadoComplejo)
});

export type CreateComplejoRequest = z.infer<typeof crearComplejo>
export type UpdateComplejoRequest = z.infer<typeof updateComplejo>
export type EvaluarComplejoRequest = z.infer<typeof evaluarComplejo>