import { Alquiler, Pago, EstadoAlquiler, MetodoPago } from '../generated/prisma';

export interface CreateAlquilerRequest {
	usuarioId: number,
	turnosIds: number[],
}

export interface PagarAlquilerRequest {
	codigoTransaccion?: string,
	metodoPago: MetodoPago,
}

export interface UpdateAlquilerRequest {
	estado: EstadoAlquiler,
}

export interface AlquilerResponse {
	alquiler: Alquiler,
	message: string,
}

export interface AlquilerPagadoResponse {
	pago: Pago,
	alquiler: Alquiler,
	message: string,
}

export interface AlquilerListResponse {
	alquileres: Alquiler[],
	total: number,
}