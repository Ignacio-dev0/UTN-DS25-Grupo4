import { z } from "zod";

export const crearHorario = z.object({
  horaInicio: z.string().min(1, "Hora de inicio es requerida"),
  horaFin: z.string().min(1, "Hora de fin es requerida"),
  canchaId: z.number().int().positive("ID de cancha debe ser válido")
});

export const updateHorario = z.object({
  horaInicio: z.string().min(1, "Hora de inicio es requerida").optional(),
  horaFin: z.string().min(1, "Hora de fin es requerida").optional(),
  canchaId: z.number().int().positive("ID de cancha debe ser válido").optional()
});
