import prisma from '../config/prisma';
import { Administrador } from '../generated/prisma';
import { CreateAdministradorRequest, AdministradorResponse, AdministradorListResponse } from '../types/administrador.types';

export async function crearAdministrador(data: CreateAdministradorRequest) {
  return await prisma.administrador.create({ data });
}

export async function obtenerAdministradorPorId(id: number) {
  return await prisma.administrador.findUnique({
    where: { id },
  });
}

export async function obtenerAdministradores() {
  return await prisma.administrador.findMany();
}