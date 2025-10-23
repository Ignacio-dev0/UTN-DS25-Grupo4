import { Cancha, Deporte } from "@prisma/client";

export interface CreateDeporteResquest{
    nombre: string;
    icono?: string;
}

export interface UpdateDeporteResquest{
    nombre?: string;
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