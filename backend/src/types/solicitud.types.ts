import { EstadoSolicitud } from "../generated/prisma";

export interface createSolicitud{
    cuit: number,
    estado: EstadoSolicitud,
    evaluadorId: number 
}

export interface updateSolicitud{
    estado?: EstadoSolicitud,
}