export interface CreateTurno {
    hora: string;
    fecha: Date;
    precio: number;
    canchaId: number;
}

export interface UpdateTurno {
    hora?: string;
    fecha?: Date;
    precio?: number;
    canchaId?: number;
}
