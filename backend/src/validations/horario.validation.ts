import { z } from "zod";

export const crearHorarioSchema = z.object({
  body: z.object({
    horaInicio: z.string().min(1, "Hora de inicio es requerida"),
    horaFin: z.string().min(1, "Hora de fin es requerida"),
    canchaId: z.number().int().positive("ID de cancha debe ser válido")
  })
});

export const actualizarHorarioSchema = z.object({
  body: z.object({
    horaInicio: z.string().min(1, "Hora de inicio es requerida").optional(),
    horaFin: z.string().min(1, "Hora de fin es requerida").optional(),
    canchaId: z.number().int().positive("ID de cancha debe ser válido").optional()
  })
});

export const horarioIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID es requerido")
  })
});

export const horariosCanchaSchema = z.object({
  params: z.object({
    canchaId: z.string().min(1, "ID de cancha es requerido")
  })
});
