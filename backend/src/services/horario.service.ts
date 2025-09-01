import prisma from "../config/prisma";
import * as horarioInterface from "../types/horarioCronograma.types"
import { HorarioCronograma } from "../generated/prisma";
import { primitiveTypes } from "zod/v4/core/util.cjs";
import { date } from "zod";

export const createHorario = async(data: horarioInterface.CreateHoraio) => {
    const [hour, minute] = data.hora.split(':').map(Number);
    const horaDate = new Date();
    horaDate.setHours(hour, minute, 0, 0);
    return prisma.horarioCronograma.create({
        data: {
            hora: horaDate,
            precio
        }
    });
}

export const getAllHorariosCancha = async (): Promise<HorarioCronograma[]> => {
    return await prisma.horarioCronograma.findMany();
}

export const getHorariaCanchaId = async (id: number) => {
    return await prisma.horarioCronograma.findMany(
        {where: {
        canchaId: id,
        },
        orderBy:{
            diaSemana: 'asc',
        }
    })

    if (getHorariaCanchaId.length <= 0){
        console.log(`no se encontraron horarios para esta cancha con id ${id}`);
    }

    return getHorariaCanchaId;
}


