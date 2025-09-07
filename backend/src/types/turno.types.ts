import { Turno } from '../generated/prisma';

export interface CreateTurnoRequest {
    fechaHora: Date;
    precio: number;
    canchaId: number;
}

export interface UpdateTurnoRequest {
  precio: number,
}

export interface TurnoResponse {
  turno: Turno,
  message: string,
}

export interface TurnoListResponse {
  turnos: Turno[],
  total: number,
}