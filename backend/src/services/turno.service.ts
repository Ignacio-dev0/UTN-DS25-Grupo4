import { number } from 'zod';
import prisma from '../config/prisma';
import { Turno} from '../generated/prisma';
import { CreateTurno } from '../types/turno.types';

export async function createTurno(data: CreateTurno): Promise<Turno>{
    const created = await prisma.turno.create({
        data:{
            fecha: data.fecha,
            hora: data.hora,
            precio:data.precio,
            cancha:{
                connect:{id:data.canchaId}
            }
        }
    })

    return created
}

export async function getAllTurnos(): Promise<Turno[]> {
    const turnos = await prisma.turno.findMany();
    return turnos;
}