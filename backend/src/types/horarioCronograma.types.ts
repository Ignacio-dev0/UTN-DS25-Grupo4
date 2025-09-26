import { HorarioCronograma, DiaSemana } from "@prisma/client";

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
