
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
  solicitud: any; 
  message: string;
}

export interface SolicitudListResponse{
    solicitudes: any[];
    total: number;
}