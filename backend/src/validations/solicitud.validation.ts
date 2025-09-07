import { z } from "zod";
import { EstadoSolicitud } from "../generated/prisma";

export const estadoSolicitudSchema = z.enum([
    EstadoSolicitud.APROBADA,
    EstadoSolicitud.PENDIENTE,
    EstadoSolicitud.RECHAZADA
])

export const updateSolicitudSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
    body: z.object({
        estado: estadoSolicitudSchema.optional(),
        adminId: z.int().positive('El id del Administrador eber ser un numero positivo').optional()
    })
})