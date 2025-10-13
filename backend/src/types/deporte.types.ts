import { Cancha, Deporte } from "@prisma/client";

export interface CreateDeporteResquest{
    name: string;
    icono?: string;
}

export interface UpdateDeporteResquest{
    name?: string;
    icono?: string;
    cancha?: Cancha[];
}

export interface DeporteResponse{
    deporte: Deporte;
    message: string;
}

export interface DeporteListResponse{
    deportes: Deporte[];
    total: number;
    message?: string;
}