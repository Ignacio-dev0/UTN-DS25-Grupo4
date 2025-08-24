import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';


export const crearComplejo = (data: Prisma.ComplejoCreateInput) => {
  return prisma.complejo.create({
    data,
  });
};

export const obtenerComplejos = () => {
  return prisma.complejo.findMany({
    
    include: {
      localidad: true,
      duenios: true, // Para saber quiénes son los dueños
    },
  });
};


export const obtenerComplejoPorId = (id: number) => {
  return prisma.complejo.findUnique({
    where: { id },
    include: {
      localidad: true,
      canchas: true, 
      duenios: true,
    },
  });
};

export const actualizarComplejo = (id: number, data: Prisma.ComplejoUpdateInput) => {
  return prisma.complejo.update({
    where: { id },
    data,
  });
};

export const eliminarComplejo = (id: number) => {
  // Ojo: Prisma no permitirá eliminar un complejo si tiene
  // canchas u otros registros asociados que dependen de él.
  // Se necesitaría una lógica para manejar esas relaciones (ej: eliminarlas en cascada).
  return prisma.complejo.delete({
    where: { id },
  });
};