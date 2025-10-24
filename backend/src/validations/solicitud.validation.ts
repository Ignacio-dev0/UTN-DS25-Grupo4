import { z } from "zod";
import { EstadoComplejo } from "@prisma/client";

export const updateSolicitudSchema = z.object({
  estado: z.nativeEnum(EstadoComplejo).optional(),
  adminId: z.number().int().positive().optional()
});