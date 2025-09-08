import prisma from "../config/prisma";
import * as horarioInterface from "../types/horarioCronograma.types"

export const createHorario = async(data: horarioInterface.CreateHorario) => {
    return prisma.horarioCronograma.create({
        data: {
            horaInicio: data.horaInicio ,
            horaFin: data.horaFin,
            diaSemana: data.diaSemana,
            cancha: {
                connect: {
                    id: data.canchaId
                }
            }
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
};

export async function getAllHorarios() {
    return prisma.horarioCronograma.findMany({
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}

export async function getHorarioById(id: number) {
    return prisma.horarioCronograma.findUnique({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}

export async function getHorariosByCanchaId(canchaId: number) {
    return prisma.horarioCronograma.findMany({
        where: {
            canchaId: canchaId,
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}

export async function updateHorario(id: number, data: horarioInterface.UpdateCronograma) {
    return prisma.horarioCronograma.update({
        where: { id },
        data: {
            ...(data.horaInicio && { horaInicio: data.horaInicio }),
            ...(data.horaFin && { horaFin: data.horaFin }),
            ...(data.diaSemana && { diaSemana: data.diaSemana })
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}

export async function deleteHorario(id: number) {
    return prisma.horarioCronograma.delete({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}