
import { Numeric } from "zod/v4/core/util.cjs";
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

export interface updateComplejo {
    nombre?: string;
    descripcion?: string;
    porcentajeReembolse?: number;
    propietarios: number[];
}

export interface complejoResponse{
    complejo: Complejo
    mensaje: String
}

export interface complejoResponseList {
    complejos: Complejo[]
    mensaje: string
}

