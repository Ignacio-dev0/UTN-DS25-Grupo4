import prisma from "../config/prisma";
import * as horarioInterface from "../types/horarioCronograma.types"

export const createHorario = async(data: horarioInterface.CreateHorario) => {
    //const [hour, minute] = data.hora.split(':').map(Number);
    //const horaDate = new Date();
    //horaDate.setHours(hour, minute, 0, 0);
    return prisma.horarioCronograma.create({
        data: {
            horaInicio: data.horaInicio ,
            horaFin: data.horaFin,
            cancha: {
                connect: {
                    id: data.canchaId
                }
            }
        }
    });
};

export async function getHorariosByCanchaId(canchaId: number) {
    return prisma.horarioCronograma.findMany({
        where: {
            canchaId: canchaId,
        },
        
    });
};


