import { z } from "zod";
import { EstadoSolicitud } from "@prisma/client";

export const updateSolicitudSchema = z.object({
  estado: z.enum(EstadoSolicitud).optional(),
  adminId: z.int().positive('El id del Administrador eber ser un numero positivo').optional()
});