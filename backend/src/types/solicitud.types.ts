
import { Solicitud, EstadoSolicitud, Usuario } from '@prisma/client';

export interface CreateSolicitudRequest{
  cuit: string,
	estado: EstadoSolicitud,
	usuarioId: number;
}

export interface UpdateSolicitudRequest {
  estado: EstadoSolicitud,
	evaluadorId?: number;
}

export interface SolicitudResponse {
  solicitud: Solicitud;
  message: string;
}

export interface SolicitudListResponse{
    solicitudes: Solicitud[];
    total: number;
}