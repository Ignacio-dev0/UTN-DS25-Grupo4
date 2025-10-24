// DEPRECADO: La tabla Administrador fue eliminada
// Ahora se usa Usuario con rol ADMINISTRADOR
// Este archivo se mantiene comentado por si se necesita restaurar la funcionalidad

/*
import prisma from '../config/prisma';
import { Prisma, Administrador } from '@prisma/client';
import { CreateAdministradorRequest, AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';
import bcrypt from 'bcrypt';

export async function crearAdministrador(data: CreateAdministradorRequest): Promise<Administrador> {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
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
    include: { complejosEvaluados: true }
  });
}

export async function obtenerAdministradores(): Promise<Administrador[]> {
  return await prisma.administrador.findMany();
}

export async function eliminarAdministrador(id: number): Promise<Administrador> {
  return await prisma.administrador.delete({
    where: { id }
  });
}
*/

// Exportar funciones vacías para no romper imports
export async function crearAdministrador(): Promise<any> {
  throw new Error('Función deprecada - usar Usuario con rol ADMINISTRADOR');
}

export async function obtenerAdministradorPorId(): Promise<any> {
  throw new Error('Función deprecada - usar Usuario con rol ADMINISTRADOR');
}

export async function obtenerAdministradores(): Promise<any[]> {
  throw new Error('Función deprecada - usar Usuario con rol ADMINISTRADOR');
}

export async function eliminarAdministrador(): Promise<any> {
  throw new Error('Función deprecada - usar Usuario con rol ADMINISTRADOR');
}