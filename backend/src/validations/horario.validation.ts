import { z } from "zod";

const params = z.object({
  canchaId: z.string().min(1, "ID de cancha es requerido")
});

export const crearHorario = z.object({
  body: z.object({
    horaInicio: z.string().min(1, "Hora de inicio es requerida"),
    horaFin: z.string().min(1, "Hora de fin es requerida"),
    canchaId: z.number().int().positive("ID de cancha debe ser válido")
  })
});

export const updateHorario = z.object({
  params,
  body: z.object({
    horaInicio: z.string().min(1, "Hora de inicio es requerida").optional(),
    horaFin: z.string().min(1, "Hora de fin es requerida").optional(),
    canchaId: z.number().int().positive("ID de cancha debe ser válido").optional()
  })
});

export const getHorarioById = z.object({ params });
