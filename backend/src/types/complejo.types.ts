
import { Complejo } from "../generated/prisma";

export interface CreateComplejoRequest {
/*
	// El complejo se instancia cuando un administrador acepta una solicitud,
	// en ese momento no se tiene la informacion de estos atributos
	nombre: string;
	descripcion: string;
	porcentajeReembolso: number;
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
	*/
	propietario: Propietario
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