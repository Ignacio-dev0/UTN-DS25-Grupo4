import { Cancha } from '@prisma/client';

export interface CreateCanchaRequest {
	nroCancha: number,
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

export interface CanchaResponse {
	cancha: Cancha,
	message: string,
}

export interface CanchaListResponse {
	canchas: Cancha[],
	total: number,
}

