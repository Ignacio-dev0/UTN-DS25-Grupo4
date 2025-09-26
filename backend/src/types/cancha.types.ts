import { Cancha } from '@prisma/client';

export interface CreateCanchaRequest {
	nroCancha?: number, // Ahora es opcional, se genera automáticamente
	nombre?: string,
  descripcion?: string,
	image?: string[],
	complejoId: number,
	deporteId: number,
}

export interface UpdateCanchaRequest {
	nroCancha?: number,
	nombre?: string,
	descripcion?: string,
	image?: string[],
	activa?: boolean,
	deporteId?: number,
}

// Tipo para cancha con relaciones incluidas
export interface CanchaConRelaciones {
	id: number;
	nombre: string | null;
	nroCancha: number;
	descripcion: string | null;
	puntaje: number;
	image: string[];
	activa: boolean;
	precioHora: number | null;
	deporte: {
		id: number;
		nombre: string;
	};
	complejo: {
		id: number;
		nombre: string;
		domicilio: {
			id: number;
			calle: string;
			altura: number;
			localidad: {
				id: number;
				nombre: string;
			};
		};
	};
	cronograma: {
		id: number;
		diaSemana: string;
		horaInicio: Date;
		horaFin: Date;
		precio: number;
	}[];
}

export interface CanchaResponse {
	cancha: Cancha,
	message: string,
}

export interface CanchaListResponse {
	canchas: CanchaConRelaciones[],
	total: number,
}

