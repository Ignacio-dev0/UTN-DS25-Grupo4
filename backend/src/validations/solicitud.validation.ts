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
        adminId: z.number().int().nonnegative('El id del Administrador eber ser un numero positivo').optional()
    })
})

export const getSolicitudByIdSchema = z.object({
    params: z.object({
        id: z.number().int('Debe ser un numero').nonnegative().nonoptional('Se necesita el id para realizar la busqueda')
    })
})