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
      complejo: {
        include: {
          domicilio: {
            include: {
              localidad: true
            }
          }
        }
      }, // Para obtener datos del complejo con localidad
      turnos: {
        where: {
          fecha: {
            gte: new Date(), // Solo turnos futuros
          }
        },
        take: 5, // Solo los próximos 5 turnos
        orderBy: {
          fecha: 'asc'
        }
      }
    },
  });
};

export const obtenerCanchasPorComplejoId = (complejoId: number) => {
  return prisma.cancha.findMany({
    where: {
      complejoId: complejoId, // Corregir: debe filtrar por complejoId, no por id
    },
    include: {
      deporte: true,
      complejo: {
        include: {
          domicilio: {
            include: {
              localidad: true
            }
          }
        }
      },
      turnos: {
        where: {
          fecha: {
            gte: new Date(),
          }
        },
        take: 5,
        orderBy: {
          fecha: 'asc'
        }
      }
    },
  });
};

export const obtenerCanchaPorId = (id: number) => {
  return prisma.cancha.findUnique({
    where: { id },
    include: {
      deporte: true,
      complejo: {
        include: {
          domicilio: {
            include: {
              localidad: true
            }
          }
        }
      },
      turnos: {
        where: {
          fecha: {
            gte: new Date(),
          }
        },
        orderBy: {
          fecha: 'asc'
        }
      }
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