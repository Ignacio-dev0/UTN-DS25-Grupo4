
import { Solicitud, EstadoSolicitud, Documentacion, Usuario } from '../generated/prisma';

export interface CreateSolicitudRequest{
  cuit: Number,
	estado: EstadoSolicitud,
	documentos: Documentacion[],
	emisor: Usuario
}

export interface UpdateSolicitudRequest{
  estado: EstadoSolicitud,
	evaluador: Usuario
}

export interface SolicitudResponse{
    solicitud: Solicitud;
    message: string;
}

export interface SolicitudListResponse{
    solicitudes: Solicitud[];
    total: number;

}