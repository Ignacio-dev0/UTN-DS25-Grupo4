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
    const turnos = await prisma.turno.findMany({
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return turnos;
}

export async function getTurnoById(id: number): Promise<Turno | null> {
    const turno = await prisma.turno.findUnique({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return turno;
}

export async function getTurnosByCancha(canchaId: number): Promise<Turno[]> {
    const turnos = await prisma.turno.findMany({
        where: { canchaId },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return turnos;
}

export async function updateTurno(id: number, data: Partial<CreateTurno>): Promise<Turno> {
    const updated = await prisma.turno.update({
        where: { id },
        data: {
            ...(data.fecha && { fecha: data.fecha }),
            ...(data.hora && { hora: data.hora }),
            ...(data.precio && { precio: data.precio }),
            ...(data.canchaId && { 
                cancha: {
                    connect: { id: data.canchaId }
                }
            })
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return updated;
}

export async function deleteTurno(id: number): Promise<Turno> {
    const deleted = await prisma.turno.delete({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return deleted;
}