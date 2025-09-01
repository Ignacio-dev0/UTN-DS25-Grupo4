import { DiaSemana, HorarioCronograma } from "../generated/prisma";

export interface CreateHoraio {
    hora: string;
    precio: number;
    diaSemana: DiaSemana;
    canchaId: number;
}

export interface UpdateCronograma{
    hora?: string;
    precio?: number;
    diaSemana?: DiaSemana;
    canchaId: number;
}

export interface HorarioListForCanchaId {
    horario: HorarioCronograma[];
    total: number;
}
