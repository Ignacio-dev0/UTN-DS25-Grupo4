import { z } from "zod";

export const crearTurnoSchema = z.object({
  horaInicio: z.transform((str) => new Date(`1970-01-01T03:${str}.000Z`)),
  fecha: z.string().transform((str) => new Date(str)),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  canchaId: z.number().int().positive("ID de cancha debe ser válido")
});

export const actualizarTurnoSchema = z.object({
  horaInicio: z.coerce.string().min(1, "Hora es requerida").optional(),
  fecha: z.string().transform((str) => new Date(str)).optional(),
  precio: z.number().positive("El precio debe ser mayor a 0").optional(),
  canchaId: z.number().int().positive("ID de cancha debe ser válido").optional()
});

