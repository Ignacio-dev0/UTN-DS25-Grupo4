import prisma from '../config/prisma';
import { Turno} from '../generated/prisma';
import { CreateTurnoRequest, UpdateTurnoRequest } from '../types/turno.types';

export async function createTurno(data: CreateTurnoRequest): Promise<Turno>{
  const { canchaId, ...turno } = data;  
  const created = await prisma.turno.create({
    data: {
      ...turno,
      cancha: {
        connect: { id: canchaId }
      },
    }
  });
  return created
}

export async function getAllTurnos(): Promise<Turno[]> {
  return await prisma.turno.findMany();
}

export async function getTurnoById(id: number): Promise<Turno> {
  const turno = await prisma.turno.findUnique({
    where: { id },
  });
  if (!turno) throw ('Turno no encontrado');
  return turno;
}

export async function updateTurno(id: number, data: UpdateTurnoRequest): Promise<Turno> {
  const turno = await prisma.turno.update({
    where: { id },
    data,
  });
  if (!turno) throw ('Turno no encontrado');
  return turno;
}

export async function deleteTurno(id: number): Promise<Turno> {
  const turno = await prisma.turno.delete({
    where: { id },
  });
  if (!turno) throw ('Turno no encontrado');
  return turno;
}