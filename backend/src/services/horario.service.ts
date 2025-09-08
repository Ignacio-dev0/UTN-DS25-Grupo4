import prisma from "../config/prisma";
import { Prisma, HorarioCronograma, DiaSemana } from "../generated/prisma";
import { CreateHorario, UpdateCronograma } from "../types/horarioCronograma.types";

export async function getAllHorariosCronograma(): Promise<HorarioCronograma[]> {
    const horarios = await prisma.horarioCronograma.findMany({
        orderBy: [ { diaSemana: 'asc' }, { horaInicio: 'asc' } ],
        include: {
            cancha: true
        }
    });
    return horarios;
}

export async function getHorarioCronogramaById(id: number): Promise<HorarioCronograma | null> {
    const horario = await prisma.horarioCronograma.findUnique({
        where: { id },
        include: {
            cancha: true
        }
    });
    return horario;
}

export async function getHorariosCronogramaByCanchaId(canchaId: number, diaSemana?:DiaSemana): Promise<HorarioCronograma[]> {
    return prisma.horarioCronograma.findMany({
        where: {
            canchaId: canchaId,
            ...(diaSemana && { diaSemana: diaSemana })
        },
        orderBy: {
            horaInicio: 'asc'
        },
    });
}

export async function createHorarioCronograma (data: CreateHorario): Promise<HorarioCronograma>{
    return prisma.horarioCronograma.create({
        data: {
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            diaSemana: data.diaSemana,
            cancha: {
                connect: {
                    id: data.canchaId
                }
            }
        }
    });
};

export async function updateHorarioCronograma(id: number, data: UpdateCronograma): Promise<HorarioCronograma>{
    try {
        const updated = await prisma.horarioCronograma.update({
            where: { id },
            data: {
                ...(data.horaInicio !== undefined ? { horaInicio: data.horaInicio } : {}),
                ...(data.horaFin !== undefined ? { horaFin: data.horaFin } : {}),
                ...(data.diaSemana !== undefined ? { diaSemana: data.diaSemana } : {})
            }
        });
        return updated;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Horario no encontrado');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
};

export async function deleteHorarioCronograma(id: number): Promise<HorarioCronograma> {
    try {
        const deleted = await prisma.horarioCronograma.delete({ where: { id } });
        return deleted;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Horario no encontrado');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
};