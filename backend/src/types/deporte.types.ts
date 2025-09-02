import { Cancha, Deporte } from "../generated/prisma";

export interface CreateDeporteResquest{
    name: string;
}

export interface UpdateDeporteResquest{
    name?: string;
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