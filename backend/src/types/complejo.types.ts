
import { Complejo } from "../generated/prisma";

export interface createComplejoType {
    nombre: string;
    descripcion: string;
    puntaje: number;
    image: string;
    domicilio:{
        calle: string;
        altura: number;
        localidadId: number;
    }
    usuarioId: number;
    solicitud: {
        cuit: number;
    };
}

export interface updateComplejo {
    nombre?: string;
    descripcion?: string;
    puntaje?: number;
    image?: string;
}

export interface ComplejoResponse{
	complejo: Complejo
	mensaje: String
}

export interface complejoResponseList {
    complejos: Complejo[]
    total: number;
}