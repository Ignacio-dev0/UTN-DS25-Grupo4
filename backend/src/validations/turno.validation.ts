import { z } from "zod";

export const crearTurnoSchema = z.object({
  body: z.object({
    hora: z.string().min(1, "Hora es requerida"),
    fecha: z.string().transform((str) => new Date(str)),
    precio: z.number().positive("El precio debe ser mayor a 0"),
    canchaId: z.number().int().positive("ID de cancha debe ser válido")
  })
});

export const actualizarTurnoSchema = z.object({
  body: z.object({
    hora: z.string().min(1, "Hora es requerida").optional(),
    fecha: z.string().transform((str) => new Date(str)).optional(),
    precio: z.number().positive("El precio debe ser mayor a 0").optional(),
    canchaId: z.number().int().positive("ID de cancha debe ser válido").optional()
  })
});

export const turnoIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID es requerido")
  })
});

export const turnosCanchaSchema = z.object({
  params: z.object({
    canchaId: z.string().min(1, "ID de cancha es requerido")
  })
});
