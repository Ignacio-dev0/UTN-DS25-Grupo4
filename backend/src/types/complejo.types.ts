import { Complejo } from "../generated/prisma";

export interface CreateComplejoRequest {
    nombre: string;
    descripcion?: string;
    image?: string;
    usuarioId: number;

    domicilio:{
        calle: string;
        altura: number;
        localidadId: number;
    };

    solicitud: {
        cuit: string;
    };
}

export interface UpdateComplejoRequest {
    nombre?: string;
    descripcion?: string;
    puntaje?: number;
    image?: string;
}

export interface ComplejoResponse {
	complejo: Complejo
	mensaje: string
}

export interface ComplejoResponseList {
    complejos: Complejo[]
    total: number;
}