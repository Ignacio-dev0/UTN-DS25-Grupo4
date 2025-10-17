import prisma from '../config/prisma';
import { Prisma, Administrador } from '@prisma/client';
import { CreateAdministradorRequest, AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';

export async function crearAdministrador(data: CreateAdministradorRequest): Promise<Administrador> {
  try {
    return await prisma.administrador.create({ data });
  } catch (error) {
    throw (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      ? new Error('Correo ya registrado')
      : error
  }
}

export async function obtenerAdministradorPorId(id: number): Promise<Administrador> {
  return await prisma.administrador.findUnique({
    where: { id },
    include: { solicitudesEvaluadas: true }
  });
}

export async function obtenerAdministradores(): Promise<Administrador[]> {
  return await prisma.administrador.findMany();
}