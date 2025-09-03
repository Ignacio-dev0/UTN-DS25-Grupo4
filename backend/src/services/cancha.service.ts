// backend/src/services/cancha.service.ts
import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export const crearCancha = (data: Prisma.CanchaCreateInput) => {
  return prisma.cancha.create({
    data,
  });
};

export const obtenerCanchas = () => {
  return prisma.cancha.findMany({
    include: {
      deporte: true, // Para saber qué deporte se juega en la cancha
    },
  });
};

export const obtenerCanchasPorComplejoId = (complejoId: number) => {
  return prisma.cancha.findMany({
    where: {
      id: complejoId,
    },
    include: {
      deporte: true,
    },
  });
};

export const obtenerCanchaPorId = (id: number) => {
  return prisma.cancha.findUnique({
    where: { id },
    include: {
      deporte: true,
      complejo: true, // Para saber a qué complejo pertenece
    },
  });
};

export const actualizarCancha = (id: number, data: Prisma.CanchaUpdateInput) => {
  return prisma.cancha.update({
    where: { id },
    data,
  });
};


export const eliminarCancha = (id: number) => {
  return prisma.cancha.delete({
    where: { id },
  });
};