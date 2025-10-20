export interface CreateTurno {
    horaInicio: string;
    fecha: Date;
    precio: number;
    canchaId: number;
}

export interface UpdateTurno {
    horaInicio?: string;
    fecha?: Date;
    precio?: number;
    canchaId?: number;
    reservado?: boolean;
    deshabilitado?: boolean;
    alquilerId?: number | null;
}

