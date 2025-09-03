import { HorarioCronograma } from "../generated/prisma";

export interface CreateHorario {
    horaInicio: string;
    horaFin: string;
    canchaId: number;
}

export interface UpdateCronograma{
    horaInicio?: string;
    horaFin?: string;
}

export interface HorarioListForCanchaId {
    horario: HorarioCronograma[];
    total: number;
}
