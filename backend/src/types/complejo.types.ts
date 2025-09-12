import { Complejo } from "@prisma/client";

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
    image?: string;
    horarios?: string;
    servicios?: number[]; // Array de IDs de servicios
    // Nota: puntaje se calcula automáticamente desde las reseñas, no debe ser editable
}

export interface ComplejoResponse {
	complejo: Complejo
	mensaje: string
}

export interface ComplejoResponseList {
    complejos: Complejo[]
    total: number;
}