import { Resenia } from "../generated/prisma";

export interface CreateReseniaRequest {
    descripcion: string;
    puntaje: number; // Entre 1 y 5
    alquilerId: number;
}

export interface UpdateReseniaRequest {
    descripcion?: string;
    puntaje?: number; // Entre 1 y 5
}

export interface ReseniaResponse {
    resenia: Resenia;
    message: string;
}

export interface ReseniaListResponse {
    resenas: Resenia[];
    total: number;
}

export interface ReseniaWithDetailsResponse {
    resenia: Resenia & {
        alquiler: {
            cliente: {
                nombre: string;
                apellido: string;
                image?: string;
            };
            turnos: Array<{
                cancha: {
                    nroCancha: number;
                    complejo: {
                        nombre: string;
                    };
                    deporte: {
                        nombre: string;
                    };
                };
            }>;
        };
    };
    message: string;
}
