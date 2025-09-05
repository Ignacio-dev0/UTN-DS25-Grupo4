
import { Complejo } from "../generated/prisma";

export interface createComplejoType {
    nombre: string;
    descripcion: string;
    puntaje: number;
    propietarios: number[];
    solicitud: {
        cuit: number;
    };
    domicilio:{
        calle: string;
        altura: number;
        localidadId: number;
    }
}

export interface UpdateComplejoRequest {
	nombre?: string;
	descripcion?: string;
	porcentajeReembolse?: number;
	propietarios: number[];
}

export interface ComplejoResponse{
	complejo: Complejo
	mensaje: String
}

export interface ComplejoListResponse {
	complejos: Complejo[]
	mensaje: string
}