import prisma from '../config/prisma';
import { Prisma, Administrador } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function crearAdministrador(data: { email: string; password: string }): Promise<Administrador> {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.administrador.create({ 
      data: {
        email: data.email,
        password: hashedPassword,
        rol: 'ADMINISTRADOR'
      }
    });
  } catch (error) {
    throw (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      ? new Error('Email ya registrado')
      : error;
  }
}

export async function obtenerAdministradorPorId(id: number): Promise<Administrador | null> {
  return await prisma.administrador.findUnique({
    where: { id },
    include: { complejosEvaluados: true }
  });
}

export async function obtenerAdministradores(): Promise<any[]> {
  return await prisma.administrador.findMany({
    select: {
      id: true,
      email: true,
      rol: true
      // No incluir password
    }
  });
}

export async function actualizarAdministrador(id: number, data: { email?: string; password?: string }): Promise<Administrador> {
  try {
    const updateData: any = {};
    
    if (data.email) {
      updateData.email = data.email;
    }
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.administrador.update({
      where: { id },
      data: updateData
    });
  } catch (error) {
    throw (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      ? new Error('Email ya registrado')
      : error;
  }
}

export async function eliminarAdministrador(id: number): Promise<Administrador> {
  return await prisma.administrador.delete({
    where: { id }
  });
}