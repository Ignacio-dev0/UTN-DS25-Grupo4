// Tipos adaptados al nuevo modelo sin Solicitud
// Ahora usamos EstadoComplejo en lugar de EstadoSolicitud

import { EstadoComplejo, Usuario } from '@prisma/client';

export interface CreateSolicitudRequest{
  cuit: string,
	estado: EstadoComplejo,
	usuarioId: number;
}

export interface UpdateSolicitudRequest {
  estado: EstadoComplejo,
	evaluadorId?: number;
}

export interface SolicitudResponse {
  solicitud: any; // Ahora es un Complejo con estado
  message: string;
}

export interface SolicitudListResponse{
    solicitudes: any[]; // Ahora son Complejos con estado PENDIENTE
    total: number;
}