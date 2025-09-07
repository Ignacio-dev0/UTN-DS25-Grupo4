import { Cancha, Deporte } from "../generated/prisma";

export interface CreateDeporteResquest{
    nombre: string;
}

export interface UpdateDeporteResquest{
    nombre?: string;
    cancha?: Cancha[];
}

export interface DeporteResponse{
    deporte: Deporte;
    message: string;
}

export interface DeporteListResponse{
    deportes: Deporte[];
    total: number;
}