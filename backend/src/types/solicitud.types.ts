import { Solicitud, EstadoSolicitud, Documentacion, Usuario } from '../generated/prisma';

export interface CreateSolicitudRequest {
  cuit: number,
	estado: EstadoSolicitud,
	emisorId: number,	// dueño del complejo que emite la solicitud
	documentos: Documentacion[],
}

export interface UpdateSolicitudRequest {
  estado: EstadoSolicitud,
	evaluadorId: number,	// administrador que evalua la solicitud
}

export interface SolicitudResponse {
  solicitud: Solicitud;
  message: string;
}

export interface SolicitudListResponse {
	solicitudes: Solicitud[];
	total: number;
}