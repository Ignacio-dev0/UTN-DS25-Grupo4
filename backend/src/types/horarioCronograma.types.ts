import { HorarioCronograma, DiaSemana } from "../generated/prisma";

export interface CreateHorario {
    horaInicio: string;
    horaFin: string;
    diaSemana: DiaSemana;
    canchaId: number;
}

export interface UpdateCronograma{
    horaInicio?: string;
    horaFin?: string;
    diaSemana?: DiaSemana;
}

export interface HorarioListForCanchaId {
    horario: HorarioCronograma[];
    total: number;
}
