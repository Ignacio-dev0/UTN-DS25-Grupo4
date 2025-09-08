import { Turno, Alquiler, Cancha } from '../generated/prisma';

export interface CreateTurnoRequest {
    fecha: Date;
    horaInicio: Date;
    precio: number;
    canchaId: number;
    reservado?: boolean;
}
export interface UpdateTurnoRequest {
    fecha?: Date;
    horaInicio?: Date;
    precio?: number;
    reservado?: boolean;
    alquilerId?: number;
}
export interface TurnoResponse {
    turno: Turno | null;
    message: string;
}
export interface TurnoListResponse {
    turnos: Turno[];
    total: number;
    message: string;
}
// export interface TurnoWithRelations extends Turno {
//     cancha?: Cancha;
//     alquiler?: Alquiler;
// }

